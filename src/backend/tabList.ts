import { useUiZPart } from '../stacking/view'
import {
  nextTick,
  ref,
  watchEffect,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  watchPostEffect,
  normalizeClass,
  normalizeStyle,
  type ComponentPublicInstance,
} from 'vue'
import type { UiTabsViewProps } from './index'

/** Optional backend interaction helper; markup and focus presentation stay with each view. */
export function useUiTabList(props: UiTabsViewProps) {
  const zPart = useUiZPart()
  const focused = ref<string>()
  onBeforeUnmount(() => {
    for (const element of elements.values()) zPart.beforeUnmount(element)
  })
  const elements = new Map<string, HTMLElement>()
  watchEffect(() => {
    const enabled = props.items.filter((item) => !item.disabled)
    if (!enabled.some((item) => item.key === focused.value)) {
      const previous =
        focused.value === undefined ? undefined : elements.get(focused.value)
      const recover =
        previous && previous.ownerDocument.activeElement === previous
      focused.value =
        enabled.find((item) => item.selected)?.key ?? enabled[0]?.key
      const target = focused.value
      if (recover && target !== undefined)
        void nextTick(() => {
          const element = elements.get(target)
          if (focused.value === target && element?.isConnected) element.focus()
        })
    }
    for (const key of elements.keys())
      if (!props.items.some((item) => item.key === key)) elements.delete(key)
  })
  function setElement(
    key: string,
    target: Element | ComponentPublicInstance | null,
  ) {
    const element =
      target && (('$el' in target ? target.$el : target) as HTMLElement | null)
    const previous = elements.get(key)
    if (previous && previous !== element) zPart.beforeUnmount(previous)
    if (element) {
      elements.set(key, element)
      zPart.updated(element, {
        value: props.items.find((item) => item.key === key)?.z,
      })
    } else elements.delete(key)
  }
  function tabIndex(key: string) {
    return key === focused.value ? 0 : -1
  }
  function focus(key: string) {
    focused.value = key
  }
  function keydown(event: KeyboardEvent, key: string) {
    const enabled = props.items.filter((item) => !item.disabled)
    const index = enabled.findIndex((item) => item.key === key)
    if (index < 0) return
    const element = elements.get(key)
    const rtl =
      element?.ownerDocument.defaultView?.getComputedStyle(element)
        .direction === 'rtl'
    const previous =
      props.orientation === 'vertical'
        ? 'ArrowUp'
        : rtl
          ? 'ArrowRight'
          : 'ArrowLeft'
    const next =
      props.orientation === 'vertical'
        ? 'ArrowDown'
        : rtl
          ? 'ArrowLeft'
          : 'ArrowRight'
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : event.key === previous
            ? (index - 1 + enabled.length) % enabled.length
            : event.key === next
              ? (index + 1) % enabled.length
              : undefined
    if (target === undefined) return
    event.preventDefault()
    event.stopPropagation()
    const item = enabled[target]
    focused.value = item.key
    elements.get(item.key)?.focus()
  }
  return { setElement, tabIndex, focus, keydown }
}

/** Adapts native tab DOM where the toolkit does not expose trigger attributes.
 * Keeps native indicators/overflow/theme; only shared ARIA and manual focus are supplemented.
 */
