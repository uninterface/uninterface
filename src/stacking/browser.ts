import type { ZDomain } from './domain'
import { UiZOrderError, type UiZHandle, type ZSnapshot } from './model'

export interface ZRenderTarget {
  readonly handle: UiZHandle
  /** The actual positioning/stacking wrapper, not its trigger or an inner label. */
  readonly element: HTMLElement
  /** Explicit physical host, independent of logical parentage. */
  readonly host: HTMLElement
  /** Owned teleports may move the same target after its initial attachment. */
  readonly currentHost?: () => HTMLElement
  readonly mode: 'css' | 'dialog' | 'popover'
}

function contextReason(style: CSSStyleDeclaration): string | undefined {
  if (style.display === 'contents') return undefined
  if (['fixed', 'sticky'].includes(style.position)) return style.position
  if (
    style.position &&
    style.position !== 'static' &&
    style.zIndex &&
    style.zIndex !== 'auto'
  )
    return 'positioned z-index'
  if (style.opacity && Number(style.opacity) < 1) return 'opacity'
  for (const key of [
    'transform',
    'translate',
    'rotate',
    'scale',
    'filter',
    'backdropFilter',
    'perspective',
  ] as const)
    if (style[key] && style[key] !== 'none') return key
  if (style.isolation === 'isolate') return 'isolation'
  if (style.mixBlendMode && style.mixBlendMode !== 'normal')
    return 'mix-blend-mode'
  if (/paint|layout|strict|content/.test(style.contain)) return 'contain'
  if (/transform|opacity|filter|perspective/.test(style.willChange))
    return 'will-change'
  if (style.clipPath && style.clipPath !== 'none') return 'clip-path'
  if (style.maskImage && style.maskImage !== 'none') return 'mask'
  return undefined
}

