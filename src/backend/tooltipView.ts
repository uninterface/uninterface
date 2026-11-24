import {
  computed,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onScopeDispose,
  shallowRef,
  ref,
  watch,
  type Ref,
} from 'vue'
import type { UiTooltipViewProps } from './index'
import {
  useUiTooltipAnchorVisibility,
  useUiTooltipPlacement,
} from './tooltipGeometry'

/** Attachment scans only an explicit forwarded marker; opaque component internals are never inspected. */
export function useUiTooltipView(props: UiTooltipViewProps) {
  const anchor = shallowRef<HTMLElement>()
  const surface = shallowRef<HTMLElement>()
  let hover = false,
    focus = false,
    clicked = false,
    suppressed = false
  const active = ref(true)
  let timer: ReturnType<typeof setTimeout> | undefined
  let observer: MutationObserver | undefined
  let original = new Set<string>()
  const includes = (value: 'hover' | 'focus' | 'click') =>
    props.triggers.includes(value)
  const requested = () => active.value && props.visible && !props.disabled
  const visible = useUiTooltipAnchorVisibility(() => anchor.value, requested)
  const placement = useUiTooltipPlacement(
    () => anchor.value,
    () => props.placement,
  )
  function request() {
    if (!props.disabled && !suppressed)
      props.requestVisible(hover || focus || clicked)
  }
  function dismiss() {
    hover = focus = clicked = false
    suppressed = true
    props.requestVisible(false)
  }
  function fresh() {
    if (timer) clearTimeout(timer)
    suppressed = false
  }
  function leave() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      hover = false
      request()
    }, 100)
  }
  function describe() {
    const target = anchor.value
    if (!target) return
    const current = (target.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(Boolean)
    for (const id of current) if (id !== props.id) original.add(id)
    const ids = [...original]
    if (visible.value) ids.push(props.id)
    const value = ids.join(' ')
    if (value !== target.getAttribute('aria-describedby')) {
      if (value) target.setAttribute('aria-describedby', value)
      else if (target.hasAttribute('aria-describedby'))
        target.removeAttribute('aria-describedby')
    }
  }
  function release() {
    const target = anchor.value
    if (target) {
      const ids = (target.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter((id) => id && id !== props.id)
      if (ids.length) target.setAttribute('aria-describedby', ids.join(' '))
      else target.removeAttribute('aria-describedby')
    }
    anchor.value = undefined
    original = new Set()
  }
  function locate() {
    if (!active.value || typeof document === 'undefined') return
    const matches = [
      ...document.querySelectorAll<HTMLElement>(
        '[data-uninterface-tooltip-host]',
      ),
    ].filter(
      (element) =>
        element.getAttribute('data-uninterface-tooltip-host') === props.id,
    )
    if (matches.length > 1)
      throw new Error('UiTooltip requires exactly one forwarded host target.')
    if (matches[0] !== anchor.value) {
      release()
      anchor.value = matches[0]
    }
    describe()
  }
  const trigger = {
    'data-uninterface-tooltip-host': props.id,
    onPointerenter() {
      if (includes('hover')) {
        fresh()
        hover = true
        request()
      }
    },
    onPointerleave() {
      if (includes('hover')) leave()
    },
    onFocusin() {
      if (includes('focus')) {
        fresh()
        focus = true
        request()
      }
    },
    onFocusout() {
      focus = false
      request()
    },
    onClickCapture() {
      if (includes('click')) {
        if (clicked) dismiss()
        else {
          fresh()
          clicked = true
          request()
        }
      }
    },
  }
  const surfaceEvents = {
    onPointerenter() {
      if (includes('hover')) {
        fresh()
        hover = true
        request()
      }
    },
    onPointerleave() {
      if (includes('hover')) leave()
    },
  }
  function key(event: KeyboardEvent) {
    if (visible.value && event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      dismiss()
    }
  }
  function outside(event: PointerEvent) {
    if (
      visible.value &&
      clicked &&
      !anchor.value?.contains(event.target as Node) &&
      !surface.value?.contains(event.target as Node)
    )
      dismiss()
  }
  onMounted(() => {
    locate()
    observer = new MutationObserver(locate)
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-uninterface-tooltip-host', 'aria-describedby'],
    })
    document.addEventListener('keydown', key, true)
    document.addEventListener('pointerdown', outside, true)
  })
  watch(
    () => [props.visible, props.disabled],
    () => {
      if (props.disabled) {
        hover = focus = clicked = false
      }
      void nextTick(describe)
    },
  )
  watch(visible, describe, { flush: 'post' })
  onDeactivated(() => {
    active.value = false
    dismiss()
    release()
  })
  onActivated(() => {
    active.value = true
    void nextTick(locate)
  })
  onScopeDispose(() => {
    active.value = false
    if (timer) clearTimeout(timer)
    observer?.disconnect()
    release()
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', key, true)
      document.removeEventListener('pointerdown', outside, true)
    }
  })
  return {
    anchor,
    surface,
    trigger,
    surfaceEvents,
    visible,
    placement,
    dismiss,
    describe,
  }
}

