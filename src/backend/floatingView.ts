import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { UiFloatingViewProps } from './index'
import { readSafeArea } from './safeArea'
import { useUiZView } from '../stacking/view'

/** Geometry/events shared by the five independently rendered floating views. */
export function useUiFloatingView(props: UiFloatingViewProps) {
  const root = ref<HTMLElement>(),
    ready = ref(false),
    moving = ref(false)
  const editor = ref<HTMLInputElement>(),
    editing = ref(false)
  const movePanel = ref<HTMLElement>(),
    moveStyle = ref<Record<string, string>>({})
  const style = ref<Record<string, string>>({ position: 'fixed' })
  useUiZView({ targets: () => (root.value ? [root.value] : []) })
  let directionObserver: MutationObserver | undefined
  let observer: ResizeObserver | undefined,
    stop: (() => void) | undefined,
    release: (() => void) | undefined
  let disposed = false
  let suppress = false,
    lastFocus: HTMLElement | undefined
  const clamp = (value: number) => Math.max(0, Math.min(value, 1))
  function bounds() {
    const el = root.value!,
      win = el.ownerDocument.defaultView!,
      viewport = win.visualViewport
    const css = win.getComputedStyle(el)
    const gap =
      parseFloat(css.getPropertyValue('--ui-floating-clearance')) || 12
    // Backends add platform safe-area protection to their selected clearance.
    const safe = readSafeArea(el.ownerDocument)
    const left = (viewport?.offsetLeft ?? 0) + gap + safe.left,
      top = (viewport?.offsetTop ?? 0) + gap + safe.top
    const width = Math.max(
      0,
      (viewport?.width ?? win.innerWidth) -
        el.offsetWidth -
        gap * 2 -
        safe.left -
        safe.right,
    )
    const height = Math.max(
      0,
      (viewport?.height ?? win.innerHeight) -
        el.offsetHeight -
        gap * 2 -
        safe.top -
        safe.bottom,
    )
    return { left, top, width, height, rtl: css.direction === 'rtl' }
  }
  function placeEditor() {
    const el = movePanel.value,
      host = root.value
    if (!el || !host) return
    const b = bounds(),
      anchor = host.getBoundingClientRect()
    const win = host.ownerDocument.defaultView!,
      viewport = win.visualViewport
    const right =
      (viewport?.offsetLeft ?? 0) + (viewport?.width ?? win.innerWidth) - 12
    const bottom =
      (viewport?.offsetTop ?? 0) + (viewport?.height ?? win.innerHeight) - 12
    moveStyle.value = {
      position: 'fixed',
      inset: 'auto',
      left: `${Math.max(b.left, Math.min(anchor.right - el.offsetWidth, right - el.offsetWidth))}px`,
      top: `${Math.max(b.top, anchor.bottom + el.offsetHeight <= bottom ? anchor.bottom : anchor.top - el.offsetHeight)}px`,
      maxHeight: `${Math.max(0, bottom - b.top)}px`,
      overflow: 'auto',
    }
  }
  function place(position = props.position, x?: number, y?: number) {
    if (!root.value || !props.active) return
    const b = bounds(),
      vertical = ['start', 'end'].includes(props.edge)
    const leftEdge = (props.edge === 'start') !== b.rtl
    const left =
      x ??
      (vertical
        ? b.left + (leftEdge ? 0 : b.width)
        : b.left + b.width * (b.rtl ? 1 - position : position))
    const top =
      y ??
      (vertical
        ? b.top + b.height * position
        : b.top + (props.edge === 'top' ? 0 : b.height))
    style.value = {
      position: 'fixed',
      left: `${Math.max(b.left, Math.min(left, b.left + b.width))}px`,
      top: `${Math.max(b.top, Math.min(top, b.top + b.height))}px`,
    }
    if (editing.value) void nextTick(placeEditor)
  }
  function commit(value: number) {
    props.requestPosition(clamp(value))
    void nextTick(() => place())
  }
  function showMove() {
    if (!props.draggable || !props.active) return
    lastFocus = root.value?.ownerDocument.activeElement as HTMLElement
    editing.value = true
    void nextTick(() => {
      placeEditor()
      editor.value?.focus()
    })
  }
  function closeMove() {
    editing.value = false
    lastFocus?.focus({ preventScroll: true })
  }
  function pointerdown(event: PointerEvent) {
    if (
      !props.draggable ||
      !props.active ||
      editing.value ||
      event.button !== 0
    )
      return
    release?.()
    const el = root.value!,
      doc = el.ownerDocument,
      start = el.getBoundingClientRect(),
      b = bounds()
    const x = event.clientX,
      y = event.clientY
    let dragged = false,
      held = false,
      pending = props.position
    const timer = setTimeout(() => {
      held = true
      suppress = true
      showMove()
    }, 600)
    const move = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId || held) return
      const dx = next.clientX - x,
        dy = next.clientY - y
      if (!dragged && Math.hypot(dx, dy) < 6) return
      clearTimeout(timer)
      dragged = true
      moving.value = true
      next.preventDefault()
      next.stopPropagation()
      const vertical = ['start', 'end'].includes(props.edge)
      const progress = vertical
        ? (start.top + dy - b.top) / (b.height || 1)
        : (start.left + dx - b.left) / (b.width || 1)
      pending = clamp(vertical || !b.rtl ? progress : 1 - progress)
      place(pending, start.left + dx, start.top + dy)
    }
    const end = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId) return
      suppress = dragged || held
      release?.()
      if (dragged && next.type !== 'pointercancel') commit(pending)
      else place()
      // Native click follows pointerup in the same task; do not consume a later activation.
      setTimeout(() => {
        suppress = false
      }, 0)
    }
    doc.addEventListener('pointermove', move, { passive: false })
    doc.addEventListener('pointerup', end)
    doc.addEventListener('pointercancel', end)
    release = () => {
      clearTimeout(timer)
      moving.value = false
      doc.removeEventListener('pointermove', move)
      doc.removeEventListener('pointerup', end)
      doc.removeEventListener('pointercancel', end)
      release = undefined
    }
  }
  function keydown(event: KeyboardEvent) {
    if (editing.value) {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeMove()
      }
      return
    }
    if (
      props.draggable &&
      (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10'))
    ) {
      event.preventDefault()
      event.stopPropagation()
      showMove()
      return
    }
    if (
      !props.draggable ||
      !event.altKey ||
      !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
    )
      return
    const vertical = ['start', 'end'].includes(props.edge)
    if (
      !(
        vertical ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
      ).includes(event.key)
    )
      return
    event.preventDefault()
    event.stopPropagation()
    let sign = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1
    if (!vertical && bounds().rtl) sign *= -1
    commit(props.position + sign * (event.shiftKey ? 0.1 : 0.02))
  }
  function observe() {
    if (disposed || !ready.value || !props.active || stop || !root.value) return
    const win = root.value.ownerDocument.defaultView!
    const update = () => place()
    win.addEventListener('resize', update)
    win.visualViewport?.addEventListener('resize', update)
    win.visualViewport?.addEventListener('scroll', update)
    observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(update)
    observer?.observe(root.value)
    directionObserver = new win.MutationObserver(update)
    for (
      let node: HTMLElement | null = root.value;
      node;
      node = node.parentElement
    )
      directionObserver.observe(node, {
        attributes: true,
        attributeFilter: ['dir', 'lang', 'class'],
      })
    stop = () => {
      observer?.disconnect()
      directionObserver?.disconnect()
      win.removeEventListener('resize', update)
      win.visualViewport?.removeEventListener('resize', update)
      win.visualViewport?.removeEventListener('scroll', update)
      stop = undefined
    }
  }
  onMounted(() => {
    ready.value = true
    void nextTick(() => {
      observe()
      place()
    })
  })
  watch(
    () => [props.position, props.edge, props.active, props.draggable],
    () => {
      release?.()
      if (!props.active) {
        editing.value = false
        stop?.()
      }
      void nextTick(() => {
        observe()
        place()
      })
    },
  )
  onBeforeUnmount(() => {
    disposed = true
    release?.()
    stop?.()
  })
  return {
    root,
    ready,
    moving,
    style,
    movePanel,
    moveStyle,
    editor,
    editing,
    closeMove,
    attributes: computed(() => ({
      role: props.draggable ? 'group' : undefined,
      'aria-label': props.draggable ? props.moveLabel : undefined,
      hidden: !props.active || undefined,
      'data-ui-floating': '',
      'data-moving': moving.value || undefined,
      'data-draggable': props.draggable || undefined,
      title: props.draggable ? props.moveLabel : undefined,
      onPointerdown: pointerdown,
      onKeydown: keydown,
      onContextmenu(event: MouseEvent) {
        if (props.draggable) {
          event.preventDefault()
          showMove()
        }
      },
      onClickCapture(event: MouseEvent) {
        if (suppress) {
          event.preventDefault()
          event.stopImmediatePropagation()
          suppress = false
        }
      },
    })),
    move(value: number) {
      commit(value / 100)
    },
  }
}
