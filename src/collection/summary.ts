import type { UiListBinding } from '../bindings/list'

export type UiCollectionSummaryScope =
  | 'loaded'
  | 'page'
  | 'selected'
  | 'matching'
  | 'all'
  | 'custom'
export type UiCollectionSummaryStatus =
  | 'ready'
  | 'loading'
  | 'stale'
  | 'unavailable'

/** Owner-assisted access. No view-owned fetching or aggregation. */
export interface UiCollectionSummarySource<T> {
  readonly scope: UiCollectionSummaryScope
  readonly coverage: 'complete' | 'partial' | 'none'
  readonly status: UiCollectionSummaryStatus
  readonly label?: string
  readonly records?: () => Iterator<T>
}
export interface UiCollectionSummaryContext<T, D = unknown> {
  readonly scope: UiCollectionSummaryScope
  readonly coverage: 'complete' | 'partial' | 'none'
  readonly status: UiCollectionSummaryStatus
  readonly label: string
  readonly provided: D | undefined
  /** Each call creates an independent iterator; it never fetches implicitly. */
  records(): IterableIterator<T>
}

export function collectionSummary<T, F, S extends string, D>(
  binding: UiListBinding<T, F, S>,
  options: {
    summaryScope?: UiCollectionSummaryScope
    summaryLabel?: string
    summaryData?: D
    summarySource?: UiCollectionSummarySource<T>
    loading?: boolean
  },
  defaultLabel: string,
): UiCollectionSummaryContext<T, D> {
  const source = options.summarySource
  if (
    source &&
    options.summaryScope !== undefined &&
    options.summaryScope !== source.scope
  )
    throw new Error('Summary scope must match its owner-provided source.')
  const scope = source?.scope ?? options.summaryScope ?? 'loaded'
  if (
    !['loaded', 'page', 'selected', 'matching', 'all', 'custom'].includes(scope)
  )
    throw new Error('Unsupported summary scope.')
  if (!source && !['loaded', 'page', 'selected'].includes(scope))
    throw new Error('This summary scope requires an owner-provided source.')
  if (scope === 'page' && binding.continuation === 'accumulate')
    throw new Error(
      'Accumulated collections have no current-page summary; use loaded.',
    )
  const label = options.summaryLabel ?? source?.label ?? defaultLabel
  if (!label.trim())
    throw new Error('A collection summary requires an accessible label.')
  const items = binding.items
  const selected = new Set(binding.state.selectedKeys)
  const status =
    source?.status ??
    (options.loading || binding.state.activity !== 'idle'
      ? binding.state.result
        ? 'stale'
        : 'loading'
      : binding.state.error || binding.state.stale
        ? binding.state.result
          ? 'stale'
          : 'unavailable'
        : binding.state.result
          ? 'ready'
          : 'unavailable')
  const hasResult = Boolean(binding.state.result)
  const suppliedCoverage = source?.coverage
  const coverage = () => {
    if (suppliedCoverage) return suppliedCoverage
    if (!hasResult) return 'none' as const
    if (scope !== 'selected' || !selected.size) return 'complete' as const
    const keys = new Set(items.map((item) => binding.itemKey(item)))
    return [...selected].some((key) => !keys.has(key))
      ? ('partial' as const)
      : ('complete' as const)
  }
  if (
    !['ready', 'loading', 'stale', 'unavailable'].includes(status) ||
    (source && !['complete', 'partial', 'none'].includes(source.coverage))
  )
    throw new Error('Unsupported summary status or coverage.')
  if (source?.records !== undefined && typeof source.records !== 'function')
    throw new Error('Summary records must be an iterator factory.')
  const factory = source?.records?.bind(source)
  const records = () => {
    if (source && !factory)
      throw new Error(
        'This summary source supplies no records; use the provided business data.',
      )
    return (function* () {
      if (factory) {
        const iterator = factory()
        let completed = false
        try {
          while (true) {
            const next = iterator.next()
            if (next.done) {
              completed = true
              return
            }
            yield next.value
          }
        } finally {
          if (!completed) iterator.return?.()
        }
      } else {
        for (const item of items)
          if (scope !== 'selected' || selected.has(binding.itemKey(item)))
            yield item
      }
    })()
  }
  return Object.freeze({
    scope,
    get coverage() {
      return coverage()
    },
    status,
    label,
    provided: options.summaryData,
    records,
  })
}
