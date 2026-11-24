import {
  nextTick,
  onActivated,
  onBeforeUpdate,
  onDeactivated,
  onMounted,
  onScopeDispose,
  onUpdated,
  ref,
  useId,
  watch,
} from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type { UiCollectionViewProps } from './collection'
import type { UiListKey } from '../bindings/list'

/** Optional backend mechanics. The adapter supplies its own real DOM targets. */
export function useUiCollectionView(props: UiCollectionViewProps) {
  const root = ref<HTMLElement>()
  const target = ref<HTMLElement>()
  const sentinel = ref<HTMLElement>()
  const failure = ref<HTMLElement>()
  const id = useId()
  const rows = new Map<UiListKey, HTMLElement>()
  let active = true
  let focusRecovery = 0
  let mounted = false
  let observer: IntersectionObserver | undefined
  let resize: ResizeObserver | undefined
  let visibility: MutationObserver | undefined
  const cleanup: (() => void)[] = []
  function visible() {
    const element = root.value
    if (
      !active ||
      !element?.isConnected ||
      element.ownerDocument.hidden ||
      !element.getClientRects().length
    )
      return false
    const style = element.ownerDocument.defaultView?.getComputedStyle(element)
    return style?.visibility !== 'hidden' && style?.visibility !== 'collapse'
  }
  function report(renewed = false) {
    const element = root.value
    const shown = visible()
    if (!shown) userScrollUntil = 0
    // Intersection notifications can still describe the hidden layout when an
    // ancestor becomes visible again. Sample the current geometry on every
    // report; a stale false -> true must not create a new continuation episode.
    let near = false
    if (shown && element) {
      if (sentinel.value) {
        const top = element.getBoundingClientRect().top + element.clientTop
        const marker = sentinel.value.getBoundingClientRect()
        near =
          marker.top <= top + element.clientHeight + 160 &&
          marker.bottom >= top - 160
      } else {
        near =
          element.scrollHeight - element.scrollTop - element.clientHeight < 160
      }
    }
    props.observe({ visible: shown, near, renewed: shown && renewed })
  }
  function listen(target: EventTarget, name: string, callback: EventListener) {
    target.addEventListener(name, callback, { passive: true })
    cleanup.push(() => target.removeEventListener(name, callback))
  }
  let lastTop = 0,
    lastLeft = 0
  let userScrollUntil = 0
  function scroll() {
    const element = root.value
    if (!element) return
    const changed =
      element.scrollTop !== lastTop || element.scrollLeft !== lastLeft
    lastTop = element.scrollTop
    lastLeft = element.scrollLeft
    report(changed && Date.now() <= userScrollUntil)
  }
  function disconnect() {
    observer?.disconnect()
    resize?.disconnect()
    visibility?.disconnect()
    observer = undefined
    resize = undefined
    visibility = undefined
    cleanup.splice(0).forEach((dispose) => dispose())
  }
  function attach() {
    disconnect()
    lastTop = root.value?.scrollTop ?? 0
    lastLeft = root.value?.scrollLeft ?? 0
    const element = root.value
    if (!element) return
    const win = element.ownerDocument.defaultView!
    if (props.infinite && sentinel.value && win.IntersectionObserver) {
      observer = new win.IntersectionObserver(() => report(), {
        root: element,
        rootMargin: '160px',
      })
      observer.observe(sentinel.value)
    }
    if (win.ResizeObserver) {
      let previous = ''
      resize = new win.ResizeObserver(() => {
        if (!visible()) {
          report()
          return
        }
        // A queued zero-size entry may also arrive after visibility resumes.
        // Use the live scrollport size instead of renewing from that old entry.
        const size = `${element.clientWidth}:${element.clientHeight}`
        const changed = previous !== '' && size !== previous
        previous = size
        report(changed && Date.now() <= userScrollUntil)
      })
      resize.observe(element)
    }
    // Ancestor visibility can change without this component rendering (v-show).
    visibility = new win.MutationObserver(() => report())
    for (
      let parent: Element | null = element;
      parent;
      parent = parent.parentElement
    )
      visibility.observe(parent, {
        attributes: true,
        attributeFilter: ['hidden', 'style', 'class'],
      })
    for (const name of ['wheel', 'touchmove', 'pointerdown', 'keydown'])
      listen(element, name, (event) => {
        if (!event.isTrusted) return
        userScrollUntil = Date.now() + 1200
        // A scroll gesture still requests continuation at an underfilled or
        // bottomed-out viewport, where no scroll event can be produced.
        const scrollKey =
          event.type === 'keydown' &&
          event.target === element &&
          ['End', 'PageDown', 'ArrowDown', ' '].includes(
            (event as KeyboardEvent).key,
          )
        if (event.type === 'wheel' || event.type === 'touchmove' || scrollKey)
          report(true)
      })
    listen(element, 'scroll', scroll)
    listen(win, 'resize', () => report(true))
    listen(element.ownerDocument, 'visibilitychange', () => report())
    listen(element.ownerDocument, 'focusin', (event) => {
      if (recovery && event.target !== recovery.focused) recovery = undefined
    })
    report()
  }
  onMounted(() => {
    mounted = true
    // Native adapters may change scrollports when allocation mode changes.
    watch([root, sentinel, () => props.infinite], attach, {
      immediate: true,
      flush: 'post',
    })
  })
  onActivated(() => {
    active = true
    // Descendant activation hooks run before the core host is re-enabled.
    // Report after the whole retained tree is active, even without a DOM update.
    if (mounted) void nextTick(() => report())
  })
  onDeactivated(() => {
    active = false
    focusRecovery++
    recovery = undefined
    report()
  })
  onScopeDispose(() => {
    active = false
    focusRecovery++
    recovery = undefined
    props.observe({ visible: false, near: false })
    disconnect()
    rows.clear()
  })
  let recovery:
    | { key: UiListKey; order: UiListKey[]; focused: Element }
    | undefined
  onBeforeUpdate(() => {
    const focused = root.value?.ownerDocument.activeElement
    if (!focused) return
    // Recover before an error action is removed. Loading may subsequently move
    // focus to its region; never bring focus back to a removed Retry button.
    if (failure.value?.contains(focused) && (!props.failed || props.loading)) {
      const destination = target.value ?? root.value
      destination?.focus({ preventScroll: true })
    }
    const owner = [...rows].find(([, element]) => element.contains(focused))
    if (owner)
      recovery = {
        key: owner[0],
        order: [...rows]
          .sort((a, b) => (a[1].compareDocumentPosition(b[1]) & 4 ? -1 : 1))
          .map(([key]) => key),
        focused,
      }
  })
  onUpdated(() => {
    const currentKeys = new Set(props.rows.map((row) => row.key))
    for (const key of rows.keys()) if (!currentKeys.has(key)) rows.delete(key)
    report()
    const previous = recovery
    recovery = undefined
    if (!previous) return
    const document = root.value?.ownerDocument
    if (
      !document ||
      (document.activeElement !== document.body &&
        document.activeElement !== previous.focused)
    )
      return
    if (props.rows.some((row) => row.key === previous.key)) {
      // A native action can blur as it becomes disabled for pending work.
      // Keep its identity until a later update enables it or removes its row;
      // attempting focus now would fail and lose the recovery opportunity.
      if (
        previous.focused.isConnected &&
        previous.focused.matches(':disabled')
      ) {
        recovery = previous
        return
      }
      // DOM moves can blur a retained editor even though Vue preserved identity.
      if (previous.focused.isConnected && 'focus' in previous.focused)
        (previous.focused as HTMLElement).focus({ preventScroll: true })
      return
    }
    const index = previous.order.indexOf(previous.key)
    const candidates = [
      ...previous.order.slice(index + 1),
      ...previous.order.slice(0, index).reverse(),
    ]
    const version = ++focusRecovery
    let moved = false
    const isCurrent = () =>
      active &&
      !moved &&
      version === focusRecovery &&
      !props.loading &&
      !props.rows.some((row) => row.key === previous.key) &&
      (document.activeElement === document.body ||
        document.activeElement === previous.focused)
    function nativeRecovery() {
      if (!isCurrent()) return
      for (const key of candidates) {
        const element = rows.get(key)
        const focus = element?.querySelector<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
        )
        if (
          focus &&
          !focus.closest('[hidden], [inert]') &&
          focus.getClientRects().length
        ) {
          focus.focus()
          return
        }
      }
      target.value?.focus()
    }
    if (props.recoverFocus) {
      const changed = () => {
        if (
          document.activeElement !== document.body &&
          document.activeElement !== previous.focused
        )
          moved = true
      }
      document.addEventListener('focusin', changed)
      void props
        .recoverFocus({ key: previous.key, candidates, isCurrent })
        .then((handled) => {
          if (!handled) nativeRecovery()
        }, nativeRecovery)
        .finally(() => document.removeEventListener('focusin', changed))
    } else nativeRecovery()
  })
  function rowRef(
    key: UiListKey,
    value: Element | ComponentPublicInstance | null,
  ) {
    if (
      value instanceof
        (root.value?.ownerDocument.defaultView?.HTMLElement ?? Object) &&
      value &&
      'focus' in value
    )
      rows.set(key, value as HTMLElement)
    else rows.delete(key)
  }
  return { root, target, sentinel, rowRef, id, failure }
}
