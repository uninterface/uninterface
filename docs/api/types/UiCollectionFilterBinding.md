# UiCollectionFilterBinding

`UiCollectionFilterBinding` is the non-generic presenter-facing binding returned by createUiCollectionFilter. Import the type from `@uninterface/uninterface`.

Readonly reactive observations: target='collection-filter', key, label, fieldKeys, active, available, disabled, dirty, validating, error, summary, canClear, canRemoveSummaryItem and editing. Only factory-created bindings may be rendered. Active/summary describe current query criteria, not draft or retained result metadata. error is an unexpected editor/commit exception, not ordinary validation feedback or a list-source error.

Operations: commit(): Promise<UiFilterCommitResult>; clear(): UiFilterCommitResult; removeSummaryItem(key): UiFilterCommitResult; discard(): void. Clear/removal operate on latest criteria and cancel obsolete work. Clearing is available when supported/enabled and active or dirty. Removal validates the key against current summary.items. Discard restores current criteria without a read. No automatic global reset, popup closing or global keyboard shortcut is supplied.

Consumers should retain the object and read getters reactively. Hosts can render summary/trigger affordances without mounting the editor. Verify state synchronization, guards, unchanged values, late validation and independent read errors.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
