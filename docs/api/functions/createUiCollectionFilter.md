# createUiCollectionFilter

`createUiCollectionFilter<F, V>(definition: UiCollectionFilterDefinition<F, V>, source: UiCollectionFilterSource<F>): UiCollectionFilterControl` creates one business-owned filter session. Import from `@uninterface/uninterface`.

Creates the editor once in an owned effect scope; does not read data remotely or require a mounted Vue view. Binding observations are reactive getters. Explicit commit coalesces concurrent submissions for the same draft, validates once and transforms the latest query. Live/debounced changes supersede earlier scheduled/validation work. Definition key must be nonempty; debounce must be finite/nonnegative.

The owner must call dispose; a borrowed view does not own lifetime. Disposed operations are unavailable and late results cannot write. External changes to the same criterion replace draft/baseline; unrelated changes do not. Exceptions reject explicit commit and populate binding.error; background live errors are recorded. Fields/editors must expose reactive changes through the documented protocol.

Verify no initialization reads, one read per effective commit, invalid/unchanged/stale guards, clearing, source failure ownership and disposal.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
