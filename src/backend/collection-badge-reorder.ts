import { computed, nextTick, onScopeDispose, ref, watch, type Ref } from 'vue'

/** Private collection presentation binding; source query remains core-owned. */
export interface UiCollectionBadgeReorder {
  key: string
  keys: readonly string[]
  label: string
  hint: string
  move(to: number): Promise<boolean>
}

/** Backend opt-in mechanics for the explicitly marked sort-badge composition. */
export function useUiCollectionBadgeReorder(
  body: Ref<HTMLElement | undefined>,
  props: () => { disabled: boolean; reorder?: UiCollectionBadgeReorder },
) {
  const announcement = ref('')
  const enabled = () => !props().disabled && !!props().reorder
  let gesture:
    | {
        pointer: number
        x: number
        y: number
        active: boolean
        to?: number
        keys: string[]
        host: HTMLElement
        group: HTMLElement
      }
    | undefined
  let marker: HTMLElement | undefined
  let stop: (() => void) | undefined
  let suppressClick = false
  let suppressTimer: ReturnType<typeof setTimeout> | undefined
  let alive = true
  let movement = 0
  function clearMarker() {
    marker?.removeAttribute('data-ui-sort-drop')
    marker = undefined
  }
  function cancel() {
    const old = gesture
    gesture = undefined
    clearMarker()
    old?.host.removeAttribute('data-ui-sort-dragging')
    stop?.()
    stop = undefined
    if (old && body.value?.hasPointerCapture?.(old.pointer))
      body.value.releasePointerCapture(old.pointer)
  }
  function ignoreClick() {
    suppressClick = true
    clearTimeout(suppressTimer)
    suppressTimer = setTimeout(() => (suppressClick = false), 0)
  }
  async function move(to: number) {
    const binding = props().reorder
    if (
      !enabled() ||
      !binding ||
      !Number.isInteger(to) ||
      to < 0 ||
      to >= binding.keys.length
    )
      return
    if (binding.keys.indexOf(binding.key) === to) return
    const target = body.value
    const version = ++movement
    announcement.value = ''
    const pending = binding.move(to)
    // The query changes synchronously; do not wait for a remote read to restore focus.
    await nextTick()
    if (
      alive &&
      target?.isConnected &&
      (target.ownerDocument.activeElement === target.ownerDocument.body ||
        target.ownerDocument.activeElement === target)
    )
      target.focus({ preventScroll: true })
    if (await pending) {
      if (alive && version === movement)
        announcement.value = props().reorder?.label ?? ''
    }
  }
  function keydown(event: KeyboardEvent) {
    if (event.target !== body.value || !enabled()) return
    if (event.key === 'Escape' && gesture) {
      event.preventDefault()
      event.stopPropagation()
      cancel()
      return
    }
    if (
      !event.altKey ||
      !event.shiftKey ||
      event.ctrlKey ||
      event.metaKey ||
      !['ArrowLeft', 'ArrowRight'].includes(event.key)
    )
      return
    event.preventDefault()
    event.stopPropagation()
    cancel()
    const binding = props().reorder!
    const rtl =
      body.value!.ownerDocument.defaultView!.getComputedStyle(body.value!)
        .direction === 'rtl'
    const offset = (event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1)
    void move(binding.keys.indexOf(binding.key) + offset)
  }
  function pointerdown(event: PointerEvent) {
    if (!enabled() || event.button !== 0 || event.isPrimary === false) return
    const node = body.value
    const host = node?.closest<HTMLElement>('[data-ui-sort-badge]')
    const group = host?.closest<HTMLElement>('[data-ui-collection-sort-badges]')
    if (!node || !host || !group) return
    cancel()
    suppressClick = false
    clearTimeout(suppressTimer)
    node.focus({ preventScroll: true })
    // Touch retains native vertical scrolling; horizontal intent starts a drag.
    if (event.pointerType !== 'touch') event.preventDefault()
    gesture = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      active: false,
      keys: [...props().reorder!.keys],
      host,
      group,
    }
    node.setPointerCapture?.(event.pointerId)
    const doc = node.ownerDocument
    const escape = (key: KeyboardEvent) => {
      if (key.key !== 'Escape') return
      key.preventDefault()
      key.stopPropagation()
      ignoreClick()
      cancel()
    }
    const abandon = () => cancel()
    doc.addEventListener('keydown', escape, true)
    doc.addEventListener('scroll', abandon, true)
    doc.defaultView?.addEventListener('resize', abandon)
    doc.defaultView?.addEventListener('blur', abandon)
    stop = () => {
      doc.removeEventListener('keydown', escape, true)
      doc.removeEventListener('scroll', abandon, true)
      doc.defaultView?.removeEventListener('resize', abandon)
      doc.defaultView?.removeEventListener('blur', abandon)
    }
  }
  function pointermove(event: PointerEvent) {
    const current = gesture
    if (!current || current.pointer !== event.pointerId) return
    if (!enabled() || !body.value?.isConnected) {
      cancel()
      return
    }
    if (!current.active) {
      if (Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6)
        return
      if (
        event.pointerType === 'touch' &&
        Math.abs(event.clientY - current.y) >
          Math.abs(event.clientX - current.x)
      ) {
        cancel()
        return
      }
      current.active = true
      current.host.setAttribute('data-ui-sort-dragging', '')
    }
    event.preventDefault()
    clearMarker()
    current.to = undefined
    const bounds = current.group.getBoundingClientRect()
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top - 8 ||
      event.clientY > bounds.bottom + 8
    )
      return
    const peers = [
      ...current.group.querySelectorAll<HTMLElement>('[data-ui-sort-badge]'),
    ].filter((node) => node !== current.host && node.getClientRects().length)
    const distance = (node: HTMLElement) => {
      const r = node.getBoundingClientRect()
      return Math.hypot(
        Math.max(r.left - event.clientX, 0, event.clientX - r.right),
        Math.max(r.top - event.clientY, 0, event.clientY - r.bottom),
      )
    }
    const target = peers.sort((a, b) => distance(a) - distance(b))[0]
    if (!target) return
    const r = target.getBoundingClientRect()
    const rtl =
      target.ownerDocument.defaultView!.getComputedStyle(target).direction ===
      'rtl'
    const after = rtl
      ? event.clientX < r.left + r.width / 2
      : event.clientX > r.left + r.width / 2
    const remaining = current.keys.filter((key) => key !== props().reorder!.key)
    const index = remaining.indexOf(target.dataset.uiSortBadge!)
    if (index < 0) return
    current.to = index + (after ? 1 : 0)
    target.setAttribute('data-ui-sort-drop', after ? 'after' : 'before')
    marker = target
  }
  function pointerup(event: PointerEvent) {
    if (!gesture || gesture.pointer !== event.pointerId) return
    if (gesture.active) pointermove(event)
    const current = gesture
    if (!current) return
    if (current.active) ignoreClick()
    cancel()
    if (current.active && current.to !== undefined) void move(current.to)
  }
  watch(
    () =>
      JSON.stringify([
        props().disabled,
        props().reorder?.key,
        props().reorder?.keys,
      ]),
    cancel,
    { flush: 'sync' },
  )
  onScopeDispose(() => {
    alive = false
    cancel()
    clearTimeout(suppressTimer)
  })
  const bindings = computed(() =>
    props().reorder
      ? {
          tabindex: props().disabled ? -1 : 0,
          role: 'group',
          'aria-label': props().reorder!.label,
          'aria-description': props().reorder!.hint,
          'aria-disabled': props().disabled || undefined,
          'aria-keyshortcuts': 'Alt+Shift+ArrowLeft Alt+Shift+ArrowRight',
          title: props().reorder!.hint,
          'data-ui-sort-reorder': '',
          onKeydown: keydown,
          onPointerdown: pointerdown,
          onPointermove: pointermove,
          onPointerup: pointerup,
          onPointercancel: cancel,
          onLostpointercapture: cancel,
          onDragstart: (event: DragEvent) => event.preventDefault(),
          onClick: (event: MouseEvent) => {
            if (suppressClick) {
              event.preventDefault()
              event.stopPropagation()
            }
          },
        }
      : {},
  )
  return { bindings, announcement }
}
