import {
  inject,
  provide,
  onUpdated,
  onBeforeUpdate,
  onScopeDispose,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue'

type Field = {
  root(): HTMLElement | undefined
  editor(): HTMLElement | undefined
  center?(editor: HTMLElement): number
}
const key: InjectionKey<{ register(field: Field): () => void }> = Symbol(
  'collection-header-fields',
)

/** Adapters identify their own first editor surface; opaque business wrappers stay opaque. */
export function useUiCollectionHeaderField(
  root: Ref<unknown>,
  selector: string,
  center?: (editor: HTMLElement) => number,
) {
  const header = inject(key, undefined)
  if (!header) return
  const element = () => {
    const value = root.value as HTMLElement | { $el?: HTMLElement } | undefined
    const node = value && ('$el' in value ? value.$el : (value as HTMLElement))
    return node?.nodeType === 1 ? node : undefined
  }
  const release = header.register({
    root: element,
    center,
    editor: () => element()?.querySelector<HTMLElement>(selector) ?? undefined,
  })
  onScopeDispose(release)
}

/** Coordinate editor centers per actual flex line, independently of label/feedback height. */
export function useUiCollectionHeaderAlignment(
  row: Ref<HTMLElement | undefined>,
  compact: () => boolean,
  buttonSelector: string,
  placeActions?: (placement: 'filters' | 'sort' | 'after') => void,
) {
  let actionPlacement: 'filters' | 'sort' | 'after' = 'filters'
  const fields = new Set<Field>()
  const adjusted = new Map<HTMLElement, number>()
  let resize: ResizeObserver | undefined
  let mutation: MutationObserver | undefined
  let frame = 0
  let alive = true
  let win: Window | null = null
  let connected: HTMLElement | undefined
  const observed = new Set<Element>()
  function observe(next: Set<Element>) {
    for (const node of observed)
      if (!next.has(node)) {
        resize?.unobserve(node)
        observed.delete(node)
      }
    for (const node of next)
      if (!observed.has(node)) {
        resize?.observe(node)
        observed.add(node)
      }
  }
  const clear = (item: HTMLElement) => {
    item.style.removeProperty('--ui-header-editor-offset')
    item.removeAttribute('data-ui-header-aligned')
    adjusted.delete(item)
  }
  function schedule() {
    if (!alive || !win || frame) return
    frame = win.requestAnimationFrame(() => {
      frame = 0
      align()
    })
  }
  provide(key, {
    register(field) {
      fields.add(field)
      schedule()
      return () => {
        fields.delete(field)
        schedule()
      }
    },
  })
  function align() {
    const host = row.value
    if (!host || !win) return
    // DOM containment includes native top-layer and locally positioned overlays.
    // Only surfaces participating in this row's normal flow can set its band.
    const inFlow = (node: HTMLElement, parent: HTMLElement): boolean => {
      for (
        let current: HTMLElement | null = node;
        current && current !== parent;
        current = current.parentElement
      ) {
        const style = win!.getComputedStyle(current)
        if (
          style.display === 'none' ||
          style.position === 'absolute' ||
          style.position === 'fixed'
        )
          return false
      }
      return parent.contains(node)
    }
    const peers: HTMLElement[] = []
    const collect = (parent: HTMLElement) => {
      for (const node of parent.children) {
        const item = node as HTMLElement
        const display = win!.getComputedStyle(item).display
        if (display === 'contents') collect(item)
        else if (
          display !== 'none' &&
          inFlow(item, host) &&
          item.getClientRects().length
        )
          peers.push(item)
      }
    }
    collect(host)
    for (const item of adjusted.keys())
      if (compact() || !peers.includes(item)) clear(item)
    const nextObserved = new Set<Element>([host])
    if (compact()) {
      observe(nextObserved)
      return
    }
    if (placeActions) {
      const actions = peers.find(
        (item) => item.dataset.headerPart === 'actions',
      )
      if (actions) {
        const gap = parseFloat(win.getComputedStyle(host).columnGap) || 0
        // Measure existing allocation roots only, restoring before paint. Native
        // control internals, fonts and content determine their preferred asks.
        const preferred = (item: HTMLElement) => {
          const saved = item.getAttribute('style')
          item.style.flex = '0 0 auto'
          item.style.inlineSize = 'max-content'
          item.style.maxInlineSize = 'none'
          item.style.marginInlineStart = '0'
          const width = Math.ceil(
            Math.max(item.getBoundingClientRect().width, item.scrollWidth),
          )
          if (saved === null) item.removeAttribute('style')
          else item.setAttribute('style', saved)
          return width
        }
        const primary = peers.filter(
          (item) =>
            item !== actions &&
            !['sort', 'info'].includes(item.dataset.headerPart ?? '') &&
            !item.hasAttribute('data-line-break'),
        )
        const sort = peers.find((item) => item.dataset.headerPart === 'sort')
        const actionWidth = preferred(actions)
        const primaryWidth =
          primary.reduce((width, item) => width + preferred(item), 0) +
          Math.max(0, primary.length - 1) * gap
        const offered = host.clientWidth
        if (offered > 0) {
          const fits = (width: number, candidate: string) =>
            width +
              actionWidth +
              gap +
              (actionPlacement !== candidate ? gap : 0) <=
            offered
          const next =
            !primary.length || fits(primaryWidth, 'filters')
              ? 'filters'
              : sort && fits(preferred(sort), 'sort')
                ? 'sort'
                : 'after'
          actionPlacement = next
          host.setAttribute('data-ui-header-actions', next)
          placeActions(next)
        }
      }
    }
    const lines: {
      top: number
      items: { item: HTMLElement; offset: number }[]
    }[] = []
    for (const item of peers) {
      const actions = item.dataset.headerPart === 'actions'
      if (
        (actions && actionPlacement !== 'filters') ||
        item.hasAttribute('data-line-break')
      ) {
        clear(item)
        nextObserved.add(item)
        continue
      }
      // The first action button anchors its group beside the query controls.
      const field = actions
        ? undefined
        : [...fields].find((field) => {
            const root = field.root()
            const editor = field.editor()
            return root && editor && inFlow(root, item) && inFlow(editor, item)
          })
      const editor =
        field?.editor() ??
        (item.matches(buttonSelector)
          ? item
          : [...item.querySelectorAll<HTMLElement>(buttonSelector)].find(
              (button) => inFlow(button, item),
            ))
      nextObserved.add(item)
      if (!editor || !editor.getClientRects().length) {
        clear(item)
        continue
      }
      nextObserved.add(editor)
      if (field?.root()) nextObserved.add(field.root()!)
      const bounds = item.getBoundingClientRect()
      const surface = editor.getBoundingClientRect()
      if (!bounds.width || !surface.height) {
        clear(item)
        continue
      }
      // Padding contributes to the outer box but never to the intrinsic label ask.
      const offset =
        (field?.center?.(editor) ?? surface.top + surface.height / 2) -
        bounds.top -
        (adjusted.get(item) ?? 0)
      let line = lines.find((line) => Math.abs(line.top - bounds.top) < 1)
      if (!line) lines.push((line = { top: bounds.top, items: [] }))
      line.items.push({ item, offset })
    }
    observe(nextObserved)
    for (const line of lines) {
      const target = Math.max(...line.items.map((entry) => entry.offset))
      for (const { item, offset } of line.items) {
        const padding = Math.max(0, Math.round((target - offset) * 100) / 100)
        if (Math.abs((adjusted.get(item) ?? -1) - padding) < 0.1) continue
        adjusted.set(item, padding)
        item.setAttribute('data-ui-header-aligned', '')
        item.style.setProperty('--ui-header-editor-offset', `${padding}px`)
      }
    }
  }
  function disconnect() {
    if (frame) win?.cancelAnimationFrame(frame)
    frame = 0
    resize?.disconnect()
    observed.clear()
    mutation?.disconnect()
    win?.removeEventListener('resize', schedule)
    connected?.ownerDocument.fonts?.removeEventListener('loadingdone', schedule)
    for (const item of adjusted.keys()) clear(item)
    win = null
  }
  watch(
    row,
    (host) => {
      disconnect()
      connected = host
      if (!host) return
      win = host.ownerDocument.defaultView
      if (!win) return
      if (typeof ResizeObserver !== 'undefined')
        resize = new ResizeObserver(schedule)
      mutation = new MutationObserver(schedule)
      mutation.observe(host, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'hidden'],
      })
      win.addEventListener('resize', schedule)
      host.ownerDocument.fonts?.addEventListener('loadingdone', schedule)
      schedule()
    },
    { flush: 'post' },
  )
  // Moving a keyed group preserves its controls, but insertBefore can clear native focus.
  // Restore only a still-connected target when the move left focus on the document body.
  let focused: HTMLElement | undefined
  let selection:
    | {
        start: number
        end: number
        direction: 'forward' | 'backward' | 'none' | null
      }
    | undefined
  onBeforeUpdate(() => {
    const active = row.value?.ownerDocument.activeElement as HTMLElement | null
    focused = active && row.value?.contains(active) ? active : undefined
    selection = undefined
    if (focused && 'selectionStart' in focused) {
      const input = focused as HTMLInputElement
      if (input.selectionStart !== null && input.selectionEnd !== null)
        selection = {
          start: input.selectionStart,
          end: input.selectionEnd,
          direction: input.selectionDirection,
        }
    }
  })
  onUpdated(() => {
    if (
      focused?.isConnected &&
      focused.ownerDocument.activeElement === focused.ownerDocument.body
    ) {
      focused.focus({ preventScroll: true })
      if (selection)
        (focused as HTMLInputElement).setSelectionRange(
          selection.start,
          selection.end,
          selection.direction ?? undefined,
        )
    }
    focused = undefined
    schedule()
  })
  watch(compact, schedule)
  onScopeDispose(() => {
    alive = false
    disconnect()
  })
}