export function useUiNativeTabList(
  props: UiTabsViewProps,
  select: (key: string) => void,
  options: { nativeAttributes?: boolean } = {},
) {
  const root = ref<HTMLElement>()
  const interaction = useUiTabList(props)
  let observer: MutationObserver | undefined
  const previousAttributes = new WeakMap<HTMLElement, Set<string>>()
  const decorations = new WeakMap<
    HTMLElement,
    {
      classes: string[]
      styles: string[]
      events: [string, EventListener, boolean][]
    }
  >()
  function decorate(
    element: HTMLElement,
    attributes: Readonly<Record<string, unknown>>,
  ) {
    const previous = decorations.get(element)
    previous?.classes.forEach((name) => element.classList.remove(name))
    previous?.styles.forEach((name) => element.style.removeProperty(name))
    previous?.events.forEach(([name, handler, capture]) =>
      element.removeEventListener(name, handler, capture),
    )
    const classes = normalizeClass(attributes.class)
      .split(/\s+/)
      .filter(Boolean)
    classes.forEach((name) => element.classList.add(name))
    const style = normalizeStyle(
      attributes.style as Parameters<typeof normalizeStyle>[0],
    )
    const styles: string[] = []
    const declaration = element.ownerDocument.createElement('span').style
    if (typeof style === 'string') declaration.cssText = style
    else if (style)
      for (const [name, value] of Object.entries(style)) {
        const property = name.startsWith('--')
          ? name
          : name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
        if (value != null) declaration.setProperty(property, String(value))
      }
    for (let index = 0; index < declaration.length; index++) {
      const name = declaration.item(index)
      styles.push(name)
      element.style.setProperty(
        name,
        declaration.getPropertyValue(name),
        declaration.getPropertyPriority(name),
      )
    }
    const events: [string, EventListener, boolean][] = []
    for (const [name, value] of Object.entries(attributes)) {
      if (!/^on[A-Z]/.test(name)) continue
      const capture = name.endsWith('Capture')
      const event = name.slice(2, capture ? -7 : undefined).toLowerCase()
      for (const handler of Array.isArray(value) ? value : [value])
        if (typeof handler === 'function') {
          element.addEventListener(event, handler as EventListener, capture)
          events.push([event, handler as EventListener, capture])
        }
    }
    decorations.set(element, { classes, styles, events })
  }
  function sync() {
    const list = root.value?.querySelector<HTMLElement>('[role="tablist"]')
    if (!list) return
    list.setAttribute('aria-label', props.label)
    list.setAttribute('aria-orientation', props.orientation)
    const elements = Array.from(
      list.querySelectorAll<HTMLElement>('[role="tab"]'),
    )
    props.items.forEach((item, index) => {
      const element = elements[index]
      if (!element) return
      interaction.setElement(item.key, element)
      if (!options.nativeAttributes) decorate(element, item.attributes)
      const attributes = Object.entries(item.attributes).filter(
        ([name, value]) =>
          !name.startsWith('on') &&
          !['class', 'style', 'ref'].includes(name) &&
          value != null,
      )
      const names = new Set(attributes.map(([name]) => name))
      for (const name of previousAttributes.get(element) ?? [])
        if (!names.has(name)) element.removeAttribute(name)
      for (const [name, value] of attributes)
        element.setAttribute(name, String(value))
      previousAttributes.set(element, names)
      element.id = item.tabId
      element.setAttribute('aria-controls', item.panelId)
      element.setAttribute('aria-selected', String(item.selected))
      element.setAttribute('aria-disabled', String(item.disabled))
      element.tabIndex = interaction.tabIndex(item.key)
    })
  }
  function itemFor(event: Event) {
    const element = (event.target as Element)?.closest<HTMLElement>(
      '[role="tab"]',
    )
    return props.items.find((item) => item.tabId === element?.id)
  }
  function keydown(event: KeyboardEvent) {
    const item = itemFor(event)
    if (!item) return
    if (item.disabled) {
      event.stopPropagation()
      return
    }
    interaction.keydown(event, item.key)
    // Native widgets must not auto-activate on an arrow outside this axis.
    if (event.key.startsWith('Arrow')) event.stopPropagation()
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.stopPropagation()
      select(item.key)
    }
    sync()
  }
  function focusin(event: FocusEvent) {
    const item = itemFor(event)
    if (item && !item.disabled) {
      interaction.focus(item.key)
      sync()
    }
  }
  onMounted(() => {
    sync()
    observer = new MutationObserver(sync)
    if (root.value)
      observer.observe(root.value, { childList: true, subtree: true })
  })
  onUpdated(sync)
  watchPostEffect(sync)
  onBeforeUnmount(() => observer?.disconnect())
  return { root, keydown, focusin }
}
