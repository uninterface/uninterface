# UiRangeFilterDraft

Import type from `@uninterface/uninterface`.

`UiRangeFilterDraft` is `{ minimum: string; maximum: string }`, the coordinated raw input for UiRangeFilterEditorBinding.field. Both texts are validated together into UiFilterRange<T>; accepted values are formatted through the bound codec. Use field.set or supported input projections, not independent baseline mutation. Invalid drafts remain available without query writes. Verify partial edits, clear/discard, normalization and stale-validation guards.

See [built-in filters](../../guides/filter-patterns.md) and [filter adaptations](../../guides/filter-adaptations.md) for supported examples, ownership and observable checks.
