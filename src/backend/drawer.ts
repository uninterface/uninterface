import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { UiOverlayViewProps } from './index'

export interface UiDrawerSizingBinding {
  extent: number
  min: number
  max: number
  enabled: boolean
  label: string
  measure(available: number, font: number, root: number): void
  resize(value: number): void
}
/** Shared mechanics only; each backend owns its handle and surface presentation. */
export function useUiDrawerResize(
  props: () => UiOverlayViewProps,
  surface: Ref<HTMLElement | undefined>,
) {
  const viewportBounds = ref<{
    left: number
    top: number
    width: number
    height: number
  }>()
  let observer: ResizeObserver | undefined
  let cleanup: (() => void) | undefined
  let stopDrag: (() => void) | undefined
  function measure() {
    const el = surface.value,
      p = props()
    if (!el || !p.drawerSizing) return
    const win = el.ownerDocument.defaultView!
    const viewport = win.visualViewport
    viewportBounds.value = {
      left: viewport?.offsetLeft ?? 0,
      top: viewport?.offsetTop ?? 0,
      width: viewport?.width ?? win.innerWidth,
      height: viewport?.height ?? win.innerHeight,
    }
    p.drawerSizing.measure(
      ['start', 'end'].includes(p.edge)
        ? (viewport?.width ?? win.innerWidth)
        : (viewport?.height ?? win.innerHeight),
      parseFloat(win.getComputedStyle(el).fontSize) || 16,
      parseFloat(
        win.getComputedStyle(el.ownerDocument.documentElement).fontSize,
      ) || 16,
    )
  }
  onMounted(() => {
    measure()
    const win = surface.value?.ownerDocument.defaultView
    win?.addEventListener('resize', measure)
    win?.visualViewport?.addEventListener('resize', measure)
    win?.visualViewport?.addEventListener('scroll', measure)
    observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measure)
    if (surface.value) observer?.observe(surface.value)
    cleanup = () => {
      observer?.disconnect()
      win?.removeEventListener('resize', measure)
      win?.visualViewport?.removeEventListener('resize', measure)
      win?.visualViewport?.removeEventListener('scroll', measure)
    }
  })
  // Extent updates replace drawerSizing during a drag. Watch primitive
  // lifecycle inputs independently so an unchanged enabled state keeps dragging.
  watch(
    [
      () => props().edge,
      () => props().docked,
      () => props().active,
      () => props().drawerSizing?.enabled,
    ],
    () => {
      stopDrag?.()
      measure()
    },
  )
  onBeforeUnmount(() => {
    stopDrag?.()
    cleanup?.()
  })
  function physical() {
    const p = props(),
      el = surface.value
    if (p.edge === 'top' || p.edge === 'bottom') return p.edge
    const rtl =
      el &&
      el.ownerDocument.defaultView!.getComputedStyle(el).direction === 'rtl'
    return (p.edge === 'start') !== !!rtl ? 'left' : 'right'
  }
  return {
    style() {
      const p = props(),
        b = viewportBounds.value
      if (p.docked || !b) return undefined
      const side = physical(),
        vertical = side === 'left' || side === 'right'
      return {
        inset: 'auto',
        left: `${b.left + (side === 'right' ? b.width - (p.drawerSizing?.extent ?? 0) : 0)}px`,
        top: `${b.top + (side === 'bottom' ? b.height - (p.drawerSizing?.extent ?? 0) : 0)}px`,
        maxWidth: `${b.width}px`,
        maxHeight: `${b.height}px`,
        ...(vertical ? { height: `${b.height}px` } : { width: `${b.width}px` }),
      }
    },
    attributes() {
      const p = props(),
        size = p.drawerSizing!
      return {
        role: 'separator',
        tabindex: size.enabled && size.max > size.min ? 0 : -1,
        'aria-label': size.label,
        'aria-controls': `${p.id}-surface`,
        'aria-orientation': ['start', 'end'].includes(p.edge)
          ? ('vertical' as const)
          : ('horizontal' as const),
        'aria-valuemin': Math.round(size.min),
        'aria-valuemax': Math.round(size.max),
        'aria-valuenow': Math.round(size.extent),
        'aria-disabled': !size.enabled || size.max <= size.min || undefined,
        'data-drawer-resize': '',
        'data-vaul-no-drag': '',
        onKeydown(event: KeyboardEvent) {
          const size = props().drawerSizing!
          if (!size.enabled || size.max <= size.min) return
          const side = physical(),
            horizontal = side === 'left' || side === 'right'
          const step = event.shiftKey ? 40 : 8
          let value: number
          if (event.key === 'Home') value = size.min
          else if (event.key === 'End') value = size.max
          else if (
            (horizontal
              ? ['ArrowLeft', 'ArrowRight']
              : ['ArrowUp', 'ArrowDown']
            ).includes(event.key)
          ) {
            const positive =
              event.key === 'ArrowRight' || event.key === 'ArrowDown'
            value =
              size.extent +
              (positive === (side === 'left' || side === 'top') ? step : -step)
          } else return
          event.preventDefault()
          event.stopPropagation()
          size.resize(value)
        },
        onPointerdown(event: PointerEvent) {
          const size = props().drawerSizing!
          if (!size.enabled || size.max <= size.min || event.button !== 0)
            return
          event.preventDefault()
          event.stopPropagation()
          ;(event.currentTarget as HTMLElement).focus()
          stopDrag?.()
          const doc = surface.value!.ownerDocument,
            edge = physical()
          const horizontal = edge === 'left' || edge === 'right'
          const start = horizontal ? event.clientX : event.clientY,
            extent = size.extent
          const move = (next: PointerEvent) => {
            if (next.pointerId !== event.pointerId) return
            next.preventDefault()
            next.stopPropagation()
            props().drawerSizing?.resize(
              extent +
                ((horizontal ? next.clientX : next.clientY) - start) *
                  (edge === 'left' || edge === 'top' ? 1 : -1),
            )
          }
          const end = (next: PointerEvent) => {
            if (next.pointerId === event.pointerId) stopDrag?.()
          }
          doc.addEventListener('pointermove', move)
          doc.addEventListener('pointerup', end)
          doc.addEventListener('pointercancel', end)
          stopDrag = () => {
            doc.removeEventListener('pointermove', move)
            doc.removeEventListener('pointerup', end)
            doc.removeEventListener('pointercancel', end)
            stopDrag = undefined
          }
        },
      }
    },
  }
}
