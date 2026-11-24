import {
  computed,
  inject,
  provide,
  ref,
  watchEffect,
  type InjectionKey,
} from 'vue'

import type { UiTooltipPlacement } from '../presentation/tooltip'

type Box = Pick<DOMRectReadOnly, 'left' | 'right' | 'top' | 'bottom'>
type Regions = () => readonly (HTMLElement | null | undefined)[]
const tooltipRegions: InjectionKey<Regions> = Symbol('tooltip-obstructions')

const tooltipSummary: InjectionKey<() => HTMLElement | null | undefined> =
  Symbol('tooltip-table-summary')

export function provideTooltipTableBounds(
  header: () => HTMLElement | null | undefined,
  summary: () => HTMLElement | null | undefined,
) {
  provide(tooltipSummary, summary)
  const inherited = inject(tooltipRegions, () => [])
  provide(tooltipRegions, () => [...inherited(), header(), summary()])
}

function intersection(a: Box, b: Box): Box {
  return {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
  }
}

function area(box: Box) {
  return Math.max(0, box.right - box.left) * Math.max(0, box.bottom - box.top)
}

function subtract(box: Box, obstruction: Box): Box[] {
  const overlap = intersection(box, obstruction)
  if (!area(overlap)) return [box]
  return [
    { ...box, bottom: overlap.top },
    { ...box, top: overlap.bottom },
    { ...overlap, left: box.left, right: overlap.left },
    { ...overlap, left: overlap.right, right: box.right },
  ].filter(area)
}

/** Geometric visibility of the reference, including layout-owned obstructions.
 * Browser intersection accounts for clipping ancestors but ignores sibling paint. */
export function useUiTooltipAnchorVisibility(
  anchor: () => HTMLElement | undefined,
  requested: () => boolean,
) {
  const regions = inject(tooltipRegions, () => [])
  const visible = ref(false)
  watchEffect(
    (onCleanup) => {
      const element = anchor()
      const win = element?.ownerDocument.defaultView
      if (!requested() || !element || !win) {
        visible.value = false
        return
      }
      const obstructions = regions().filter(
        (region): region is HTMLElement =>
          !!region && !region.contains(element),
      )
      const ancestors: Element[] = []
      for (let node = element.parentElement; node; node = node.parentElement)
        ancestors.push(node)
      const supportsModal = win.CSS?.supports('selector(:modal)')
      const supportsPopover = win.CSS?.supports('selector(:popover-open)')

      function update() {
        if (!element || !win || !element.isConnected) {
          visible.value = false
          return
        }
        const reference = element.getBoundingClientRect()
        const total = area(reference)
        const style = win.getComputedStyle(element)
        if (
          style.visibility !== 'visible' ||
          Number.parseFloat(style.opacity) === 0 ||
          element.closest('[inert], dialog:not([open])')
        ) {
          visible.value = false
          return
        }
        if (!total) {
          // Layoutless DOM environments can verify interaction and associations.
          visible.value =
            !element.ownerDocument.documentElement.getClientRects().length &&
            win.getComputedStyle(element.ownerDocument.documentElement)
              .display !== 'none'
          return
        }

        const viewport = win.visualViewport
        const left = viewport?.offsetLeft ?? 0
        const top = viewport?.offsetTop ?? 0
        let bounds: Box = {
          left,
          top,
          right: left + (viewport?.width ?? win.innerWidth),
          bottom: top + (viewport?.height ?? win.innerHeight),
        }
        for (const parent of ancestors) {
          const style = win.getComputedStyle(parent)
          if (Number.parseFloat(style.opacity) === 0) {
            visible.value = false
            return
          }
          const clipsX = style.overflowX !== 'visible' && style.overflowX !== ''
          const clipsY = style.overflowY !== 'visible' && style.overflowY !== ''
          if (clipsX || clipsY) {
            const rect = parent.getBoundingClientRect()
            const left = rect.left + parent.clientLeft
            const top = rect.top + parent.clientTop
            bounds = intersection(bounds, {
              left: clipsX ? left : bounds.left,
              right: clipsX ? left + parent.clientWidth : bounds.right,
              top: clipsY ? top : bounds.top,
              bottom: clipsY ? top + parent.clientHeight : bounds.bottom,
            })
          }
          // Native top-layer content escapes ordinary ancestor clipping.
          if (
            (supportsModal && parent.matches(':modal')) ||
            (supportsPopover && parent.matches(':popover-open'))
          )
            break
        }
        let remaining = [intersection(bounds, reference)].filter(area)
        for (const region of obstructions) {
          if (
            region.isConnected &&
            win.getComputedStyle(region).visibility === 'visible'
          )
            remaining = remaining.flatMap((box) =>
              subtract(box, region.getBoundingClientRect()),
            )
        }
        visible.value =
          remaining.reduce((sum, box) => sum + area(box), 0) >= total / 2
      }

      update()
      let frame: number | undefined
      const schedule = () => {
        if (frame !== undefined) return
        if (!win.requestAnimationFrame) return update()
        frame = win.requestAnimationFrame(() => {
          frame = undefined
          update()
        })
      }
      // Observe intersection changes from layout as well as scroll/resize. Sticky
      // siblings can change the usable region without changing the IO ratio.
      const intersectionObserver = win.IntersectionObserver
        ? new win.IntersectionObserver(schedule, { threshold: [0, 0.5, 1] })
        : undefined
      intersectionObserver?.observe(element)
      const resize = win.ResizeObserver
        ? new win.ResizeObserver(schedule)
        : undefined
      for (const target of [element, ...ancestors, ...obstructions])
        resize?.observe(target)
      win.addEventListener('scroll', schedule, true)
      win.addEventListener('resize', schedule)
      win.addEventListener('animationend', schedule, true)
      win.addEventListener('transitionend', schedule, true)
      win.visualViewport?.addEventListener('scroll', schedule)
      win.visualViewport?.addEventListener('resize', schedule)
      const mutation = new win.MutationObserver(schedule)
      for (const target of [element, ...ancestors, ...obstructions])
        mutation.observe(target, {
          attributes: true,
          attributeFilter: [
            'style',
            'class',
            'hidden',
            'open',
            'inert',
            'data-state',
          ],
        })
      onCleanup(() => {
        if (frame !== undefined) win.cancelAnimationFrame(frame)
        intersectionObserver?.disconnect()
        resize?.disconnect()
        mutation.disconnect()
        win.removeEventListener('scroll', schedule, true)
        win.removeEventListener('resize', schedule)
        win.removeEventListener('animationend', schedule, true)
        win.removeEventListener('transitionend', schedule, true)
        win.visualViewport?.removeEventListener('scroll', schedule)
        win.visualViewport?.removeEventListener('resize', schedule)
      })
    },
    { flush: 'post' },
  )
  return visible
}

