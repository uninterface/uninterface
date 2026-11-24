import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
} from 'vue'
import type { UiOverlayViewProps } from './index'
import type { UiOverlayCloseTrigger } from '../controls/overlay'
import {
  provideOverlayTarget,
  useUiOverlayTarget,
  useUiModalView,
  type UiModalViewMotion,
} from './modalView'
import { useUiZPopup } from '../stacking/overlays'
import { overlayEscapeKey } from './overlayEscape'

type Events = {
  (event: 'cancel', reason: UiOverlayCloseTrigger): void
  (event: 'update:expanded', expanded: boolean): void
  (event: 'failure', error: unknown): void
}
/** Resolve only explicitly forwarded host markers, never opaque child internals. */
export function useUiOverlayHost(props: UiOverlayViewProps, emit: Events) {
  const trigger = shallowRef<HTMLElement>()
  const anchor = shallowRef<HTMLElement>()
  let observer: MutationObserver | undefined
  function locate() {
    if (typeof document === 'undefined') return
    const find = (attribute: string) => {
      const matches = [
        ...document.querySelectorAll<HTMLElement>(`[${attribute}]`),
      ].filter((el) => el.getAttribute(attribute) === props.id)
      if (matches.length > 1)
        throw new Error('Overlay host bindings require one target each.')
      return matches[0]
    }
    trigger.value = find('data-ui-overlay-trigger')
    anchor.value = find('data-ui-overlay-anchor') ?? trigger.value
  }
  onMounted(() => {
    locate()
    observer = new MutationObserver(locate)
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-ui-overlay-trigger', 'data-ui-overlay-anchor'],
    })
  })
  onBeforeUnmount(() => observer?.disconnect())
  const buttonTrigger = computed(() => ({
    'data-ui-overlay-trigger': props.id,
    'aria-haspopup': props.panel ? undefined : 'dialog',
    'aria-expanded': props.active,
    'aria-controls': props.mounted ? `${props.id}-surface` : undefined,
    disabled: props.disabled || props.pendingClose,
    onClickCapture(event: MouseEvent) {
      if (props.disabled || props.pendingClose) {
        event.preventDefault()
        event.stopImmediatePropagation()
        return
      }
      if (props.panel) {
        if (!props.active || props.closeOn.includes('trigger'))
          emit('update:expanded', !props.active)
      } else if (props.active) {
        // Prevent a second user run handler from competing with trigger dismissal.
        event.preventDefault()
        event.stopImmediatePropagation()
        if (props.closeOn.includes('trigger')) emit('cancel', 'trigger')
      }
    },
  }))
  return {
    trigger,
    anchor,
    buttonTrigger,
    anchorBinding: { 'data-ui-overlay-anchor': props.id },
  }
}

