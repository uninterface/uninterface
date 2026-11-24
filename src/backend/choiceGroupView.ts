import {
  nextTick,
  onBeforeUpdate,
  onUpdated,
  onMounted,
  onScopeDispose,
} from 'vue'
import type { UiChoiceGroupViewProps } from './index'
import { focusUiTarget } from './focus'
import { useUiFallbackFocus } from './formFocus'

/** Optional interaction mechanics; backends resolve their own concrete targets. */
export function useUiChoiceGroupView(
  props: UiChoiceGroupViewProps,
  multiple: () => boolean,
  root: () => HTMLElement | undefined,
  targets: () => { key: string; element: HTMLElement }[],
  choose: (key: string) => void,
  blur: () => void,
  options: { fieldLabel?: boolean } = {},
) {
  const enabled = () =>
    props.binding.disabled || !props.available
      ? []
      : targets().filter((target) =>
          props.options.some(
            (option) => option.key === target.key && !option.disabled,
          ),
        )
  const target = () => {
    const options = enabled()
    return (
      (!multiple() &&
        options.find((target) =>
          props.options.some(
            (option) => option.key === target.key && option.selected,
          ),
        )?.element) ||
      options[0]?.element ||
      root()
    )
  }
  const fallback = useUiFallbackFocus()
  const focus = async () => {
    await nextTick()
    if (props.binding.disabled) return false
    const element = target()
    if (element && element === root()) {
      fallback(element)
      await nextTick()
      return (
        !props.binding.disabled &&
        element.isConnected &&
        element.matches(':focus')
      )
    }
    return focusUiTarget(target, () => props.binding.disabled)
  }
  // Composite editors are not HTML labelable elements. Backends can opt into
  // ordinary field-label activation while keeping the named radio group inside.
  // Match only this editor's explicit association; option labels keep native
  // activation. Focus must not select a value or bypass availability checks.
  let labelDocument: Document | undefined
  function activateLabel(event: MouseEvent) {
    const element = root()
    const label = event
      .composedPath()
      .find(
        (node): node is HTMLLabelElement =>
          node instanceof
          (labelDocument?.defaultView?.HTMLLabelElement ?? HTMLLabelElement),
      )
    if (!element?.isConnected || !label || label.htmlFor !== props.binding.id)
      return
    if (label.control) return
    event.preventDefault()
    void focus()
  }
  onMounted(() => {
    if (!options.fieldLabel) return
    labelDocument = root()?.ownerDocument
    labelDocument?.addEventListener('click', activateLabel)
  })
  onScopeDispose(() =>
    labelDocument?.removeEventListener('click', activateLabel),
  )
  function syncTabStops() {
    if (multiple()) return
    const entry = target()
    for (const item of targets())
      item.element.tabIndex = item.element === entry ? 0 : -1
  }
  onMounted(syncTabStops)
  function keydown(event: KeyboardEvent) {
    if (
      multiple() ||
      !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
    )
      return
    const options = enabled()
    const index = options.findIndex(
      (option) =>
        option.element === event.target ||
        option.element.contains(event.target as Node),
    )
    if (index < 0) return
    event.preventDefault()
    event.stopPropagation()
    const element = root()
    const rtl =
      element &&
      (element.ownerDocument.defaultView?.getComputedStyle(element).direction ||
        element.closest('[dir]')?.getAttribute('dir') ||
        element.ownerDocument.documentElement.dir) === 'rtl'
    const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight'
    const direction =
      (event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1) *
      (horizontal && rtl ? -1 : 1)
    const next = options[(index + direction + options.length) % options.length]
    next.element.focus()
    choose(next.key)
  }
  async function focusout(event: FocusEvent) {
    const element = root()
    if (event.relatedTarget && element?.contains(event.relatedTarget as Node))
      return
    await nextTick()
    if (
      element?.isConnected &&
      !element.contains(element.ownerDocument.activeElement)
    )
      blur()
  }
  // Removing a focused candidate must not silently strand focus on document.body.
  let active: Element | null | undefined
  onBeforeUpdate(() => {
    const element = root()
    const candidate = element?.ownerDocument.activeElement
    active = candidate && element?.contains(candidate) ? candidate : undefined
  })
  onUpdated(() => {
    syncTabStops()
    const container = root()
    const current = container?.ownerDocument.activeElement
    const focusStayed =
      current === active ||
      current === container?.ownerDocument.body ||
      Boolean(current && container?.contains(current))
    if (
      active &&
      active !== container &&
      focusStayed &&
      (!active.isConnected ||
        !enabled().some(
          (target) =>
            target.element === active || target.element.contains(active!),
        ))
    )
      void focus()
    active = undefined
  })
  return { focus, keydown, focusout }
}
