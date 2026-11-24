import { computed, shallowRef, watch } from 'vue'
import type { UiImagePreviewViewProps } from './index'

/** Source state and dimensions only; adapters own image and fallback markup. */
export function useUiImagePreviewView(props: UiImagePreviewViewProps) {
  const failed = shallowRef(!props.url)
  const natural = shallowRef<{ width: number; height: number }>()
  watch(
    () => props.url,
    () => {
      failed.value = !props.url
      natural.value = undefined
    },
    { flush: 'sync' },
  )
  const length = (value: number | string) =>
    typeof value === 'number' ? `${value}px` : value
  const style = computed(() => ({
    width: length(
      props.width === 'auto' &&
        (props.height === 'auto' || props.height === undefined) &&
        natural.value
        ? natural.value.width
        : (props.width ?? (props.height === undefined ? '100%' : 'auto')),
    ),
    height: length(
      props.height ?? (props.width === undefined ? '100%' : 'auto'),
    ),
    aspectRatio: natural.value
      ? `${natural.value.width} / ${natural.value.height}`
      : undefined,
    '--ui-image-fit': props.fit === 'stretch' ? 'fill' : 'contain',
  }))
  function isCurrentSource(source: string | null | undefined) {
    if (!source || !props.url) return false
    if (source === props.url) return true
    if (typeof document === 'undefined') return false
    try {
      return (
        new URL(source, document.baseURI).href ===
        new URL(props.url, document.baseURI).href
      )
    } catch {
      return false
    }
  }
  function loaded(event: Event) {
    const image = event.target as HTMLImageElement
    if (!isCurrentSource(image.getAttribute('src'))) return
    if (image.naturalWidth && image.naturalHeight)
      natural.value = { width: image.naturalWidth, height: image.naturalHeight }
    failed.value = false
  }
  function error(event: Event | string | undefined) {
    const source =
      typeof event === 'string' || event === undefined
        ? event
        : (event.target as HTMLImageElement).getAttribute('src')
    if (isCurrentSource(source)) failed.value = true
  }
  return { failed, natural, style, loaded, error, isCurrentSource }
}
