# UiCollectionSummaryContext

Import from `@uninterface/uninterface`.

`UiCollectionSummaryContext<T, D = unknown>` is the summary-slot argument. Read-only members are scope: UiCollectionSummaryScope, coverage: 'complete' | 'partial' | 'none', status: UiCollectionSummaryStatus, label: string, provided: D | undefined and records(): IterableIterator<T>. Each iterator is fresh and lazy; no aggregation is selected. Default iterators capture accepted membership and selected keys, retaining original item objects. provided forwards summaryData without interpretation; business code may use it instead of iteration. Broader scopes require a source. The context is frozen; do not use it to mutate the draft.

Used by UiCollectionView and UiTable summary configuration, and UiCollectionField/UiTableColumn summary slots. See [collection summaries](../../guides/collection-summaries.md) for owner obligations, typed examples, presentation and observable verification. Verify scope/freshness, reactive updates, fresh lazy iteration and no presentation-triggered reads.
