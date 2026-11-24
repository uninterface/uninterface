import { useZLocalTarget } from '../stacking/local'
import {
  computed,
  onActivated,
  onDeactivated,
  onMounted,
  nextTick,
  onScopeDispose,
  ref,
  shallowRef,
  watch,
  type CSSProperties,
} from 'vue'
import type { UiLoadingSurface } from '../loading/surface'
export interface UiLoadingIndicatorViewProps {
  label: string
}
export interface UiLoadingRegionViewProps {
  surface: UiLoadingSurface
  loading: boolean
  label: string
  /** Collections already elect a single announcement host. */
  announce?: boolean
  /** The collection already places aria-busy on its real data element. */
  manageBusy?: boolean
}

/** Resolve a backend's native component ref without exposing toolkit instances. */
export function useUiLoadingSurface(
  target: () => HTMLElement | { $el: unknown } | null | undefined,
): UiLoadingSurface {
  const element = computed(() => {
    const value = target()
    const el = value && '$el' in value ? value.$el : value
    return el && typeof el === 'object' && 'nodeType' in el && el.nodeType === 1
      ? (el as HTMLElement)
      : undefined
  })
  return {
    overlayHost: element,
    interactionTarget: element,
    statusTarget: element,
  }
}
const locks = new WeakMap<HTMLElement, { count: number; original: boolean }>()
function lock(element: HTMLElement) {
  let state = locks.get(element)
  if (!state) {
    state = { count: 0, original: element.hasAttribute('inert') }
    locks.set(element, state)
  }
  state.count++
  element.setAttribute('inert', '')
  return () => {
    if (--state.count === 0) {
      if (!state.original) element.removeAttribute('inert')
      locks.delete(element)
    }
  }
}

const hosts = new WeakMap<
  HTMLElement,
  { count: number; position: string; isolation: string }
>()
function holdHost(host: HTMLElement) {
  let record = hosts.get(host)
  if (!record) {
    record = {
      count: 0,
      position: host.style.position,
      isolation: host.style.isolation,
    }
    hosts.set(host, record)
    const position =
      host.ownerDocument.defaultView!.getComputedStyle(host).position
    if (!position || position === 'static') host.style.position = 'relative'
    host.style.isolation = 'isolate'
  }
  record.count++
  return () => {
    if (--record.count === 0) {
      host.style.position = record.position
      host.style.isolation = record.isolation
      hosts.delete(host)
    }
  }
}
const busyTargets = new WeakMap<
  HTMLElement,
  { count: number; original: string | null }
>()
function holdBusy(target: HTMLElement) {
  let record = busyTargets.get(target)
  if (!record) {
    record = { count: 0, original: target.getAttribute('aria-busy') }
    busyTargets.set(target, record)
  }
  record.count++
  target.setAttribute('aria-busy', 'true')
  return () => {
    if (--record.count !== 0) return
    if (record.original === null) target.removeAttribute('aria-busy')
    else target.setAttribute('aria-busy', record.original)
    busyTargets.delete(target)
  }
}
const statuses = new WeakMap<
  HTMLElement,
  {
    count: number
    tab: string | null
    focused?: HTMLElement
  }
>()
function holdStatus(
  status: HTMLElement,
  target: HTMLElement,
  manageBusy: boolean,
) {
  const releaseBusy = manageBusy ? holdBusy(status) : () => {}
  let record = statuses.get(status)
  const document = status.ownerDocument
  if (!record) {
    const focused = document.activeElement
    record = {
      count: 0,
      tab: status.getAttribute('tabindex'),
      focused:
        focused instanceof document.defaultView!.HTMLElement &&
        target.contains(focused) &&
        focused !== status
          ? focused
          : undefined,
    }
    statuses.set(status, record)
    if (record.focused) {
      if (record.tab === null) status.tabIndex = -1
      status.focus({ preventScroll: true })
    }
  }
  record.count++
  return () => {
    releaseBusy()
    if (--record.count !== 0) return
    if (
      record.focused?.isConnected &&
      !record.focused.closest('[inert]') &&
      document.activeElement === status
    )
      record.focused.focus({ preventScroll: true })
    if (record.tab === null && record.focused)
      status.removeAttribute('tabindex')
    statuses.delete(status)
  }
}

