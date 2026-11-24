import {
  computed,
  nextTick,
  onDeactivated,
  onMounted,
  onScopeDispose,
  ref,
  shallowRef,
  watch,
} from 'vue'
import type { UiSuggestionsViewProps } from './index'
export function useUiSuggestionsView(props: UiSuggestionsViewProps) {
  const anchor = shallowRef<HTMLInputElement>(),
    surface = shallowRef<HTMLElement>()
  const opened = ref(false),
    active = ref(-1)
  let composing = false,
    observer: MutationObserver | undefined
  const visible = computed(
    () =>
      opened.value &&
      !props.disabled &&
      !!anchor.value &&
      (props.results.length > 0 || !!props.message),
  )
  const anchorWidth = shallowRef<number>()
  watch(
    [anchor, visible],
    ([target, open], _, onCleanup) => {
      const win = target?.ownerDocument.defaultView
      if (!target || !open || !win) return
      const measure = () => {
        anchorWidth.value = target.getBoundingClientRect().width
      }
      measure()
      // The editor can resize when its layout changes without a window resize.
      const resize = win.ResizeObserver && new win.ResizeObserver(measure)
      resize?.observe(target, { box: 'border-box' })
      onCleanup(() => resize?.disconnect())
    },
    { flush: 'post' },
  )
  watch(visible, (value) => props.engagement?.(value), { flush: 'sync' })
  const eligible = () =>
    props.results
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.disabled)
  function close() {
    opened.value = false
    active.value = -1
  }
  function locate() {
    const matches = [
      ...document.querySelectorAll<HTMLInputElement>(
        '[data-uninterface-suggestions-host]',
      ),
    ].filter(
      (el) => el.getAttribute('data-uninterface-suggestions-host') === props.id,
    )
    if (matches.length > 1)
      throw new Error('UiSuggestions requires one editing target.')
    anchor.value = matches[0]
  }
  function accept(index: number) {
    const item = props.results[index]
    if (!item || item.disabled || props.disabled) return
    props.accept(item.key)
    close()
  }
  function query(event: Event | string) {
    if (typeof event === 'string') {
      if (!composing && !props.disabled) {
        props.query(event)
        opened.value = true
        active.value = -1
      }
      return
    }
    if (composing || (event as InputEvent).isComposing || props.disabled) return
    const target = event.currentTarget as HTMLInputElement
    props.query(target.value)
    opened.value = true
    active.value = -1
  }
  function key(event: KeyboardEvent) {
    if (props.disabled || composing || event.isComposing) return
    if (event.key === 'Escape' && opened.value) {
      event.preventDefault()
      event.stopPropagation()
      close()
      return
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault()
      event.stopPropagation()
      opened.value = true
      const items = eligible()
      if (!items.length) return
      const at = items.findIndex((item) => item.index === active.value),
        step = event.key === 'ArrowDown' ? 1 : -1
      active.value =
        items[
          at < 0
            ? step > 0
              ? 0
              : items.length - 1
            : (at + step + items.length) % items.length
        ]!.index
      void nextTick(() =>
        surface.value
          ?.querySelector(`#${CSS.escape(props.id + '-' + active.value)}`)
          ?.scrollIntoView?.({ block: 'nearest' }),
      )
    }
    if (event.key === 'Enter' && visible.value && props.status === 'error') {
      event.preventDefault()
      event.stopPropagation()
      void props.refresh().catch(() => {})
    } else if (event.key === 'Enter' && visible.value && active.value >= 0) {
      event.preventDefault()
      event.stopPropagation()
      accept(active.value)
    }
  }
  const host = computed(() => ({
    'data-uninterface-suggestions-host': props.id,
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': visible.value,
    'aria-controls': visible.value ? props.id : undefined,
    'aria-activedescendant':
      visible.value && active.value >= 0
        ? `${props.id}-${active.value}`
        : undefined,
    onInput: query,
    onKeydown: key,
    onCompositionstart() {
      composing = true
    },
    onCompositionend(event: CompositionEvent) {
      composing = false
      query(event)
    },
    onFocus() {
      if (!props.disabled) {
        opened.value = true
        if (props.status === 'idle') void props.refresh().catch(() => {})
      }
    },
  }))
  function outside(event: Event) {
    if (
      !anchor.value?.contains(event.target as Node) &&
      !surface.value?.contains(event.target as Node)
    )
      close()
  }
  onMounted(() => {
    locate()
    observer = new MutationObserver(locate)
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-uninterface-suggestions-host'],
    })
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
  })
  watch(
    () => [props.results, props.disabled],
    () => {
      active.value = -1
      if (props.disabled) close()
    },
  )
  onDeactivated(close)
  onScopeDispose(() => {
    props.engagement?.(false)
    observer?.disconnect()
    if (typeof document !== 'undefined') {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', outside)
    }
  })
  return { anchor, anchorWidth, surface, visible, host, active, accept, close }
}
