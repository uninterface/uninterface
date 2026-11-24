import { useZModalView } from '../stacking/overlays'
import { useUiZPart } from '../stacking/view'
import { zParentContext } from '../stacking/runtime'
import { provideTooltipModalBounds } from './tooltipGeometry'
import {
  computed,
  inject,
  defineComponent,
  provide,
  ref,
  onBeforeUnmount,
  nextTick,
  type InjectionKey,
  type ObjectDirective,
  type PropType,
  type Ref,
} from 'vue'
import type { UiModalViewProps } from './index'
import { useModalWidth } from './modalWidth'
import { overlayEscapeKey } from './overlayEscape'

// Owned popups must stay inside the native dialog's top-layer interaction scope.
const portalKey: InjectionKey<Ref<HTMLElement | undefined>> =
  Symbol('ui-modal-portal')
export function provideOverlayTarget(target: Ref<HTMLElement | undefined>) {
  provide(portalKey, target)
}
export function useUiOverlayTarget(retained?: () => boolean) {
  const target = inject(portalKey, ref<HTMLElement>())
  if (!retained) return target
  // Reparenting a live native popover dismisses it and drops focus.
  const session = computed<{ target: HTMLElement | undefined } | undefined>(
    (previous) =>
      retained() ? (previous ?? { target: target.value }) : undefined,
  )
  return computed(() => (session.value ? session.value.target : target.value))
}
const locks = new WeakMap<
  HTMLElement,
  { count: number; x: string; y: string; xp: string; yp: string }
>()
function lockElement(element: HTMLElement) {
  let state = locks.get(element)
  if (!state) {
    const style = element.style
    state = {
      count: 0,
      x: style.getPropertyValue('overflow-x'),
      y: style.getPropertyValue('overflow-y'),
      xp: style.getPropertyPriority('overflow-x'),
      yp: style.getPropertyPriority('overflow-y'),
    }
    locks.set(element, state)
  }
  if (state.count++ === 0) {
    element.style.setProperty('overflow-x', 'hidden')
    element.style.setProperty('overflow-y', 'hidden')
  }
  let released = false
  return () => {
    if (released) return
    released = true
    if (--state.count) return
    for (const [name, value, priority] of [
      ['overflow-x', state.x, state.xp],
      ['overflow-y', state.y, state.yp],
    ]) {
      if (value) element.style.setProperty(name, value, priority)
      else element.style.removeProperty(name)
    }
    locks.delete(element)
  }
}
function lock(dialog: HTMLElement) {
  const elements = new Set<HTMLElement>([dialog.ownerDocument.documentElement])
  for (
    let parent = dialog.parentElement;
    parent;
    parent = parent.parentElement
  ) {
    const style = dialog.ownerDocument.defaultView!.getComputedStyle(parent)
    if (
      locks.has(parent) ||
      /auto|scroll/.test(
        `${style.overflowX} ${style.overflowY} ${style.overflow}`,
      )
    )
      elements.add(parent)
  }
  const release = [...elements].map(lockElement)
  return () => release.reverse().forEach((unlock) => unlock())
}

// HTML sequential focus navigation orders positive tabindex values first:
// https://html.spec.whatwg.org/multipage/interaction.html#sequential-focus-navigation
// Find the boundary candidates on each keypress because hosted content and
// owned popups can change the available stops. The browser handles traversal
// between those boundaries.
function tabStops(dialog: HTMLDialogElement): HTMLElement[] {
  const candidates = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'a[href], area[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable]:not([contenteditable="false"]), audio[controls], video[controls]',
    ),
  ).filter((element) => {
    if (
      element.closest('dialog') !== dialog ||
      element.closest('[inert]') ||
      element.matches(':disabled') ||
      (element.tabIndex < 0 &&
        !(
          element.hasAttribute('contenteditable') &&
          element.getAttribute('contenteditable') !== 'false' &&
          !element.hasAttribute('tabindex')
        )) ||
      !element.getClientRects().length
    )
      return false
    const visibility =
      dialog.ownerDocument.defaultView!.getComputedStyle(element).visibility
    return visibility !== 'hidden' && visibility !== 'collapse'
  })
  return candidates
    .filter((element) => {
      if (!element.matches('input[type="radio"][name]')) return true
      const radio = element as HTMLInputElement
      if (!radio.name) return true
      // HTML groups radios by name and form owner within the same tree:
      // https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio)
      const group = candidates.filter(
        (other) =>
          other.matches('input[type="radio"]') &&
          (other as HTMLInputElement).name === radio.name &&
          (other as HTMLInputElement).form === radio.form,
      ) as HTMLInputElement[]
      const checked = group.find((other) => other.checked)
      // The APG Radio Group pattern describes the checked stop and notes that
      // native unchecked groups can enter at the last radio with Shift+Tab:
      // https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction
      // Keep both unchecked boundaries and let the browser handle entry.
      return !checked || element === checked
    })
    .sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity))
}

