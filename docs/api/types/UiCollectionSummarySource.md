# UiCollectionSummarySource

Import from `@uninterface/uninterface`.

`UiCollectionSummarySource<T>` is a read-only object with required scope: UiCollectionSummaryScope, coverage: 'complete' | 'partial' | 'none', status: UiCollectionSummaryStatus; optional label: string and records(): Iterator<T>. Its factory supplies a fresh consistent iterator on demand. It must not return the same consumable iterator repeatedly. Omit records for data-only assistance; calling context.records then rejects. The owner handles query snapshots, loading, stale results and cleanup. This is an optional data-access contract, not a second list control or a view-owned request service.

Used by UiCollectionView and UiTable summary configuration, and UiCollectionField/UiTableColumn summary slots. See [collection summaries](../../guides/collection-summaries.md) for owner obligations, typed examples, presentation and observable verification. Verify scope/freshness, reactive updates, fresh lazy iteration and no presentation-triggered reads.
