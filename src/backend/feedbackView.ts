import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Ref,
} from 'vue'
import { useUiZPopup } from '../stacking/overlays'
import type { UiFeedbackItemViewProps } from './index'

/** Shared interaction/lifecycle protocol; native markup and transitions stay in each backend. */
export function useUiFeedbackView(
  props: UiFeedbackItemViewProps,
  root: Ref<HTMLElement | undefined>,
  options: { autoPresent?: boolean } = {},
) {
  useUiZPopup(() => root.value, { source: 'feedback item', scope: true })
  const announced = ref(false)
  let origin: HTMLElement | null = null
  let pointerInteraction = false
  let document: Document | undefined
  const visibility = () =>
    props.onPause(
      'document',
      Boolean(props.pauseWhenHidden && document?.hidden),
    )
  const summary = computed(() =>
    announced.value
      ? [props.title, props.message, ...(props.details ?? [])]
          .filter(Boolean)
          .join('. ')
      : '',
  )
  const role = computed(() =>
    props.announcement === 'off'
      ? undefined
      : props.announcement === 'assertive'
        ? 'alert'
        : 'status',
  )
  function focusOut(event: FocusEvent) {
    if (!root.value?.contains(event.relatedTarget as Node | null))
      props.onPause('focus', false)
  }
  function recoverFocus() {
    const element = root.value
    if (!element?.contains(element.ownerDocument.activeElement)) return
    if (pointerInteraction) {
      // Clicking close must not focus a sibling and silently pause its clock.
      // Keep keyboard continuation below, and retain a safe focus destination
      // when the original control was removed or belongs to another delivery.
      if (
        origin?.isConnected &&
        !origin.closest('[inert], [data-ui-feedback-item]')
      ) {
        origin.focus()
        if (!element.contains(element.ownerDocument.activeElement)) return
      }
      element.parentElement?.focus()
      return
    }
    const next = [
      ...(element.parentElement?.querySelectorAll<HTMLElement>(
        '[data-ui-feedback-item]:not([data-closing]) button:not(:disabled), [data-ui-feedback-item]:not([data-closing]) input:not(:disabled)',
      ) ?? []),
    ].find((candidate) => !element.contains(candidate))
    if (next && !element.contains(next)) next.focus()
    else if (origin?.isConnected && !origin.closest('[inert]')) origin.focus()
    else element.parentElement?.focus()
  }
  watch(
    () => props.open,
    (value) => {
      if (!value) recoverFocus()
    },
    { flush: 'pre' },
  )
  onMounted(async () => {
    document = root.value?.ownerDocument
    origin = document?.activeElement as HTMLElement | null
    document?.addEventListener('visibilitychange', visibility)
    visibility()
    await nextTick()
    announced.value = true
    if (options.autoPresent !== false) props.onPresented()
  })
  onBeforeUnmount(() => {
    recoverFocus()
    document?.removeEventListener('visibilitychange', visibility)
  })
  return {
    summary,
    role,
    events: {
      onPointerdownCapture: () => {
        pointerInteraction = true
      },
      onKeydownCapture: () => {
        pointerInteraction = false
      },
      onPointerenter: () => {
        if (props.pauseOnHover) props.onPause('hover', true)
      },
      onPointerleave: () => props.onPause('hover', false),
      onFocusin: () => {
        if (props.pauseOnFocus) props.onPause('focus', true)
      },
      onFocusout: focusOut,
      onKeydown: (event: KeyboardEvent) => {
        if (
          event.key === 'Escape' &&
          !event.defaultPrevented &&
          props.dismissible
        ) {
          event.preventDefault()
          event.stopPropagation()
          props.onDismissRequest()
        }
      },
    },
  }
}
