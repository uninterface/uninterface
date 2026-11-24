import { onMounted, onUpdated, onScopeDispose, ref, watchPostEffect } from 'vue'
import { provideTooltipTableBounds } from './tooltipGeometry'

/** Optional geometry mechanics. Native targets and presentation remain adapter-owned. */
export function useUiTableAddRow(options: {
  enabled(): boolean
  bounded(): boolean
  host(): HTMLElement | undefined
  summary(): HTMLElement | null | undefined
  header(): HTMLElement | null | undefined
  row(): HTMLElement | null | undefined
}) {
  provideTooltipTableBounds(
    () => (options.bounded() ? options.header() : undefined),
    () => (options.bounded() ? options.summary() : undefined),
  )
  const viewportWidth = ref(0)
  const compact = ref(false)
  let styled: HTMLElement | undefined
  let previousPadding: [string, string] = ['', '']
  function releasePadding() {
    if (styled) {
      styled.style.scrollPaddingTop = previousPadding[0]
      styled.style.scrollPaddingBottom = previousPadding[1]
      styled = undefined
    }
  }
  let observer: ResizeObserver | undefined
  let observed: Element[] = []
  let disposed = false
  function measure() {
    if (disposed) return
    const host = options.host()
    viewportWidth.value = host?.clientWidth ?? 0
    const summaryHeight = options.summary()?.getBoundingClientRect().height ?? 0
    const header = options.header()?.getBoundingClientRect().height ?? 0
    const row = options.row()?.getBoundingClientRect().height ?? 0
    compact.value = Boolean(
      options.enabled() &&
        options.bounded() &&
        host &&
        host.clientHeight < header + summaryHeight + row,
    )
    if (!options.enabled()) releasePadding()
    else if (host) {
      if (host !== styled) {
        releasePadding()
        styled = host
        previousPadding = [
          host.style.scrollPaddingTop,
          host.style.scrollPaddingBottom,
        ]
      }
      const top = `${compact.value ? 0 : header}px`
      const bottom = `${summaryHeight}px`
      if (host.style.scrollPaddingTop !== top) host.style.scrollPaddingTop = top
      if (host.style.scrollPaddingBottom !== bottom)
        host.style.scrollPaddingBottom = bottom
    }
  }
  function sync() {
    if (disposed) return
    const targets = options.enabled()
      ? [
          options.host(),
          options.summary(),
          options.header(),
          options.row(),
        ].filter((el): el is HTMLElement => Boolean(el))
      : []
    if (
      targets.length !== observed.length ||
      targets.some((el, i) => el !== observed[i])
    ) {
      observer?.disconnect()
      observed = targets
      const Resize = targets[0]?.ownerDocument.defaultView?.ResizeObserver
      if (Resize) {
        observer = new Resize(measure)
        for (const target of targets) observer.observe(target)
      }
    }
    measure()
  }
  watchPostEffect(sync)
  onMounted(sync)
  onUpdated(sync)
  onScopeDispose(() => {
    disposed = true
    observer?.disconnect()
    releasePadding()
  })
  return { viewportWidth, compact }
}