/** Backend-owned motion hooks. Cleanup never depends on a transition event firing. */
export interface UiModalViewMotion {
  beforeEnter?(element: HTMLDialogElement): void
  enter?(element: HTMLDialogElement): Promise<void>
  leave?(element: HTMLDialogElement): Promise<void>
}

type UiModalCssMotionOptions = { includeBackdrop?: boolean }

/** Wait only for the surface's current finite CSS motion, not animated content. */
export async function settleUiModalMotion(
  element: HTMLElement,
  { includeBackdrop = false }: UiModalCssMotionOptions = {},
) {
  if (!element.isConnected || !element.getAnimations) return
  // Browsers can require subtree enumeration to expose ::backdrop. Keep only
  // the surface and its own backdrop so content motion cannot delay closure.
  const animations = includeBackdrop
    ? element.getAnimations({ subtree: true }).filter((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        return (
          effect?.target === element &&
          (!effect.pseudoElement || effect.pseudoElement === '::backdrop')
        )
      })
    : element.getAnimations()
  await Promise.allSettled(
    animations
      .filter(
        (animation) =>
          animation.effect?.getComputedTiming().iterations !== Infinity &&
          animation.playState !== 'paused' &&
          animation.playbackRate !== 0,
      )
      .map((animation) => animation.finished),
  )
}

/** Native Vue-style transition classes supplied by the backend. */
export function createUiModalCssMotion(
  name: string,
  options?: UiModalCssMotionOptions,
): UiModalViewMotion {
  const reduced = (element: HTMLElement) =>
    element.ownerDocument.defaultView?.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
  const change = async (
    element: HTMLDialogElement,
    phase: 'enter' | 'leave',
  ) => {
    if (!element.getAnimations || reduced(element)) return
    const from = `${name}-${phase}-from`,
      active = `${name}-${phase}-active`,
      to = `${name}-${phase}-to`
    // A docked surface may already have a computed visible resting style.
    // Establish the entry origin without animating toward it first; otherwise
    // the immediate return to rest cancels the entry at its first frame.
    if (phase === 'enter') {
      const transition = element.style.getPropertyValue('transition')
      const priority = element.style.getPropertyPriority('transition')
      element.style.setProperty('transition', 'none', 'important')
      element.classList.add(from)
      void element.offsetWidth
      if (transition)
        element.style.setProperty('transition', transition, priority)
      else element.style.removeProperty('transition')
    }
    element.classList.add(from, active)
    void element.offsetWidth
    element.classList.remove(from)
    element.classList.add(to)
    try {
      await settleUiModalMotion(element, options)
    } finally {
      element.classList.remove(from, active, to)
    }
  }
  return {
    enter: (element) => change(element, 'enter'),
    leave: (element) => change(element, 'leave'),
  }
}

