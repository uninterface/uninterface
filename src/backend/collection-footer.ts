import {
  computed,
  inject,
  nextTick,
  onBeforeUpdate,
  onScopeDispose,
  onUpdated,
  provide,
  shallowRef,
  watch,
  type InjectionKey,
  type Ref,
} from 'vue'
import {
  allocateFooterRows,
  type FooterPart,
} from '../layout/collection-footer'

interface FooterContext {
  width: Ref<number | undefined>
  navigationAsk: Ref<number | undefined>
  navigationMinimum: Ref<number | undefined>
  navigationWidth: Ref<number | undefined>
  navigationPreferred: Ref<number | undefined>
  fontSize: Ref<number>
}
const footerKey: InjectionKey<FooterContext> = Symbol(
  'collection-footer-layout',
)

/** Measured allocation with backend-owned intrinsic requests and sequence. */
export function useUiCollectionFooterLayout(
  host: Ref<HTMLElement | undefined>,
  order: readonly FooterPart[],
  present: () => readonly FooterPart[],
) {
  const width = shallowRef<number>()
  const navigationAsk = shallowRef<number>()
  const navigationMinimum = shallowRef<number>()
  const asks = shallowRef<Partial<Record<FooterPart, number>>>({})
  const gap = shallowRef(8)
  const rows = shallowRef<FooterPart[][]>([])
  const navigationWidth = shallowRef<number>()
  const navigationPreferred = shallowRef<number>()
  const fontSize = shallowRef(16)
  provide(footerKey, {
    width,
    navigationAsk,
    navigationMinimum,
    navigationWidth,
    navigationPreferred,
    fontSize,
  })
  const parts = () => {
    const active = present()
    const allocated = rows.value.flat().filter((part) => active.includes(part))
    // New slots participate immediately; the post-render measurement allocates them.
    return [
      ...allocated,
      ...order.filter(
        (part) => active.includes(part) && !allocated.includes(part),
      ),
    ]
  }
  const split = computed(() => rows.value.length > 1)
  let observer: ResizeObserver | undefined
  let disposed = false
  let scheduled = false
  let navigationIntrinsic = 0
  let navigationOverflow = 0
  let previousNavigationOffer = ''
  const ordinaryWidths = new Map<FooterPart, number>()
  const sharedNavigation = () =>
    rows.value.some(
      (row) =>
        row.length === 2 && row[0] === 'jumper' && row[1] === 'paginator',
    )
  const observed = new Set<Element>()
  const measure = () => {
    scheduled = false
    const element = host.value
    if (!element || disposed || !width.value) return
    const style = element.ownerDocument.defaultView!.getComputedStyle(element)
    gap.value = parseFloat(style.columnGap) || 0
    fontSize.value = parseFloat(style.fontSize) || 16
    const navigationOffer = JSON.stringify([
      rows.value,
      navigationWidth.value,
      navigationAsk.value,
      navigationMinimum.value,
    ])
    const navigationSettled = previousNavigationOffer === navigationOffer
    previousNavigationOffer = navigationOffer
    const compact =
      navigationWidth.value !== undefined &&
      navigationPreferred.value !== undefined &&
      navigationWidth.value + 1 < navigationPreferred.value
    const next: Partial<Record<FooterPart, number>> = {}
    const active = present()
    for (const part of active) {
      const node = [...element.children].find(
        (child) => child.getAttribute('data-footer-part') === part,
      ) as HTMLElement | undefined
      if (!node) continue
      // Measure the existing wrapper's preferred width, without cloning controls,
      // invoking opaque components or changing input state. Restore before paint.
      const saved = node.getAttribute('style')
      node.style.flex = '0 0 auto'
      node.style.inlineSize = 'max-content'
      node.style.maxInlineSize = 'none'
      node.style.marginInlineStart = '0'
      const measured = Math.ceil(
        Math.max(node.getBoundingClientRect().width, node.scrollWidth),
      )
      if (saved === null) node.removeAttribute('style')
      else node.setAttribute('style', saved)
      if (part === 'paginator' && navigationAsk.value !== undefined) {
        // Honor larger native/theme requests as well as the preferred budget.
        // A reduced rendered window must not erase its preceding intrinsic ask.
        const constrained =
          navigationWidth.value !== undefined &&
          navigationWidth.value + 1 <
            Math.max(navigationAsk.value * fontSize.value, navigationIntrinsic)
        navigationIntrinsic = constrained
          ? Math.max(navigationIntrinsic, measured)
          : measured
        next[part] = Math.max(
          navigationAsk.value * fontSize.value,
          navigationIntrinsic,
        )
        // A native/customized control can exceed its estimate. Do not repeatedly
        // retry the same too-small shared row as its compact window changes.
        if (
          navigationSettled &&
          sharedNavigation() &&
          navigationWidth.value !== undefined &&
          measured > navigationWidth.value + 1
        )
          navigationOverflow = Math.max(navigationOverflow, measured)
      } else {
        next[part] = measured
        if (!compact || !ordinaryWidths.has(part))
          ordinaryWidths.set(part, measured)
      }
      if (!observed.has(node)) {
        observer?.observe(node)
        observed.add(node)
      }
    }
    for (const node of observed) {
      if (!element.contains(node)) {
        observer?.unobserve(node)
        observed.delete(node)
      }
    }
    if (JSON.stringify(asks.value) !== JSON.stringify(next)) asks.value = next
    navigationPreferred.value = next.paginator
    const allocated = allocateFooterRows(
      order.filter((part) => active.includes(part)),
      next,
      width.value,
      gap.value,
      split.value,
      navigationMinimum.value !== undefined
        ? Math.max(navigationMinimum.value * fontSize.value, navigationOverflow)
        : next.paginator,
      sharedNavigation(),
    )
    const navigationRow = allocated.find((row) => row.includes('paginator'))
    navigationWidth.value = navigationRow
      ? Math.min(
          next.paginator!,
          Math.max(
            0,
            width.value -
              navigationRow
                .filter((part) => part !== 'paginator')
                // Compact siblings must not enlarge the offer that selects
                // their own size. Retain their last ordinary request for this
                // calculation; rendered wrappers still use actual measurements.
                .reduce(
                  (sum, part) =>
                    sum +
                    Math.max(next[part]!, ordinaryWidths.get(part) ?? 0) +
                    gap.value,
                  0,
                ),
          ),
        )
      : undefined
    if (JSON.stringify(rows.value) !== JSON.stringify(allocated))
      rows.value = allocated
    // Native views must render the new width/window before it can establish an
    // overflow bound. The preceding window may legitimately have been wider.
    if (!navigationSettled) schedule()
  }
  const schedule = () => {
    if (scheduled || disposed) return
    scheduled = true
    void nextTick(measure)
  }
  const stop = watch(
    host,
    (element, _old, cleanup) => {
      width.value = undefined
      observed.clear()
      if (!element) return
      const view = element.ownerDocument.defaultView!
      const updateWidth = (value: number) => {
        if (Number.isFinite(value) && value > 0) width.value = value
      }
      updateWidth(element.clientWidth)
      if (view.ResizeObserver) {
        observer = new view.ResizeObserver((entries) => {
          const entry = entries.find((entry) => entry.target === element)
          if (entry) updateWidth(entry.contentRect.width)
          schedule()
        })
        observer.observe(element)
      }
      const fonts = element.ownerDocument.fonts
      fonts?.addEventListener('loadingdone', schedule)
      // Opaque children can change their own content without updating this view.
      // Ignore allocation styles on our wrappers to avoid a measurement loop.
      const mutations = view.MutationObserver
        ? new view.MutationObserver((records) => {
            if (
              records.some(
                (record) =>
                  record.type !== 'attributes' ||
                  !(record.target instanceof view.HTMLElement) ||
                  (!record.target.hasAttribute('data-footer-part') &&
                    record.target !== element),
              )
            )
              schedule()
          })
        : undefined
      mutations?.observe(element, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'style', 'size', 'placeholder'],
      })
      schedule()
      cleanup(() => {
        observer?.disconnect()
        mutations?.disconnect()
        observer = undefined
        observed.clear()
        fonts?.removeEventListener('loadingdone', schedule)
      })
    },
    { flush: 'post' },
  )
  watch([navigationAsk, navigationMinimum], () => {
    navigationIntrinsic = 0
    navigationOverflow = 0
    schedule()
  })

  // Keyed wrappers can change order but never parent. Browsers may blur a moved
  // focused editor; preserve that focus and suppress only relocation blur events.
  let focused: HTMLElement | undefined
  let selection:
    | { start: number; end: number; direction: 'forward' | 'backward' | 'none' }
    | undefined
  let release: (() => void) | undefined
  onBeforeUpdate(() => {
    const element = host.value
    if (!element) return
    const current = [...element.children]
      .filter((child) => child.hasAttribute('data-footer-part'))
      .map((child) => child.getAttribute('data-footer-part'))
    if (current.join() === parts().join()) return
    const active = element.ownerDocument.activeElement as HTMLElement | null
    if (!active || !element.contains(active)) return
    const part = active
      .closest('[data-footer-part]')
      ?.getAttribute('data-footer-part') as FooterPart | undefined
    if (!part || !present().includes(part)) return
    focused = active
    if ('selectionStart' in active) {
      const input = active as HTMLInputElement
      if (input.selectionStart !== null && input.selectionEnd !== null)
        selection = {
          start: input.selectionStart,
          end: input.selectionEnd,
          direction: input.selectionDirection ?? 'none',
        }
    }
    const block = (event: Event) => {
      if (event.target === active) event.stopImmediatePropagation()
    }
    element.addEventListener('blur', block, true)
    element.addEventListener('focusout', block, true)
    release = () => {
      element.removeEventListener('blur', block, true)
      element.removeEventListener('focusout', block, true)
    }
  })
  onUpdated(() => {
    if (
      focused?.isConnected &&
      host.value?.contains(focused) &&
      focused.ownerDocument.activeElement !== focused
    ) {
      focused.focus({ preventScroll: true })
      if (selection && 'setSelectionRange' in focused)
        (focused as HTMLInputElement).setSelectionRange(
          selection.start,
          selection.end,
          selection.direction,
        )
    }
    release?.()
    release = undefined
    focused = undefined
    selection = undefined
    schedule()
  })
  onScopeDispose(() => {
    disposed = true
    stop()
    release?.()
  })
  const row = (part: FooterPart) =>
    rows.value.findIndex((items) => items.includes(part))
  return {
    parts,
    split,
    rows,
    row,
    start: (part: FooterPart) => rows.value.some((items) => items[0] === part),
    end: (part: FooterPart) =>
      rows.value.some((items) => items.at(-1) === part),
    sharedStart: (part: FooterPart) => part === 'jumper' && sharedNavigation(),
    basis: (part: FooterPart) => {
      if (part === 'paginator') {
        if (sharedNavigation()) return undefined
        if (split.value) return '100%'
      }
      return asks.value[part]
        ? `${Math.min(asks.value[part]!, width.value ?? Infinity)}px`
        : undefined
    },
  }
}

/** Backend budgets stay independent of the allocated page window. The optional
 * compact minimum permits row sharing; opaque navigation keeps its intrinsic ask. */
export function useUiCollectionFooterNavigation(
  preferredEm: () => number,
  minimumEm?: () => number,
) {
  const context = inject(footerKey, undefined)
  if (context) {
    const stop = watch(
      () => [preferredEm(), minimumEm?.()] as const,
      ([preferred, minimum]) => {
        context.navigationAsk.value = preferred
        context.navigationMinimum.value = minimum
      },
      { immediate: true },
    )
    onScopeDispose(() => {
      stop()
      context.navigationAsk.value = undefined
      context.navigationMinimum.value = undefined
    })
  }
  return context ? computed(() => context.navigationWidth.value) : undefined
}

/** Supplemental controls may adapt to the available width independently of rows. */
export function useUiCollectionFooterCompact() {
  const context = inject(footerKey, undefined)
  return context
    ? computed(
        () =>
          context.navigationWidth.value !== undefined &&
          context.navigationPreferred.value !== undefined &&
          context.navigationWidth.value + 1 < context.navigationPreferred.value,
      )
    : undefined
}