// Read all open anchors before any positioner writes to avoid a layout flush
// between tooltips when several editors move in the same frame.
const positionFrames = new WeakMap<
  Window,
  { reads: Set<() => (() => void) | undefined>; frame: number }
>()

function trackPosition(win: Window, read: () => (() => void) | undefined) {
  if (!win.requestAnimationFrame) return () => {}
  const pending = positionFrames.get(win)
  const batch = pending ?? { reads: new Set<typeof read>(), frame: 0 }
  batch.reads.add(read)
  if (!pending) {
    const tick = () => {
      for (const write of Array.from(batch.reads, (read) => read())) write?.()
      if (batch.reads.size) batch.frame = win.requestAnimationFrame(tick)
    }
    batch.frame = win.requestAnimationFrame(tick)
    positionFrames.set(win, batch)
  }
  return () => {
    batch.reads.delete(read)
    if (!batch.reads.size) {
      win.cancelAnimationFrame(batch.frame)
      positionFrames.delete(win)
    }
  }
}

/** Refresh a native positioner when layout moves its anchor or containing block. */
export function useUiTooltipPositionUpdate(
  anchor: () => HTMLElement | undefined,
  surface: () => HTMLElement | undefined,
  visible: () => boolean,
  update: () => void,
) {
  watch(
    [anchor, surface, visible],
    ([target, tip, open], _, onCleanup) => {
      const win = target?.ownerDocument.defaultView
      if (!target || !tip || !open || !win) return
      let previous = ''
      onCleanup(
        trackPosition(win, () => {
          if (!target.isConnected || !tip.isConnected) return
          const box = target.getBoundingClientRect()
          const container = tip.offsetParent?.getBoundingClientRect()
          const position = `${box.x}:${box.y}:${box.width}:${box.height}:${container?.x}:${container?.y}:${container?.width}:${container?.height}`
          if (position === previous) return
          previous = position
          return update
        }),
      )
    },
    { flush: 'post' },
  )
}

/** Shared fixed positioning with viewport clamping and live anchor tracking. */
export function useUiTooltipPosition(
  anchor: Ref<HTMLElement | undefined>,
  surface: Ref<HTMLElement | undefined>,
  side: () => string,
  visible: () => boolean,
) {
  watch(
    [anchor, surface, side, visible],
    ([target, tip, placement, open], _, onCleanup) => {
      const win = target?.ownerDocument.defaultView
      if (!target || !tip || !open || !win) return
      const read = () => {
        if (!target.isConnected || !tip.isConnected) return
        const a = target.getBoundingClientRect()
        const b = tip.getBoundingClientRect()
        let x = a.left + (a.width - b.width) / 2,
          y = a.top - b.height - 8
        if (placement === 'bottom') y = a.bottom + 8
        if (placement === 'left') {
          x = a.left - b.width - 8
          y = a.top + (a.height - b.height) / 2
        }
        if (placement === 'right') {
          x = a.right + 8
          y = a.top + (a.height - b.height) / 2
        }
        if (y < 4) y = a.bottom + 8
        if (y + b.height > win.innerHeight - 4) y = a.top - b.height - 8
        const left = `${Math.max(4, Math.min(x, win.innerWidth - b.width - 4))}px`
        const top = `${Math.max(4, Math.min(y, win.innerHeight - b.height - 4))}px`
        if (
          tip.style.position === 'fixed' &&
          tip.style.left === left &&
          tip.style.top === top
        )
          return
        return () => Object.assign(tip.style, { position: 'fixed', left, top })
      }
      read()?.()
      onCleanup(trackPosition(win, read))
    },
    { flush: 'post' },
  )
}