const activePanels = new WeakMap<Document, HTMLElement[]>()
/** Native interaction mechanics shared by independently rendered backend surfaces. */
export function useUiOverlayView(
  props: () => UiOverlayViewProps,
  kind: 'drawer' | 'popover',
  anchor: () => HTMLElement | undefined,
  trigger: () => HTMLElement | undefined,
  emit: Events,
  motion: UiModalViewMotion = {},
) {
  const modal = props().modal
  const native = modal
    ? useUiModalView(
        () => ({
          title: props().title ?? props().name,
          width: 'auto',
          closeLabel: props().closeLabel,
          closeOn: props().closeOn.flatMap((reason) =>
            reason === 'outside'
              ? ['backdrop' as const]
              : reason === 'trigger' || reason === 'drag'
                ? []
                : [reason],
          ),
          pendingClose: props().pendingClose,
        }),
        (_, reason) =>
          emit('cancel', reason === 'backdrop' ? 'outside' : reason),
        motion,
        { nativeSizing: true, disabled: () => props().disabled },
      )
    : undefined
  const surface = native?.dialog ?? ref<HTMLDialogElement>()
  const heading = native?.title ?? ref<HTMLElement>()
  // Optional backend-owned decoration. The helper supplies resolved geometry;
  // the backend supplies native artwork and the main-axis edge treatment.
  const arrow = ref<HTMLElement>()
  const placedSide = ref<'top' | 'bottom' | 'left' | 'right'>('bottom')
  const visible = ref(false)
  const cssPanel = ref(false)
  const enclosingTarget = useUiOverlayTarget()
  // Docking creates a layout region, not a native top-layer interaction scope.
  // Let its popups escape the region's clipping/stacking boundaries while
  // retaining an enclosing dialog/popover host when one exists.
  if (!modal)
    provideOverlayTarget(
      computed(() => (props().docked ? enclosingTarget.value : surface.value)),
    )
  const z = !modal
    ? useUiZPopup(
        () => (visible.value && !props().docked ? surface.value : undefined),
        {
          source: kind === 'drawer' ? 'UiDrawer' : 'UiPopover',
          topLayer: () => !cssPanel.value,
          observe: false,
          scope: true,
          scopeActive: () => !props().docked,
        },
      )
    : undefined
  let returnTo: HTMLElement | undefined
  let stopPosition: (() => void) | undefined
  let stopEvents: (() => void) | undefined
  let disposed = false
  function request(reason: UiOverlayCloseTrigger) {
    if (
      props().closeOn.includes(reason) &&
      !props().pendingClose &&
      !props().disabled
    )
      emit('cancel', reason)
  }
  function isTop() {
    const element = surface.value
    if (!element) return false
    if (activePanels.get(element.ownerDocument)?.at(-1) !== element)
      return false
    const dialogs = [
      ...element.ownerDocument.querySelectorAll<HTMLDialogElement>(
        'dialog[open]',
      ),
    ]
    const topDialog = dialogs.at(-1)
    return !topDialog || topDialog === element || topDialog.contains(element)
  }
  function key(event: KeyboardEvent) {
    if (!isTop() || event.defaultPrevented || event.key !== 'Escape') return
    // Consume Escape even when dismissal is disabled or denied: it belongs here.
    event.preventDefault()
    event.stopPropagation()
    if (!event.repeat) request('escape')
  }
  if (!modal) provide(overlayEscapeKey, key)
  function listen() {
    const element = surface.value!,
      doc = element.ownerDocument
    const stack = activePanels.get(doc) ?? []
    stack.push(element)
    activePanels.set(doc, stack)
    const outside = (event: PointerEvent) => {
      if (
        !isTop() ||
        element.contains(event.target as Node) ||
        trigger()?.contains(event.target as Node)
      )
        return
      request('outside')
    }
    // Dialog cancel is owned by native mechanics; nonmodal popovers use bubbled keys.
    if (!modal) {
      doc.addEventListener('pointerdown', outside)
      doc.addEventListener('keydown', key)
    }
    stopEvents = () => {
      doc.removeEventListener('pointerdown', outside)
      doc.removeEventListener('keydown', key)
      const index = stack.indexOf(element)
      if (index !== -1) stack.splice(index, 1)
    }
  }
  function position() {
    if (kind !== 'popover') return
    const element = surface.value!,
      target = anchor()
    if (!target?.isConnected)
      throw new Error('UiPopover requires a connected host or anchor.')
    const win = target.ownerDocument.defaultView!
    let frame = 0,
      previous = ''
    const place = () => {
      if (!visible.value) return
      // The host can transfer its explicit anchor while keeping the same run.
      // Resolve each frame rather than retaining the opening target.
      const target = anchor()
      if (!target?.isConnected || target.closest('[hidden], [inert]')) {
        emit('failure', new Error('UiPopover anchor is no longer available.'))
        return
      }
      const a = target.getBoundingClientRect(),
        b = element.getBoundingClientRect()
      const rtl = win.getComputedStyle(target).direction === 'rtl'
      const viewport = win.visualViewport
      const left = (viewport?.offsetLeft ?? 0) + 8,
        top = (viewport?.offsetTop ?? 0) + 8
      const right = left + (viewport?.width ?? win.innerWidth) - 16,
        bottom = top + (viewport?.height ?? win.innerHeight) - 16
      const preference = props().placement
      let side: 'top' | 'bottom' | 'left' | 'right' =
        preference === 'start'
          ? rtl
            ? 'right'
            : 'left'
          : preference === 'end'
            ? rtl
              ? 'left'
              : 'right'
            : preference
      const fits = {
        top: a.top - b.height - 8 >= top,
        bottom: a.bottom + b.height + 8 <= bottom,
        left: a.left - b.width - 8 >= left,
        right: a.right + b.width + 8 <= right,
      }
      const opposite = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
      } as const
      if (!fits[side] && fits[opposite[side]]) side = opposite[side]
      placedSide.value = side
      let x = a.left,
        y = a.bottom + 8
      const align = props().align
      if (side === 'top' || side === 'bottom') {
        x =
          align === 'center'
            ? a.left + (a.width - b.width) / 2
            : (align === 'start') !== rtl
              ? a.left
              : a.right - b.width
        y = side === 'top' ? a.top - b.height - 8 : a.bottom + 8
      } else {
        x = side === 'left' ? a.left - b.width - 8 : a.right + 8
        y =
          align === 'center'
            ? a.top + (a.height - b.height) / 2
            : align === 'start'
              ? a.top
              : a.bottom - b.height
      }
      x = Math.max(left, Math.min(x, right - b.width))
      y = Math.max(top, Math.min(y, bottom - b.height))
      const next = `${x}:${y}:${right - left}:${bottom - top}`
      if (next !== previous) {
        previous = next
        Object.assign(element.style, {
          left: `${x}px`,
          top: `${y}px`,
          maxWidth: `${right - left}px`,
          maxHeight: `${bottom - top}px`,
        })
      }
      const decoration = arrow.value
      if (decoration) {
        const parent =
          (decoration.offsetParent as HTMLElement | null) ?? element
        const bounds = parent.getBoundingClientRect()
        const vertical = side === 'top' || side === 'bottom'
        const size = vertical ? decoration.offsetWidth : decoration.offsetHeight
        const extent = vertical ? parent.clientWidth : parent.clientHeight
        const origin = vertical
          ? bounds.left + parent.clientLeft
          : bounds.top + parent.clientTop
        const start = vertical ? a.left : a.top
        const end = vertical ? a.right : a.bottom
        const style = win.getComputedStyle(parent)
        const radius = Math.max(
          ...[
            style.borderTopLeftRadius,
            style.borderTopRightRadius,
            style.borderBottomLeftRadius,
            style.borderBottomRightRadius,
          ].map((value) => parseFloat(value) || 0),
        )
        const padding = Math.min(radius, Math.max(0, (extent - size) / 2))
        const offset = Math.max(
          padding,
          Math.min(
            (start + end) / 2 - origin - size / 2,
            extent - padding - size,
          ),
        )
        const tip = origin + offset + size / 2
        const facesAnchor =
          side === 'top'
            ? bounds.bottom <= a.top
            : side === 'bottom'
              ? bounds.top >= a.bottom
              : side === 'left'
                ? bounds.right <= a.left
                : bounds.left >= a.right
        Object.assign(decoration.style, {
          left: vertical ? `${offset}px` : '',
          top: vertical ? '' : `${offset}px`,
          // Clamping can move the surface across its anchor. Do not draw a
          // misleading pointer through the surface or toward unrelated content.
          visibility: !facesAnchor || tip < start || tip > end ? 'hidden' : '',
        })
      }
      // Anchors can move without resize/scroll (layout changes, transforms).
      frame = win.requestAnimationFrame(place)
    }
    place()
    stopPosition = () => win.cancelAnimationFrame(frame)
  }
  async function open() {
    await nextTick()
    if (disposed || visible.value) return
    const element = surface.value
    if (!element) throw new Error('Overlay surface is not mounted.')
    if (kind === 'popover' && !anchor()?.isConnected)
      throw new Error('UiPopover requires a connected host or anchor.')
    returnTo =
      trigger() ??
      (element.ownerDocument.activeElement as HTMLElement | undefined)
    visible.value = true
    try {
      if (native) await native.open()
      else {
        if (!props().docked && !cssPanel.value && !element.showPopover)
          throw new Error(
            'Nonmodal overlays require browser Popover API support.',
          )
        if (!props().docked) z!.prepare(element)
        await nextTick()
        motion.beforeEnter?.(element)
        if (!props().docked && !cssPanel.value) element.showPopover()
        heading.value?.focus({ preventScroll: true })
        await motion.enter?.(element)
      }
      if (disposed) return
      listen()
      position()
    } catch (error) {
      await close()
      throw error
    }
  }
  async function close() {
    stopPosition?.()
    stopPosition = undefined
    stopEvents?.()
    stopEvents = undefined
    const element = surface.value
    if (native) await native.close()
    else {
      if (element) {
        try {
          if (visible.value && !disposed) await motion.leave?.(element)
        } finally {
          try {
            if (element.isConnected && element.hasAttribute('popover'))
              element.hidePopover()
          } finally {
            z?.closed()
          }
        }
      }
      // Background interaction remains available during a panel's exit. Do not
      // reclaim focus if the user has moved it elsewhere while motion settled.
      const restore =
        element?.contains(element.ownerDocument.activeElement) ||
        element?.ownerDocument.activeElement === element?.ownerDocument.body
      if (
        restore &&
        returnTo?.isConnected &&
        !returnTo.closest('[inert], [hidden]')
      )
        returnTo.focus({ preventScroll: true })
    }
    visible.value = false
    returnTo = undefined
  }
  watch(
    () => props().docked,
    () => {
      if (props().docked) cssPanel.value = false
      const element = surface.value
      const focused = element?.contains(element.ownerDocument.activeElement)
        ? (element.ownerDocument.activeElement as HTMLElement)
        : undefined
      if (focused)
        void nextTick(() => {
          if (
            !disposed &&
            props().active &&
            focused.isConnected &&
            (element?.ownerDocument.activeElement ===
              element?.ownerDocument.body ||
              element?.ownerDocument.activeElement === trigger())
          )
            focused.focus({ preventScroll: true })
        })
    },
    { flush: 'sync' },
  )
  let stopPanel: (() => void) | undefined
  // Serialize physical transitions and read the latest owner state. A collapse
  // during entry or re-expansion during exit must not strand a hidden panel.
  let panelTransition = Promise.resolve()
  onMounted(() => {
    if (props().panel)
      stopPanel = watch(
        () => [props().active, props().docked],
        () => {
          panelTransition = panelTransition
            .then(async () => {
              if (disposed) return
              if (!props().active) return close()
              if (!visible.value) return open()
              const element = surface.value!
              const focused = element.contains(
                element.ownerDocument.activeElement,
              )
                ? (element.ownerDocument.activeElement as HTMLElement)
                : undefined
              if (props().docked) {
                if (element.hasAttribute('popover')) element.hidePopover()
                z?.closed()
              } else {
                // Promoting the parent below an already-live popup would reverse
                // native top-layer order. Keep an ordinary CSS surface for this
                // overlay presentation, retaining the same registered group.
                z!.prepare(element, false)
                cssPanel.value = z!.hasNativeAbove()
                await nextTick()
                if (disposed || !props().active || props().docked) return
                z!.prepare(element)
                if (!cssPanel.value) element.showPopover()
              }
              focused?.focus({ preventScroll: true })
            })
            .catch((error) => emit('failure', error))
        },
        { immediate: true, flush: 'post' },
      )
  })
  onBeforeUnmount(() => {
    disposed = true
    stopPanel?.()
    void close()
  })
  return {
    surface,
    visible,
    cssPanel,
    heading,
    arrow,
    placedSide,
    open,
    close,
    widthStyle: native?.widthStyle,
    cancel: native?.cancel,
    pointerdown: native?.pointerdown,
    click: native?.click,
  }
}
