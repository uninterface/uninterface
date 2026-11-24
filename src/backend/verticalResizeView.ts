import {
  onActivated,
  onDeactivated,
  ref,
  watchPostEffect,
  type ShallowRef,
} from 'vue'
import type { UiLayoutViewBinding } from './index'

/** Opt-in geometry protocol for a direct UiContent root. Never probes opaque
 * component internals or equates a scrollport's whole document with its minimum.
 */
export function observeVerticalResize(
  root: ShallowRef<HTMLElement | undefined>,
  getBinding: () => UiLayoutViewBinding,
  itemId: (key: string) => string,
) {
  const active = ref(true)
  onActivated(() => {
    active.value = true
  })
  onDeactivated(() => {
    active.value = false
  })
  watchPostEffect((cleanup) => {
    const host = root.value
    const binding = getBinding()
    if (
      !active.value ||
      !host ||
      !binding.measureResize ||
      binding.direction !== 'vertical'
    )
      return
    const view = host.ownerDocument.defaultView!
    let frame: number | undefined
    const measure = () => {
      frame = undefined
      if (!host.isConnected || host.clientHeight <= 0) return
      const current = getBinding()
      if (
        !current.measureResize ||
        current.resizeIdentity !== binding.resizeIdentity
      )
        return
      const scale = host.offsetHeight
        ? host.getBoundingClientRect().height / host.offsetHeight
        : 1
      if (!(scale > 0)) return
      const style = view.getComputedStyle(host)
      const px = (value: string) => Number.parseFloat(value) || 0
      const allocations = current.items.map((key) =>
        host.ownerDocument.getElementById(itemId(key)),
      )
      const shares = current.division
      if (!Array.isArray(shares)) return
      const numeric = new Set(
        allocations.filter((_, i) => typeof shares[i] === 'number'),
      )
      const other = [...host.children].filter(
        (child) => !numeric.has(child as HTMLElement),
      )
      const available = Math.max(
        0,
        host.clientHeight -
          px(style.paddingTop) -
          px(style.paddingBottom) -
          other.reduce(
            (sum, child) => sum + child.getBoundingClientRect().height / scale,
            0,
          ) -
          Math.max(0, host.children.length - 1) * px(style.rowGap),
      )
      const minimum: Record<string, number> = {}
      allocations.forEach((allocation, index) => {
        if (!allocation || !numeric.has(allocation)) return
        // Ignore backend decoration, but do not traverse arbitrary business DOM.
        const children = [...allocation.children].filter(
          (child) => !child.hasAttribute('data-edge'),
        )
        if (children.length !== 1) return
        const content = children[0] as HTMLElement
        const height = content.getAttribute('data-ui-content-height')
        const scrolling = content.hasAttribute('data-scroll')
        if (height !== 'content' && !(height === 'full' && scrolling)) return
        const css = view.getComputedStyle(content)
        let size =
          height === 'content'
            ? content.getBoundingClientRect().height / scale
            : px(css.paddingTop) +
              px(css.paddingBottom) +
              px(css.borderTopWidth) +
              px(css.borderBottomWidth) +
              (px(css.lineHeight) || px(css.fontSize) * 1.2)
        size += px(css.marginTop) + px(css.marginBottom)
        minimum[current.items[index]] = Math.ceil(size * 100) / 100
      })
      if (Object.keys(minimum).length || current.resizeSizes)
        current.measureResize(available, minimum)
    }
    const schedule = () => {
      if (frame === undefined)
        frame =
          view.requestAnimationFrame?.(measure) ?? view.setTimeout(measure, 0)
    }
    const observer =
      typeof view.ResizeObserver === 'function'
        ? new view.ResizeObserver(schedule)
        : undefined
    observer?.observe(host)
    for (const key of binding.items) {
      const allocation = host.ownerDocument.getElementById(itemId(key))
      if (allocation)
        for (const child of allocation.children) observer?.observe(child)
    }
    const mutation = new view.MutationObserver(schedule)
    mutation.observe(host, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    })
    view.addEventListener('resize', schedule)
    host.ownerDocument.fonts?.addEventListener('loadingdone', schedule)
    measure()
    cleanup(() => {
      observer?.disconnect()
      mutation.disconnect()
      view.removeEventListener('resize', schedule)
      host.ownerDocument.fonts?.removeEventListener('loadingdone', schedule)
      if (frame !== undefined) {
        if (view.cancelAnimationFrame) view.cancelAnimationFrame(frame)
        else view.clearTimeout(frame)
      }
    })
  })
}