const modalBounds: InjectionKey<
  () => {
    dialog?: HTMLElement
    header?: HTMLElement
    footer?: HTMLElement
  }
> = Symbol('tooltip-modal-bounds')

export function provideTooltipModalBounds(
  dialog: () => HTMLElement | undefined,
  header: () => HTMLElement | undefined,
  footer: () => HTMLElement | undefined,
) {
  provide(modalBounds, () => ({
    dialog: dialog(),
    header: header(),
    footer: footer(),
  }))
  // A nested modal owns a fresh region. Rows in the previous modal no longer
  // participate in the new modal's visible area.
  provide(tooltipRegions, () => [header(), footer()])
  provide(tooltipSummary, () => undefined)
}

export function useUiTooltipPlacement(
  anchor: () => HTMLElement | undefined,
  preferred: () => UiTooltipPlacement,
) {
  const modal = inject(modalBounds, undefined)
  return computed(() => {
    const element = anchor()
    const regions = modal?.()
    if (element && regions?.header?.contains(element)) return 'bottom'
    if (element && regions?.footer?.contains(element)) return 'top'
    return preferred()
  })
}

export function useUiTooltipSurfaceBounds(
  target: () => HTMLElement | null | undefined,
  nested: () => boolean,
  anchor: () => HTMLElement | undefined,
  visible: () => boolean,
) {
  const modal = inject(modalBounds, undefined)
  const summary = inject(tooltipSummary, () => undefined)
  watchEffect(
    (onCleanup) => {
      const element = target()
      const { dialog, header, footer } = modal?.() ?? {}
      const reference = anchor()
      const rowSummary = reference?.closest('tbody') ? summary() : undefined
      const show = visible()
      if (show && !dialog && !rowSummary) return
      const avoidRegions = nested()
      const win = element?.ownerDocument.defaultView
      if (!element || !win) return
      const original = element.style.clipPath
      if (!show) {
        // Native exit transitions may retain their wrapper after the anchor
        // fails the visibility gate. Suppress its paint through that exit.
        element.style.clipPath = 'inset(50%)'
        const applied = element.style.clipPath
        onCleanup(() => {
          if (element.style.clipPath === applied)
            element.style.clipPath = original
        })
        return
      }
      let requested = original
      let applied = original
      function update() {
        if (!element || !win) return
        const box = element.getBoundingClientRect()
        const panel = dialog?.getBoundingClientRect() ?? {
          left: 0,
          top: 0,
          right: win.innerWidth,
          bottom: win.innerHeight,
        }
        if (!area(panel) || !area(box)) return
        const top =
          avoidRegions && header
            ? Math.max(panel.top, header.getBoundingClientRect().bottom)
            : panel.top
        let bottom =
          avoidRegions && footer
            ? Math.min(panel.bottom, footer.getBoundingClientRect().top)
            : panel.bottom
        if (rowSummary)
          bottom = Math.min(bottom, rowSummary.getBoundingClientRect().top)
        const allowed = intersection(box, {
          left: panel.left,
          right: panel.right,
          top,
          bottom,
        })
        let clip = original
        if (!area(allowed)) clip = 'inset(50%)'
        else {
          // Leave room for focus-independent native arrows and shadows, clipping
          // them along with the tooltip only at the containing panel edge.
          const inset = [
            top - box.top,
            box.right - panel.right,
            box.bottom - bottom,
            panel.left - box.left,
          ]
          if (inset.some((value) => value > -12))
            clip = `inset(${inset.map((value) => `${Math.max(-32, value)}px`).join(' ')})`
        }
        if (clip === requested && element.style.clipPath === applied) return
        requested = clip
        element.style.clipPath = clip
        applied = element.style.clipPath
      }
      const mutations = new win.MutationObserver(update)
      mutations.observe(element, {
        attributes: true,
        attributeFilter: ['style', 'class'],
      })
      const resize = win.ResizeObserver
        ? new win.ResizeObserver(update)
        : undefined
      for (const node of [element, dialog, header, footer, rowSummary])
        if (node) resize?.observe(node)
      win.addEventListener('scroll', update, true)
      win.addEventListener('resize', update)
      update()
      onCleanup(() => {
        mutations.disconnect()
        resize?.disconnect()
        win.removeEventListener('scroll', update, true)
        win.removeEventListener('resize', update)
        if (element.style.clipPath === applied)
          element.style.clipPath = original
      })
    },
    { flush: 'post' },
  )
}
