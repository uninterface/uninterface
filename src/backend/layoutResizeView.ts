import { onBeforeUnmount, onDeactivated, useId, watch, shallowRef } from 'vue'
import { observeVerticalResize } from './verticalResizeView'
import type { UiLayoutViewBinding, UiLayoutResizeViewBinding } from './index'

/** Optional DOM interaction helper. Views still own markup, dimensions, focus and presentation. */
export function useUiLayoutResizeView(getBinding: () => UiLayoutViewBinding) {
  const id = useId()
  const itemId = (key: string) => `${id}-allocation-${encodeURIComponent(key)}`
  const resizeRoot = shallowRef<HTMLElement>()
  observeVerticalResize(resizeRoot, getBinding, itemId)
  const boundaryAfter = (key: string) =>
    getBinding().resizeBoundaries?.find((boundary) => boundary.first === key)
  let cancel: (() => void) | undefined
  const stop = () => {
    cancel?.()
    cancel = undefined
  }
  onBeforeUnmount(stop)
  onDeactivated(stop)
  watch(
    () =>
      JSON.stringify([
        getBinding().resizeIdentity,
        getBinding().direction,
        getBinding().items,
        getBinding().resizeBoundaries?.map(({ key }) => key),
      ]),
    stop,
    { flush: 'sync' },
  )

  function onKeydown(
    event: KeyboardEvent,
    boundary: UiLayoutResizeViewBinding,
  ) {
    const horizontal = getBinding().direction === 'horizontal'
    const target = event.currentTarget as HTMLElement
    const rtl =
      target.ownerDocument.defaultView!.getComputedStyle(target).direction ===
      'rtl'
    const previous = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp'
    const next = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown'
    const step = event.shiftKey ? 10 : 1
    let value: number
    if (event.key === 'Home') value = boundary.min
    else if (event.key === 'End') value = boundary.max
    else if (event.key === previous) value = boundary.value - step
    else if (event.key === next) value = boundary.value + step
    else return
    event.preventDefault()
    event.stopPropagation()
    stop()
    boundary.resize(value)
  }

  function onPointerdown(
    event: PointerEvent,
    boundary: UiLayoutResizeViewBinding,
  ) {
    if (event.button !== 0 || event.isPrimary === false) return
    const target = event.currentTarget as HTMLElement
    const doc = target.ownerDocument
    const view = doc.defaultView!
    const a = doc
      .getElementById(itemId(boundary.first))
      ?.getBoundingClientRect()
    const b = doc
      .getElementById(itemId(boundary.second))
      ?.getBoundingClientRect()
    if (!a || !b) return
    const horizontal = getBinding().direction === 'horizontal'
    const extent = horizontal ? a.width + b.width : a.height + b.height
    if (extent <= 0) return
    stop()
    event.preventDefault()
    event.stopPropagation()
    target.focus()
    const origin = horizontal ? event.clientX : event.clientY
    const rtl = horizontal && view.getComputedStyle(target).direction === 'rtl'
    const pointer = event.pointerId
    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointer) return
      moveEvent.preventDefault()
      const delta =
        ((horizontal ? moveEvent.clientX : moveEvent.clientY) - origin) *
        (rtl ? -1 : 1)
      const current = boundaryAfter(boundary.first)
      current?.resize(boundary.value + (100 * delta) / extent)
    }
    const end = (endEvent: PointerEvent) => {
      if (endEvent.pointerId === pointer) stop()
    }
    doc.addEventListener('pointermove', move, { passive: false })
    doc.addEventListener('pointerup', end)
    doc.addEventListener('pointercancel', end)
    view.addEventListener('blur', stop)
    view.addEventListener('resize', stop)
    cancel = () => {
      doc.removeEventListener('pointermove', move)
      doc.removeEventListener('pointerup', end)
      doc.removeEventListener('pointercancel', end)
      view.removeEventListener('blur', stop)
      view.removeEventListener('resize', stop)
    }
  }
  return { resizeRoot, itemId, boundaryAfter, onKeydown, onPointerdown }
}