/** Shared mechanics only. Backend views own every rendered surface and indicator. */
export function useUiLoadingRegion(props: UiLoadingRegionViewProps) {
  const mounted = ref(false)
  const active = ref(true)
  const overlay = shallowRef<HTMLElement>()
  useZLocalTarget(
    () => overlay.value,
    () => props.surface.overlayHost.value,
    'loading overlay',
  )
  const style = shallowRef<CSSProperties>({})
  const visible = computed(
    () =>
      mounted.value &&
      active.value &&
      props.loading &&
      !!props.surface.overlayHost.value,
  )
  onMounted(() => {
    mounted.value = true
  })
  onActivated(() => {
    active.value = true
  })
  onDeactivated(() => {
    active.value = false
  })
  const stop = watch(
    () =>
      [
        visible.value,
        props.surface.overlayHost.value,
        props.surface.interactionTarget.value,
        props.surface.statusTarget.value,
      ] as const,
    ([show, host, target, status], _previous, onCleanup) => {
      if (!show || !host || !target || !status) return
      if (
        host.ownerDocument !== target.ownerDocument ||
        host.ownerDocument !== status.ownerDocument
      )
        throw new Error(
          'UiLoadingRegion surface targets must share a document.',
        )
      const document = host.ownerDocument
      const win = document.defaultView!
      const releaseHost = holdHost(host)
      const releaseStatus = holdStatus(
        status,
        target,
        props.manageBusy !== false,
      )
      const releases = new Map<HTMLElement, () => void>()
      function exempt(element: HTMLElement) {
        return element.matches(
          '[data-ui-loading-overlay], [data-ui-loading-status]',
        )
      }
      function block(element: HTMLElement) {
        if (exempt(element)) return
        // Overlay/status hosts remain accessible, even when supplied inside content.
        if (
          element === host ||
          element.contains(host ?? null) ||
          element.querySelector(
            '[data-ui-loading-overlay], [data-ui-loading-status]',
          )
        ) {
          for (const child of element.children)
            if (child instanceof win.HTMLElement) block(child)
        } else if (!releases.has(element)) releases.set(element, lock(element))
      }
      function sync() {
        const rect = host!.getBoundingClientRect()
        style.value = {
          left: `${host!.scrollLeft}px`,
          top: `${host!.scrollTop}px`,
          width: `${host!.clientWidth || rect.width}px`,
          height: `${host!.clientHeight || rect.height}px`,
        }
        block(target!)
      }
      function guard(event: Event) {
        // Tab can leave the parked region. Mask clicks must not reach a frame's
        // own click listener, even when they originate in the overlay itself.
        if (event.type === 'keydown' && (event as KeyboardEvent).key === 'Tab')
          return
        event.preventDefault()
        event.stopImmediatePropagation()
      }
      const events = [
        'click',
        'dblclick',
        'pointerdown',
        'mousedown',
        'touchstart',
        'keydown',
        'beforeinput',
        'input',
        'change',
        'submit',
      ]
      for (const name of events) target.addEventListener(name, guard, true)
      const observer = new win.MutationObserver(sync)
      observer.observe(target, { childList: true, subtree: true })
      const resize = win.ResizeObserver
        ? new win.ResizeObserver(sync)
        : undefined
      resize?.observe(host)
      host.addEventListener('scroll', sync, { passive: true })
      win.addEventListener('resize', sync)
      sync()
      onCleanup(() => {
        observer.disconnect()
        resize?.disconnect()
        host.removeEventListener('scroll', sync)
        win.removeEventListener('resize', sync)
        for (const name of events) target.removeEventListener(name, guard, true)
        for (const release of releases.values()) release()
        releaseStatus()
        releaseHost()
      })
    },
    { flush: 'post', immediate: true },
  )
  onScopeDispose(stop)
  const announcementHost = computed(() =>
    mounted.value
      ? props.surface.overlayHost.value?.ownerDocument.body
      : undefined,
  )
  const announcement = ref('')
  let announcementRevision = 0
  watch(
    () => [visible.value, props.label] as const,
    async ([show, label]) => {
      const revision = ++announcementRevision
      announcement.value = ''
      if (!show || props.announce === false) return
      // Insert an empty live region before publishing its first activity message.
      await nextTick()
      if (revision === announcementRevision && visible.value)
        announcement.value = label
    },
    { flush: 'post', immediate: true },
  )
  return { visible, overlay, style, announcementHost, announcement }
}