/** Shared physical projection; native appearance/placement and focus stay with the view. */
export function createZBrowser(domain: ZDomain) {
  const targets = new Map<HTMLElement, ZRenderTarget>()
  const candidates = new Map<HTMLElement, ZRenderTarget[]>()
  const cleanups = new Map<HTMLElement, () => void>()
  const liveTop: UiZHandle[] = []
  let disposed = false
  const value = (snapshot: ZSnapshot, handle: UiZHandle) =>
    snapshot.entries.find((e) => e.handle === handle)?.value
  function fail(message: string, target: ZRenderTarget): never {
    throw new UiZOrderError('realization', message, [target.handle.label])
  }
  function validateHost(target: ZRenderTarget) {
    const { element, mode } = target
    const host = target.currentHost?.() ?? target.host
    if (element.ownerDocument !== host.ownerDocument)
      fail('render target and host belong to different documents.', target)
    if (!host.contains(element) || host === element)
      fail('the declared host must contain the target.', target)
    if (mode !== 'css') return
    const window = element.ownerDocument.defaultView!
    for (
      let ancestor = element.parentElement;
      ancestor && ancestor !== host;
      ancestor = ancestor.parentElement
    ) {
      const managed = targets.get(ancestor)
      if (
        managed &&
        domain.describe(target.handle)?.chain.includes(managed.handle)
      )
        continue
      const style = window.getComputedStyle(ancestor)
      const reason = contextReason(style)
      const parentStyle =
        ancestor.parentElement &&
        window.getComputedStyle(ancestor.parentElement)
      const flexContext =
        style.display !== 'contents' &&
        parentStyle &&
        /flex|grid/.test(parentStyle.display) &&
        style.zIndex &&
        style.zIndex !== 'auto'
      if (reason || flexContext)
        fail(
          `unregistered ${reason ?? 'flex/grid z-index'} context between target and host.`,
          target,
        )
      if (
        /hidden|clip|auto|scroll/.test(`${style.overflowX} ${style.overflowY}`)
      )
        fail(
          'intermediate clipping/scrolling boundary requires an explicit host.',
          target,
        )
    }
  }
  function validate(snapshot: ZSnapshot) {
    let last = -1
    for (const handle of liveTop) {
      const next = value(snapshot, handle)
      // Actual disappearance cannot be vetoed. The owner closes/releases its native target.
      if (next === undefined) continue
      if (next <= last)
        fail(
          'arbitrary live native top-layer reordering is unsupported.',
          [...targets.values()].find((t) => t.handle === handle)!,
        )
      last = next
    }
  }
  function apply(target: ZRenderTarget, snapshot = domain.snapshot) {
    const available = (candidates.get(target.element) ?? [target]).filter((t) =>
      snapshot.entries.some((e) => e.handle === t.handle && e.materialized),
    )
    available.sort(
      (a, b) =>
        (domain.describe(a.handle)?.chain.length ?? 0) -
        (domain.describe(b.handle)?.chain.length ?? 0),
    )
    target = available.at(-1) ?? target
    targets.set(target.element, target)
    const z = value(snapshot, target.handle)
    if (z === undefined) return
    const style = target.element.style
    if (
      style.getPropertyValue('z-index') !== String(z) ||
      style.getPropertyPriority('z-index') !== 'important'
    )
      style.setProperty('z-index', String(z), 'important')
  }
  const unvalidate = domain.validate(validate)
  const unsubscribe = domain.subscribe((snapshot) => {
    const errors: unknown[] = []
    for (const [element, target] of targets) {
      try {
        for (const candidate of [...(candidates.get(element) ?? [])]) {
          if (value(snapshot, candidate.handle) === undefined)
            releaseOne(candidate)
        }
        const remaining = targets.get(element)
        if (remaining) apply(remaining, snapshot)
      } catch (error) {
        errors.push(error)
      }
    }
    if (errors.length)
      throw new AggregateError(errors, 'z-order target update failed.')
  })
  function releaseOne(target: ZRenderTarget) {
    const list = candidates.get(target.element)
    if (!list?.includes(target)) return
    const remaining = list.filter((item) => item !== target)
    if (remaining.length) {
      candidates.set(target.element, remaining)
      apply(remaining[0]!)
    } else release(target.element)
  }
  function release(element: HTMLElement) {
    const target = targets.get(element)
    const index = target ? liveTop.indexOf(target.handle) : -1
    if (index >= 0) liveTop.splice(index, 1)
    try {
      // Actual removal/disposal must not leave an unmanaged native surface visible.
      if (
        target?.mode === 'dialog' &&
        (target.element as HTMLDialogElement).open
      )
        (target.element as HTMLDialogElement).close()
      if (target?.mode === 'popover' && target.element.hasAttribute('popover'))
        target.element.hidePopover?.()
    } finally {
      try {
        cleanups.get(element)?.()
      } finally {
        cleanups.delete(element)
        targets.delete(element)
        candidates.delete(element)
      }
    }
  }
  return {
    attach(target: ZRenderTarget) {
      if (disposed)
        throw new UiZOrderError(
          'disposed',
          'browser projection has been disposed.',
        )
      if (!domain.describe(target.handle))
        fail('render target has no active registration.', target)
      const existing = candidates.get(target.element) ?? []
      for (const other of existing) {
        const a = domain.describe(other.handle)!,
          b = domain.describe(target.handle)!
        if (
          target.mode !== 'css' ||
          other.mode !== 'css' ||
          (!a.chain.includes(target.handle) && !b.chain.includes(other.handle))
        )
          fail('element already belongs to an unrelated participant.', target)
      }
      validateHost(target)
      if (target.mode === 'dialog' && target.element.localName !== 'dialog')
        fail('dialog mode requires a native dialog.', target)
      if (target.mode === 'popover' && !target.element.hasAttribute('popover'))
        fail('popover mode requires a popover target.', target)
      candidates.set(target.element, [...existing, target])
      if (!existing.length) {
        const style = target.element.style
        const oldZ = [
          style.getPropertyValue('z-index'),
          style.getPropertyPriority('z-index'),
        ]
        const oldPosition = [
          style.getPropertyValue('position'),
          style.getPropertyPriority('position'),
        ]
        const position =
          target.element.ownerDocument.defaultView!.getComputedStyle(
            target.element,
          ).position
        const positioned =
          target.mode === 'css' && (!position || position === 'static')
        if (positioned) style.setProperty('position', 'relative')
        targets.set(target.element, target)
        apply(target)
        // Toolkit counters cannot take ownership between Vue renders. Observer flushes before paint.
        const Observer =
          target.element.ownerDocument.defaultView!.MutationObserver
        const observe = () => {
          for (
            let node: HTMLElement | null = target.element;
            node;
            node = node.parentElement
          ) {
            observer.observe(node, {
              attributes: true,
              attributeFilter: ['style', 'class'],
              childList: true,
            })
            if (node === (target.currentHost?.() ?? target.host)) break
          }
        }
        const observer = new Observer((mutations) => {
          observer.disconnect()
          try {
            if (target.element.isConnected) {
              // Managed ancestor repacking changes only the derived value; it does not
              // introduce a new physical boundary. Inspect foreign boundary changes.
              if (
                mutations.some(
                  (m) =>
                    m.target !== target.element &&
                    (m.type === 'childList' ||
                      !targets.has(m.target as HTMLElement)),
                )
              )
                validateHost(target)
              apply(target)
            }
          } finally {
            observe()
          }
        })
        observe()
        cleanups.set(target.element, () => {
          observer.disconnect()
          for (const [property, old] of [
            ['z-index', oldZ],
            ...(positioned ? [['position', oldPosition]] : []),
          ] as [string, string[]][])
            if (old[0]) style.setProperty(property, old[0], old[1])
            else style.removeProperty(property)
        })
      }
      apply(target)
      let released = false
      return {
        /** Call before showModal/showPopover; failed native opening must call closed(). */
        opening() {
          if (released || !targets.has(target.element))
            fail('cannot open a released target.', target)
          if (target.mode === 'css') return
          if (liveTop.includes(target.handle)) return
          const last = liveTop.at(-1)
          if (
            last &&
            value(domain.snapshot, last)! >=
              value(domain.snapshot, target.handle)!
          )
            fail(
              'opening would place a lower logical surface above a live native surface.',
              target,
            )
          liveTop.push(target.handle)
        },
        /** Call only once exit motion and native dismissal have finished. */
        closed() {
          const index = liveTop.indexOf(target.handle)
          if (index >= 0) liveTop.splice(index, 1)
        },
        verify() {
          validateHost(target)
          validate(domain.snapshot)
        },
        release() {
          if (released) return
          released = true
          releaseOne(target)
        },
      }
    },
    lookup(element: Element) {
      for (
        let node: Element | null = element;
        node;
        node = node.parentElement
      ) {
        const target = targets.get(node as HTMLElement)
        if (target) return target.handle
      }
    },
    roots(handle: UiZHandle) {
      return [...candidates]
        .filter(([, list]) => list.some((t) => t.handle === handle))
        .map(([element]) => element)
    },
    describe(handle: UiZHandle) {
      const target = [...targets.values()].find((t) => t.handle === handle)
      return {
        logical: domain.describe(handle),
        target: target?.element,
        host: target?.currentHost?.() ?? target?.host,
        mode: target?.mode,
        nativeOpen: liveTop.includes(handle),
        version: domain.snapshot.version,
      }
    },
    dispose() {
      if (disposed) return
      disposed = true
      unvalidate()
      unsubscribe()
      const errors: unknown[] = []
      for (const element of [...targets.keys()]) {
        try {
          release(element)
        } catch (error) {
          errors.push(error)
        }
      }
      if (errors.length)
        throw new AggregateError(errors, 'z-order target cleanup failed.')
    },
  }
}
