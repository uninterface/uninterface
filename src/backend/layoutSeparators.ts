import {
  defineComponent,
  h,
  shallowRef,
  watchPostEffect,
  type CSSProperties,
  type PropType,
} from 'vue'
import type { UiLayoutViewBinding } from './index'

export const UiLayoutSeparators = /* @__PURE__ */ defineComponent({
  name: 'UiLayoutSeparators',
  props: {
    root: Object as PropType<HTMLElement>,
    binding: { type: Object as PropType<UiLayoutViewBinding>, required: true },
    itemId: {
      type: Function as PropType<(key: string) => string>,
      required: true,
    },
    color: { type: String, required: true },
    thickness: { type: String, required: true },
    length: { type: String, default: '1rem' },
  },
  setup(props) {
    const decoration = shallowRef<HTMLElement>()
    const lines = shallowRef<{ key: string; style: CSSProperties }[]>([])
    const clipPath = shallowRef<string>()

    watchPostEffect((cleanup) => {
      const root = props.root
      const win = root?.ownerDocument.defaultView
      const { separators, direction, items } = props.binding
      const host = decoration.value
      if (!root || !win || !separators?.length || !host) return

      const children = new Map(
        Array.from(root.children, (child) => [child.id, child]),
      )
      const allocations = new Map(
        items.map((key) => [key, children.get(props.itemId(key))]),
      )
      const ancestors: HTMLElement[] = []
      for (let el: HTMLElement | null = root; el; el = el.parentElement)
        ancestors.push(el)
      const horizontal = direction === 'horizontal'
      const measure = () => {
        const bounds = root.getBoundingClientRect()
        const scaleX = bounds.width / root.offsetWidth || 1
        const scaleY = bounds.height / root.offsetHeight || 1
        const origin = host.getBoundingClientRect()
        const x = (left: number) => (left - origin.left) / scaleX
        const y = (top: number) => (top - origin.top) / scaleY
        const rtl = win.getComputedStyle(root).direction === 'rtl'
        const next: typeof lines.value = []
        for (const { first, second } of separators) {
          const a = allocations.get(first)?.getBoundingClientRect()
          const b = allocations.get(second)?.getBoundingClientRect()
          if (!a || !b) continue
          if (horizontal) {
            const [start, end] = rtl ? [b.right, a.left] : [a.right, b.left]
            // Consecutive flex peers restart at inline-start on a new line.
            // In that case there is no positive inline gap between them.
            if (end - start <= 0.5) continue
            const top = Math.min(a.top, b.top)
            const bottom = Math.max(a.bottom, b.bottom)
            next.push({
              key: second,
              style: {
                left: `${x((start + end) / 2)}px`,
                top: `${y((top + bottom) / 2)}px`,
                height: `min(${props.length}, ${(bottom - top) / scaleY}px)`,
                borderLeft: `${props.thickness} solid ${props.color}`,
                transform: 'translate(-50%, -50%)',
              },
            })
          } else if (b.top - a.bottom > 0.5) {
            next.push({
              key: second,
              style: {
                left: `${x(bounds.left) + root.clientLeft - root.scrollLeft}px`,
                width: `${root.clientWidth}px`,
                top: `${y((a.bottom + b.top) / 2)}px`,
                borderTop: `${props.thickness} solid ${props.color}`,
                transform: 'translateY(-50%)',
              },
            })
          }
        }
        lines.value = next

        // An absolute decoration with a containing block outside a scrollport
        // can escape that scrollport's overflow clip. Clip only the decoration.
        // https://www.w3.org/TR/CSS22/visufx.html#overflow-clipping
        let { left, top, right, bottom } = bounds
        for (const ancestor of ancestors) {
          const { overflowX, overflowY } = win.getComputedStyle(ancestor)
          if (overflowX === 'visible' && overflowY === 'visible') continue
          const rect = ancestor.getBoundingClientRect()
          const scaleX = rect.width / ancestor.offsetWidth || 1
          const scaleY = rect.height / ancestor.offsetHeight || 1
          const startX = rect.left + ancestor.clientLeft * scaleX
          const startY = rect.top + ancestor.clientTop * scaleY
          if (overflowX !== 'visible') {
            left = Math.max(left, startX)
            right = Math.min(right, startX + ancestor.clientWidth * scaleX)
          }
          if (overflowY !== 'visible') {
            top = Math.max(top, startY)
            bottom = Math.min(bottom, startY + ancestor.clientHeight * scaleY)
          }
        }
        const l = `${x(left)}px`
        const r = `${x(Math.max(left, right))}px`
        const t = `${y(top)}px`
        const b = `${y(Math.max(top, bottom))}px`
        clipPath.value = `polygon(${l} ${t}, ${r} ${t}, ${r} ${b}, ${l} ${b})`
      }

      measure()
      const resize = win.ResizeObserver && new win.ResizeObserver(measure)
      resize?.observe(root)
      resize?.observe(host)
      for (const item of allocations.values()) if (item) resize?.observe(item)
      const directionChanges = new win.MutationObserver(measure)
      for (const el of ancestors) {
        if (el !== root) {
          const { overflowX, overflowY } = win.getComputedStyle(el)
          if (overflowX !== 'visible' || overflowY !== 'visible')
            resize?.observe(el)
        }
        directionChanges.observe(el, {
          attributeFilter: ['dir', 'class', 'style'],
        })
        el.addEventListener('scroll', measure, { passive: true })
      }
      win.addEventListener('resize', measure)
      cleanup(() => {
        resize?.disconnect()
        directionChanges.disconnect()
        for (const el of ancestors) el.removeEventListener('scroll', measure)
        win.removeEventListener('resize', measure)
      })
    })

    return () =>
      // This out-of-flow box is the containing block for the lines only.
      // https://www.w3.org/TR/css-position-3/#def-cb
      h(
        'span',
        {
          ref: decoration,
          'aria-hidden': 'true',
          style: {
            position: 'absolute',
            alignSelf: 'start',
            justifySelf: 'start',
            // Zero-size tracks expose inherited gap changes to ResizeObserver.
            display: 'grid',
            gridTemplate: '0 0 / 0 0',
            gap: 'inherit',
            width: 'max-content',
            height: 'max-content',
            clipPath: clipPath.value,
            pointerEvents: 'none',
          },
        },
        lines.value.map(({ key, style }) =>
          h('span', {
            key,
            'aria-hidden': 'true',
            'data-ui-layout-separator': '',
            style: { position: 'absolute', pointerEvents: 'none', ...style },
          }),
        ),
      )
  },
})
