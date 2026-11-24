# UiCollectionSummaryStatus

Import from `@uninterface/uninterface`.

`'ready' | 'loading' | 'stale' | 'unavailable'`. This describes summary-input freshness, not validation success. A supplied source owns it. Otherwise accepted retained loading/errors/staleness yield stale; an initial request yields loading; no result yields unavailable; a successful idle result yields ready.

Used by UiCollectionView and UiTable summary configuration, and UiCollectionField/UiTableColumn summary slots. See [collection summaries](../../guides/collection-summaries.md) for owner obligations, typed examples, presentation and observable verification. Verify scope/freshness, reactive updates, fresh lazy iteration and no presentation-triggered reads.
