import {
  computed,
  shallowRef,
  watch,
  onMounted,
  onActivated,
  onDeactivated,
  onBeforeUnmount,
} from 'vue'

/** Optional backend mechanics: preserve the click point, constrain its effective
 * reference to the current document viewport. Native views still own placement. */
export function useUiMenuPoint(
  source: () => Readonly<{ x: number; y: number }> | undefined,
  anchor: () => HTMLElement | undefined,
) {
  const viewport = shallowRef<{ width: number; height: number }>()
  let view: Window | null = null
  let active = false
  function measure() {
    if (!view) return
    const root = view.document.documentElement
    const width = root.clientWidth || view.innerWidth
    const height = root.clientHeight || view.innerHeight
    if (viewport.value?.width !== width || viewport.value?.height !== height)
      viewport.value = { width, height }
  }
  function disconnect() {
    view?.removeEventListener('resize', measure)
    view = null
    viewport.value = undefined
  }
  function connect() {
    const next =
      active && source() ? (anchor()?.ownerDocument.defaultView ?? null) : null
    if (next !== view) {
      disconnect()
      view = next
      view?.addEventListener('resize', measure)
    }
    measure()
  }
  function start() {
    active = true
    connect()
  }
  function stop() {
    active = false
    disconnect()
  }
  watch([source, anchor], connect, { flush: 'sync' })
  onMounted(start)
  onActivated(start)
  onDeactivated(stop)
  onBeforeUnmount(stop)
  return computed(() => {
    const point = source()
    if (!point) return undefined
    const bounds = viewport.value
    return bounds
      ? {
          x: Math.max(0, Math.min(point.x, bounds.width)),
          y: Math.max(0, Math.min(point.y, bounds.height)),
        }
      : { x: point.x, y: point.y }
  })
}
