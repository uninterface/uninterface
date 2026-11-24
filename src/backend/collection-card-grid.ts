import {
  computed,
  onActivated,
  onDeactivated,
  onMounted,
  onScopeDispose,
  onUpdated,
  shallowRef,
  watch,
  type CSSProperties,
  type Ref,
} from 'vue'
import type { UiCollectionCardsViewProps } from './collection'

/** Optional allocation mechanics; the backend owns the list target, defaults and gaps. */
export function useUiCollectionCardGrid(
  props: Pick<UiCollectionCardsViewProps, 'grid' | 'presentationOptions'>,
  target: Ref<HTMLElement | undefined>,
) {
  const columns = shallowRef<number>()
  let resize: ResizeObserver | undefined
  let mutations: MutationObserver | undefined
  let window: Window | undefined
  let document: Document | undefined
  let active = true
  let mounted = false

  const unbounded = () =>
    props.presentationOptions?.minWidth !== undefined &&
    props.presentationOptions.maxWidth === undefined

  const style = computed<CSSProperties>(() => {
    const options = props.presentationOptions
    const max = options?.maxWidth
    return {
      '--ui-collection-card-min': options?.minWidth,
      '--ui-collection-card-max': max === 'default' ? undefined : max,
      gridTemplateColumns: !props.grid
        ? undefined
        : unbounded()
          ? 'repeat(auto-fit, minmax(min(100%, var(--ui-collection-card-min)), 1fr))'
          : columns.value === undefined
            ? 'repeat(auto-fill, minmax(min(100%, var(--ui-collection-card-min)), min(100%, var(--ui-collection-card-max))))'
            : columns.value === 1 && options?.stretchSingleColumn !== false
              ? 'minmax(0, 1fr)'
              : `repeat(${columns.value}, minmax(0, var(--ui-collection-card-max)))`,
    }
  })

  function measure() {
    const element = target.value
    if (
      !active ||
      !props.grid ||
      unbounded() ||
      !element?.isConnected ||
      !window
    )
      return
    const css = window.getComputedStyle(element)
    const pixels = (value: string) => {
      const size = parseFloat(value)
      if (value.trim().endsWith('rem'))
        return (
          size *
          parseFloat(
            window!.getComputedStyle(element.ownerDocument.documentElement)
              .fontSize,
          )
        )
      if (value.trim().endsWith('em')) return size * parseFloat(css.fontSize)
      return size
    }
    // Requests are read directly so reactive changes never sample stale inline styles.
    const options = props.presentationOptions
    const min = pixels(
      options?.minWidth ??
        css.getPropertyValue('--ui-collection-card-default-min'),
    )
    const max = pixels(
      options?.maxWidth && options.maxWidth !== 'default'
        ? options.maxWidth
        : css.getPropertyValue('--ui-collection-card-default-max'),
    )
    if (!(Number.isFinite(min) && min > 0 && Number.isFinite(max) && max > 0))
      return
    if (max < min)
      throw new Error(
        'UiCollectionView maxWidth must be at least minWidth after resolving units and defaults.',
      )
    const insets = [
      'paddingLeft',
      'paddingRight',
      'borderLeftWidth',
      'borderRightWidth',
    ].reduce(
      (sum, key) =>
        sum +
        (parseFloat(css[key as keyof CSSStyleDeclaration] as string) || 0),
      0,
    )
    const width =
      parseFloat(css.width) - (css.boxSizing === 'border-box' ? insets : 0)
    if (!Number.isFinite(width) || width <= 0) return
    const gap = parseFloat(css.columnGap) || 0
    columns.value = Math.max(1, Math.floor((width + gap + 0.01) / (min + gap)))
  }
  function disconnect() {
    resize?.disconnect()
    mutations?.disconnect()
    window?.removeEventListener('resize', measure)
    document?.fonts?.removeEventListener('loadingdone', measure)
    resize = undefined
    mutations = undefined
    window = undefined
    document = undefined
  }
  function attach() {
    disconnect()
    columns.value = undefined
    const element = target.value
    if (!mounted || !active || !props.grid || !element) return
    const view = element.ownerDocument.defaultView!
    window = view
    document = element.ownerDocument
    if (view.ResizeObserver) {
      resize = new view.ResizeObserver(measure)
      resize.observe(element)
    }
    // Ancestor class/style/font/visibility changes can change rem/em limits or gaps
    // without changing this component's props or the offered container width.
    if (view.MutationObserver) {
      mutations = new view.MutationObserver(measure)
      for (
        let parent: Element | null = element;
        parent;
        parent = parent.parentElement
      )
        mutations.observe(parent, {
          attributes: true,
          attributeFilter: ['style', 'class', 'hidden', 'lang', 'dir'],
        })
    }
    view.addEventListener('resize', measure, { passive: true })
    element.ownerDocument.fonts?.addEventListener('loadingdone', measure)
    measure()
  }
  onMounted(() => {
    mounted = true
    attach()
  })
  watch([target, () => props.grid], attach, { flush: 'post' })
  watch(
    () => props.presentationOptions,
    () => {
      columns.value = undefined
      measure()
    },
    { deep: true, flush: 'post' },
  )
  onUpdated(measure)
  onDeactivated(() => {
    active = false
    disconnect()
  })
  onActivated(() => {
    active = true
    attach()
  })
  onScopeDispose(disconnect)
  return style
}
