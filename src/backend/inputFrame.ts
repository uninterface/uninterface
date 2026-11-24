import { computed, onDeactivated, onScopeDispose, ref, watch } from 'vue'
import { provideUiControlFrame } from './controlFrame'
import type { UiInputFrameViewProps } from './index'
/** Optional DOM mechanics for backend-owned shared surfaces. */
export function useUiInputFrameSurface(
  props: UiInputFrameViewProps,
  emit: { (event: 'enter'): void; (event: 'leave'): void },
) {
  const owner = provideUiControlFrame({
    disabled: () => props.binding.disabled,
    focusEditor: () => props.focusEditor(),
  })
  const focused = ref(false)
  let root: HTMLElement | undefined
  function synchronize() {
    if (!alive) return
    const active =
      !props.binding.disabled &&
      (Boolean(root?.contains(root.ownerDocument.activeElement)) ||
        owner.engaged.value)
    if (active === focused.value) return
    focused.value = active
    if (active) emit('enter')
    else emit('leave')
  }
  watch(owner.engaged, () => queueMicrotask(synchronize), { flush: 'post' })
  watch(
    () => props.binding.disabled,
    (disabled) => {
      if (disabled && root) {
        const active = root.ownerDocument.activeElement as HTMLElement | null
        if (active && root.contains(active)) active.blur()
      }
      synchronize()
    },
    { flush: 'post' },
  )
  onDeactivated(() => {
    focused.value = false
  })
  let alive = true
  onScopeDispose(() => {
    alive = false
  })
  function focusin(event: FocusEvent) {
    root = event.currentTarget as HTMLElement
    if (props.binding.disabled) {
      ;(event.target as HTMLElement).blur()
      return
    }
    if (!focused.value) {
      focused.value = true
      emit('enter')
    }
    if (event.target === event.currentTarget) void owner.focus()
  }
  function focusout(event: FocusEvent) {
    const root = event.currentTarget as HTMLElement
    const target = event.relatedTarget as Node | null
    if (target && root.contains(target)) return
    queueMicrotask(() => {
      if (!alive || root.contains(root.ownerDocument.activeElement)) return
      synchronize()
    })
  }
  function click(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (
      props.binding.disabled ||
      target.closest(
        'input,textarea,select,button,a,[contenteditable],label,[role="button"]',
      )
    )
      return
    void owner.focus()
  }
  const attrs = computed(() => ({
    id: props.binding.id,
    role: 'group',
    tabindex: props.binding.disabled ? undefined : -1,
    'data-ui-input-frame': '',
    'data-focused': focused.value ? '' : undefined,
    'data-engaged':
      !props.binding.disabled && owner.engaged.value ? '' : undefined,
    'aria-label': props.label,
    'aria-disabled': props.binding.disabled || undefined,
    'aria-invalid': props.binding.invalid || undefined,
    'aria-busy': props.binding.validating || undefined,
    onFocusin: focusin,
    onFocusout: focusout,
    onClick: click,
  }))
  return { focused, attrs, focus: owner.focus }
}