/** Optional native-dialog mechanics. Backends supply their own surfaces and slots. */
export function useUiModalView(
  props: () => UiModalViewProps,
  emit: {
    (event: 'cancel', reason: UiModalViewProps['closeOn'][number]): void
  },
  motion: UiModalViewMotion = {},
  options: { nativeSizing?: boolean; disabled?: () => boolean } = {},
) {
  const zSurface = useZModalView(!options.nativeSizing)
  const dialog = ref<HTMLDialogElement>()
  const widthStyle = options.nativeSizing
    ? computed(() => ({}))
    : useModalWidth(props, dialog)
  const body = ref<HTMLElement>()
  const title = ref<HTMLElement>()
  const regions = { header: ref<HTMLElement>(), footer: ref<HTMLElement>() }
  const part = useUiZPart()
  const vModalPart: ObjectDirective<HTMLElement, keyof typeof regions> = {
    mounted(element, { value }) {
      element.dataset.uiModalPart = value
      regions[value].value = element
      part.mounted(element, { value: zSurface[value] })
    },
    beforeUnmount(element, { value }) {
      if (regions[value].value === element) regions[value].value = undefined
      part.beforeUnmount(element)
    },
  }
  const ModalPart = defineComponent({
    props: {
      part: { type: String as PropType<keyof typeof regions>, required: true },
    },
    setup(props, { slots }) {
      provide(zParentContext, () => zSurface[props.part]?.handle)
      return () => slots.default?.()
    },
  })
  provideTooltipModalBounds(
    () => dialog.value,
    () => regions.header.value,
    () => regions.footer.value,
  )
  provide(portalKey, dialog as Ref<HTMLElement | undefined>)
  let returnTo: HTMLElement | undefined
  let unlock: (() => void) | undefined
  let backgroundPress = false
  let closed = false
  const outside = (event: MouseEvent) => {
    const box = dialog.value?.getBoundingClientRect()
    return (
      event.target === dialog.value &&
      box &&
      (event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom)
    )
  }
  function pointerdown(event: PointerEvent) {
    backgroundPress = Boolean(outside(event))
  }
  function click(event: MouseEvent) {
    if (
      backgroundPress &&
      outside(event) &&
      props().closeOn.includes('backdrop') &&
      !props().pendingClose
    )
      emit('cancel', 'backdrop')
    backgroundPress = false
  }
  function cancel(event: Event) {
    event.preventDefault()
    event.stopPropagation()
    if (
      !('repeat' in event && event.repeat) &&
      !closed &&
      !options.disabled?.() &&
      props().closeOn.includes('escape') &&
      !props().pendingClose
    )
      emit('cancel', 'escape')
  }
  provide(overlayEscapeKey, (event) => {
    if (event.key === 'Escape' && !event.defaultPrevented && dialog.value?.open)
      cancel(event)
  })
  // HTML modal dialogs make the rest of the document inert:
  // https://html.spec.whatwg.org/multipage/interaction.html#modal-dialogs-and-inert-subtrees
  // The APG dialog pattern calls for Tab and Shift+Tab to cycle within the
  // dialog. Wrap at the ends so focus cannot continue into browser chrome.
  // https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction
  function keydown(event: KeyboardEvent) {
    const element = dialog.value
    if (element?.open && event.key === 'Escape' && event.repeat) {
      event.preventDefault()
      return
    }
    if (
      !element?.open ||
      event.key !== 'Tab' ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.target as Element | null)?.closest('dialog') !== element
    )
      return
    const stops = tabStops(element)
    const active = element.ownerDocument.activeElement
    const first = stops[0]
    const last = stops.at(-1)
    if (
      !first ||
      (event.shiftKey && (active === first || active === title.value)) ||
      (!event.shiftKey && active === last)
    ) {
      event.preventDefault()
      ;(event.shiftKey ? last : first)?.focus()
      if (!first) title.value?.focus({ preventScroll: true })
    }
  }
  function cleanup() {
    dialog.value?.removeEventListener('keydown', keydown)
    if (dialog.value?.open) dialog.value.close()
    zSurface.closed()
    unlock?.()
    unlock = undefined
    if (returnTo?.isConnected && !returnTo.closest('[inert]'))
      returnTo.focus({ preventScroll: true })
    returnTo = undefined
  }
  onBeforeUnmount(cleanup)
  return {
    widthStyle,
    vModalPart,
    ModalPart,
    dialog,
    body,
    title,
    pointerdown,
    click,
    cancel,
    async open() {
      await nextTick()
      if (closed) return
      const element = dialog.value
      if (!element?.showModal)
        throw new Error(
          'UiModal requires browser HTMLDialogElement.showModal support.',
        )
      returnTo = element.ownerDocument.activeElement as HTMLElement | undefined
      unlock = lock(element)
      motion.beforeEnter?.(element)
      try {
        zSurface.open(element)
        element.showModal()
      } catch (error) {
        zSurface.closed()
        throw error
      }
      element.addEventListener('keydown', keydown)
      // The APG dialog pattern suggests focusing static content near the start
      // for long or structured dialogs. Use the title as Uninterface's stable
      // initial focus target and preserve the current scroll position.
      // https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction
      title.value?.focus({ preventScroll: true })
      await motion.enter?.(element)
    },
    async close() {
      closed = true
      try {
        if (dialog.value?.open) await motion.leave?.(dialog.value)
      } finally {
        cleanup()
      }
      await nextTick()
    },
  }
}
