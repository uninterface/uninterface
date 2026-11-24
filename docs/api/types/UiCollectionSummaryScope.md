# UiCollectionSummaryScope

Import from `@uninterface/uninterface`.

`'loaded' | 'page' | 'selected' | 'matching' | 'all' | 'custom'`. Loaded is the default accepted window; page is a replacement window; selected includes accepted selected records and can have partial coverage. Accumulation rejects page. Matching/all/custom require an owner source; no scope implicitly fetches data.

Used by UiCollectionView and UiTable summary configuration, and UiCollectionField/UiTableColumn summary slots. See [collection summaries](../../guides/collection-summaries.md) for owner obligations, typed examples, presentation and observable verification. Verify scope/freshness, reactive updates, fresh lazy iteration and no presentation-triggered reads.
