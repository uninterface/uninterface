# UiFilterEditorContext

`UiFilterEditorContext<V>` is passed once to a definition's createEditor callback. Import the type from `@uninterface/uninterface`.

Readonly initialValue: V initializes the private draft. changed(): void reports a meaningful user/programmatic draft edit, invalidates old commit work and schedules live validation when configured. Do not report initialization, replace synchronization, normalization or presentation-only changes. Criterion values are read-only inputs by contract; clone mutable drafts before editing. It is distinct from the reactive view presentation context.

Use createUiFilterFieldEditor for ordinary scalar/compound fields. Verify no initialization reads and newer drafts superseding asynchronous results.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
