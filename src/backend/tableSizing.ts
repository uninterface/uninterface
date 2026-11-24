import { useUiZPart } from '../stacking/view'
import {
  computed,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  onBeforeUnmount,
  onScopeDispose,
  ref,
  shallowRef,
  watch,
  type Ref,
  type CSSProperties,
} from 'vue'
import type { UiTableViewProps } from './collection'
import { allocateColumns, columnPixels, resizeColumns } from '../table/columns'

/** Backend opt-in mechanics; adapters supply the actual allocation host and native column plumbing. */
export function useUiTableSizing(
  props: UiTableViewProps,
  root: Ref<HTMLElement | undefined>,
  id: string,
  options: { minimumHeader?: boolean } = {},
) {
  const zPart = useUiZPart()
  const zCells = new Map<string, HTMLElement>()
  onBeforeUnmount(() => {
    for (const cell of zCells.values()) zPart.beforeUnmount(cell)
  })
  const available = ref(0),
    em = ref(16),
    rem = ref(16),
    rtl = ref(false)
  const contentWidths = shallowRef(new Map<string, number>())
  const headerWidths = shallowRef(new Map<string, number>())
  const contentTargets = new Map<
    string,
    { key: string; element: HTMLElement; header: boolean }
  >()
  const contentRefs = new Map<string, (element: unknown) => void>()
  let contentResize: ResizeObserver | undefined
  let measureScheduled = false
  function scheduleMeasure() {
    if (measureScheduled) return
    measureScheduled = true
    void nextTick(() => {
      measureScheduled = false
      measure()
    })
  }
  const wantsContent = (key: string) =>
    props.columns.some(
      (c) =>
        c.key === key &&
        (c.preferredWidth === 'content' || c.minWidth === 'content'),
    )
  function contentStyle(key: string): Record<string, string> {
    return wantsContent(key)
      ? {
          display: 'inline-block',
          width: 'max-content',
          maxWidth: 'none',
          whiteSpace: 'nowrap',
        }
      : { minWidth: '0' }
  }
  function contentRef(
    key: string,
    row?: string | number,
    part: 'cell' | 'summary' = 'cell',
  ) {
    const identity = JSON.stringify([
      key,
      part,
      row === undefined ? 'header' : typeof row,
      row,
    ])
    let callback = contentRefs.get(identity)
    if (!callback) {
      callback = (value: unknown) => {
        const rendered =
          value && typeof value === 'object' && '$el' in value
            ? value.$el
            : value
        const cell =
          rendered && typeof rendered === 'object' && 'closest' in rendered
            ? (rendered as HTMLElement).closest<HTMLElement>('th,td')
            : null
        const previous = zCells.get(identity)
        if (previous && previous !== cell) zPart.beforeUnmount(previous)
        if (cell) {
          zCells.set(identity, cell)
          zPart.updated(cell, {
            value: props.columns.find((c) => c.key === key)?.z,
          })
        } else zCells.delete(identity)
        const old = contentTargets.get(identity)
        if (old) contentResize?.unobserve(old.element)
        const element = value as HTMLElement | null
        if (element) {
          contentTargets.set(identity, {
            key,
            element,
            header: part === 'cell' && row === undefined,
          })
          if (
            wantsContent(key) ||
            (options.minimumHeader && part === 'cell' && row === undefined)
          )
            contentResize?.observe(element)
          scheduleMeasure()
        } else {
          contentTargets.delete(identity)
          contentRefs.delete(identity)
        }
      }
      contentRefs.set(identity, callback)
    }
    return callback
  }
  function measureContent() {
    const widths = new Map<string, number>()
    const headers = new Map(
      [...headerWidths.value].filter(([key]) =>
        props.columns.some((column) => column.key === key),
      ),
    )
    for (const { key, element, header } of contentTargets.values()) {
      const measureHeader = options.minimumHeader && header
      if ((!wantsContent(key) && !measureHeader) || element.offsetWidth <= 0)
        continue
      const cell = element.closest('th, td')
      if (!cell) continue
      const win = element.ownerDocument.defaultView!
      let size = element.offsetWidth
      if (measureHeader) {
        const saved = element.getAttribute('style')
        element.style.width = 'max-content'
        element.style.maxWidth = 'none'
        element.style.whiteSpace = 'nowrap'
        size = Math.ceil(
          Math.max(element.getBoundingClientRect().width, element.scrollWidth),
        )
        if (saved === null) element.removeAttribute('style')
        else element.setAttribute('style', saved)
      }
      // Include the actual native cell and intermediate wrapper insets (e.g. Element Plus .cell).
      for (let node = element.parentElement; node; node = node.parentElement) {
        const style = win.getComputedStyle(node)
        size +=
          (parseFloat(style.paddingLeft) || 0) +
          (parseFloat(style.paddingRight) || 0) +
          (parseFloat(style.borderLeftWidth) || 0) +
          (parseFloat(style.borderRightWidth) || 0)
        if (node === cell) break
      }
      if (wantsContent(key))
        widths.set(key, Math.max(widths.get(key) ?? 0, Math.ceil(size)))
      if (measureHeader) headers.set(key, Math.ceil(size))
    }
    if (
      options.minimumHeader &&
      (headers.size !== headerWidths.value.size ||
        [...headers].some(
          ([key, value]) => headerWidths.value.get(key) !== value,
        ))
    ) {
      end(true)
      headerWidths.value = headers
    }
    const next = new Map(
      [...contentWidths.value].filter(([key]) => wantsContent(key)),
    )
    for (const [key, value] of widths) next.set(key, value)
    if (
      next.size !== contentWidths.value.size ||
      [...next].some(([key, value]) => value !== contentWidths.value.get(key))
    ) {
      end(true)
      contentWidths.value = next
    }
  }
  const selectionWidth = computed(() =>
    props.selection === 'none' ? 0 : 3 * em.value,
  )
  const allowOverflow = computed(
    () => props.scroll === 'horizontal' || props.scroll === 'both',
  )
  const minima = computed<readonly number[]>((previous) => {
    const next = props.columns.map((c) =>
      Math.max(
        headerWidths.value.get(c.key) ?? 0,
        c.minWidth === 'content'
          ? (contentWidths.value.get(c.key) ?? 3 * em.value)
          : columnPixels(c.minWidth, 3 * em.value, em.value, rem.value),
      ),
    )
    return previous?.length === next.length &&
      next.every((width, index) => width === previous[index])
      ? previous
      : next
  })
  const constraints = computed(() => ({
    budget:
      available.value > 0
        ? Math.max(0, available.value - selectionWidth.value)
        : undefined,
    minima: minima.value,
    allowOverflow: allowOverflow.value,
  }))
  const overrides = shallowRef<{
    widths: ReadonlyMap<string, number>
    constraints?: typeof constraints.value
  }>({ widths: new Map() })
  const specs = computed(() =>
    props.columns.map((c, index) => ({
      preferred:
        overrides.value.widths.get(c.key) ??
        (c.preferredWidth === 'content'
          ? (contentWidths.value.get(c.key) ?? 3 * em.value)
          : columnPixels(c.preferredWidth, 12 * em.value, em.value, rem.value)),
      min: minima.value[index],
      spring: c.spring,
    })),
  )
  const allocation = computed(() => {
    const current = constraints.value
    if (overrides.value.constraints === current) {
      // A manual transfer already respects the minima and preserves a valid table total.
      // Fitting it again would shrink a newly widened spring column during overflow.
      const widths = specs.value.map((c) => c.preferred)
      return {
        widths,
        total: widths.reduce((sum, width) => sum + width, 0),
        fits: true,
      }
    }
    return allocateColumns(
      specs.value,
      current.budget ??
        specs.value.reduce((sum, c) => sum + Math.max(c.min, c.preferred), 0),
      current.allowOverflow,
    )
  })
  const fits = computed(() => allocation.value.fits)
  const tableStyle = computed<CSSProperties>(() => ({
    tableLayout: 'fixed',
    width:
      available.value > 0 && allowOverflow.value
        ? `${allocation.value.total + selectionWidth.value}px`
        : '100%',
  }))
  const indexOf = (key: string) => props.columns.findIndex((c) => c.key === key)
  const width = (key: string) => allocation.value.widths[indexOf(key)]
  const columnId = (key: string) => `${id}-column-${encodeURIComponent(key)}`
  function cellStyle(key: string): Record<string, string> {
    const c = props.columns.find((c) => c.key === key)
    return {
      width: `${width(key)}px`,
      ...(c?.align ? { textAlign: c.align } : {}),
      overflowWrap: 'anywhere',
    }
  }
  function canResize(index: number) {
    return (
      fits.value &&
      !props.disabled &&
      index >= 0 &&
      index + 1 < props.columns.length &&
      props.columns[index].resizable &&
      props.columns[index + 1].resizable
    )
  }
  function commit(widths: readonly number[]) {
    overrides.value = {
      widths: new Map(props.columns.map((c, i) => [c.key, widths[i]])),
      constraints: constraints.value,
    }
  }
  let drag:
    | {
        index: number
        x: number
        pointer: number
        widths: number[]
        before: typeof overrides.value
        node: HTMLElement
      }
    | undefined
  function end(cancel = false) {
    const old = drag
    drag = undefined
    if (!old) return
    if (cancel) overrides.value = old.before
    if (old.node.hasPointerCapture?.(old.pointer))
      old.node.releasePointerCapture(old.pointer)
  }
  function pointerdown(index: number, event: PointerEvent) {
    if (!canResize(index) || event.button !== 0 || event.isPrimary === false)
      return
    event.preventDefault()
    event.stopPropagation()
    end()
    const node = event.currentTarget as HTMLElement
    node.focus({ preventScroll: true })
    drag = {
      index,
      x: event.clientX,
      pointer: event.pointerId,
      widths: [...allocation.value.widths],
      before: overrides.value,
      node,
    }
    node.setPointerCapture?.(event.pointerId)
  }
  function pointermove(event: PointerEvent) {
    if (!drag || drag.pointer !== event.pointerId) return
    event.preventDefault()
    event.stopPropagation()
    commit(
      resizeColumns(
        drag.widths,
        minima.value,
        drag.index,
        (event.clientX - drag.x) * (rtl.value ? -1 : 1),
      ),
    )
  }
  function keydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Escape' && drag) {
      event.preventDefault()
      event.stopPropagation()
      end(true)
      return
    }
    if (
      !canResize(index) ||
      !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
    )
      return
    event.preventDefault()
    event.stopPropagation()
    const delta =
      event.key === 'Home'
        ? -Infinity
        : event.key === 'End'
          ? Infinity
          : (event.key === 'ArrowRight' ? 1 : -1) *
            (rtl.value ? -1 : 1) *
            (event.shiftKey ? 1 : 10)
    commit(resizeColumns(allocation.value.widths, minima.value, index, delta))
  }
  function handle(key: string) {
    const i = indexOf(key),
      widths = allocation.value.widths
    if (!canResize(i)) return undefined
    return {
      role: 'separator',
      tabindex: 0,
      'aria-orientation': 'vertical' as const,
      'aria-label': props.columns[i].resizeLabel,
      'aria-controls': columnId(key),
      'aria-valuemin': Math.round(minima.value[i]),
      'aria-valuemax': Math.round(
        widths[i] + widths[i + 1] - minima.value[i + 1],
      ),
      'aria-valuenow': Math.round(widths[i]),
      'data-column-resize': key,
      onPointerdown: (e: PointerEvent) => pointerdown(i, e),
      onPointermove: pointermove,
      onPointerup: (e: PointerEvent) => {
        if (drag?.pointer === e.pointerId) end()
      },
      onPointercancel: () => end(true),
      onLostpointercapture: () => end(),
      onKeydown: (e: KeyboardEvent) => keydown(i, e),
      onClick: (e: MouseEvent) => e.stopPropagation(),
      onDblclick: (e: MouseEvent) => {
        e.stopPropagation()
        end()
        overrides.value = { widths: new Map() }
      },
    }
  }
  watch(
    fits,
    (value) => {
      const el = root.value
      if (!value && el?.contains(el.ownerDocument.activeElement)) {
        // Move focus before hiding the table; retained editors return when the allocation fits.
        if (!el.hasAttribute('tabindex')) el.tabIndex = -1
        el.focus({ preventScroll: true })
      }
    },
    { flush: 'pre' },
  )
  let mounted = false,
    active = true,
    resize: ResizeObserver | undefined,
    mutation: MutationObserver | undefined
  function measure() {
    const el = root.value
    if (!active || !el) return
    const win = el.ownerDocument.defaultView!
    const style = win.getComputedStyle(el)
    const size =
      el.clientWidth -
      (parseFloat(style.paddingLeft) || 0) -
      (parseFloat(style.paddingRight) || 0)
    if (size > 0 && size !== available.value) {
      end(true)
      available.value = size
    }
    const nextEm = parseFloat(style.fontSize) || 16
    const nextRem =
      parseFloat(
        win.getComputedStyle(el.ownerDocument.documentElement).fontSize,
      ) || 16
    const nextRtl =
      (style.direction || el.closest('[dir]')?.getAttribute('dir')) === 'rtl'
    if (nextEm !== em.value || nextRem !== rem.value || nextRtl !== rtl.value)
      end(true)
    em.value = nextEm
    rem.value = nextRem
    rtl.value = nextRtl
    measureContent()
  }
  watch(
    () =>
      props.columns.map(
        (c) =>
          [c.key, c.preferredWidth, c.minWidth, c.spring, c.resizable] as const,
      ),
    (next, old) => {
      // Query/row updates preserve widths. Author changes and removed keys reset only their overrides.
      const changed =
        next.length !== old.length ||
        next.some((c, i) => c.some((v, j) => v !== old[i]?.[j]))
      if (!changed) return
      end(true)
      const previous = new Map(old.map((c) => [c[0], c]))
      overrides.value = {
        widths: new Map(
          [...overrides.value.widths].filter(([key]) => {
            const current = next.find((c) => c[0] === key),
              before = previous.get(key)
            return current && before && current.every((v, i) => v === before[i])
          }),
        ),
      }
    },
  )
  watch(constraints, () => end(true))
  watch(
    () => props.disabled,
    (value) => {
      if (value) end(true)
    },
  )
  onMounted(() => {
    mounted = true
    const el = root.value
    if (!el) return
    const win = el.ownerDocument.defaultView!
    if (win.ResizeObserver) {
      resize = new win.ResizeObserver(scheduleMeasure)
      resize.observe(el)
      resize.observe(el.ownerDocument.documentElement)
      contentResize = new win.ResizeObserver(scheduleMeasure)
      for (const { key, element, header } of contentTargets.values())
        if (wantsContent(key) || (options.minimumHeader && header))
          contentResize.observe(element)
    }
    mutation = new win.MutationObserver((records) => {
      if (
        records.some(
          (record) =>
            record.type !== 'attributes' ||
            record.attributeName !== 'style' ||
            ![...contentTargets.values()].some(
              ({ element }) => element === record.target,
            ),
        )
      )
        scheduleMeasure()
    })
    for (let node: HTMLElement | null = el; node; node = node.parentElement)
      mutation.observe(node, {
        attributes: true,
        attributeFilter: ['style', 'class', 'dir', 'hidden'],
      })
    mutation.observe(el, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'dir', 'hidden'],
    })
    win.addEventListener('resize', measure)
    el.ownerDocument.fonts?.addEventListener('loadingdone', scheduleMeasure)
    measure()
  })
  onActivated(() => {
    active = true
    if (mounted) void nextTick(measure)
  })
  onDeactivated(() => {
    active = false
    end(true)
  })
  onScopeDispose(() => {
    active = false
    end()
    resize?.disconnect()
    contentResize?.disconnect()
    contentTargets.clear()
    contentRefs.clear()
    mutation?.disconnect()
    root.value?.ownerDocument.fonts?.removeEventListener(
      'loadingdone',
      scheduleMeasure,
    )
    root.value?.ownerDocument.defaultView?.removeEventListener(
      'resize',
      measure,
    )
  })
  return {
    fits,
    contentRef,
    summaryRef: (key: string) => contentRef(key, undefined, 'summary'),
    contentStyle,
    tableStyle,
    selectionWidth,
    width,
    cellStyle,
    columnId,
    handle,
  }
}
