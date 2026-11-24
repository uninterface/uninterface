# UiCollectionFilterDefinition

`UiCollectionFilterDefinition<F, V>` is an open business definition: F is the whole collection filter object; V is this filter's normalized criterion. Import the type from `@uninterface/uninterface`.

Required members: stable nonempty key; label(): string; read(Readonly<F>): V; write(Readonly<F>, V): F; equals(V,V): boolean; isActive(V): boolean; summarize(V): UiFilterSummary; editing: UiFilterEditingPolicy; createEditor(UiFilterEditorContext<V>): UiFilterEditorInstance<V>.

Optional members: readonly fieldKeys: string[]; clear(Readonly<F>): F; removeSummaryItem(Readonly<F>, key): F; available(): boolean; disabled(): boolean. Field keys are associations, not inferred query ownership. Availability/default enabled is true; disabled default false. Summary and label callbacks may read localization reactively.

Read/write/equality/activity/summary are synchronous, side-effect-free business interpretation. Never mutate query values; write receives current criteria and preserves unrelated properties. Equality includes all query properties owned by this definition. Arbitrary value/editor types and compound writes are supported; overlapping writers require business coordination. clear means unrestricted according to the business, not necessarily null/empty or reset to initial defaults.

Verify scalar, choice, compound and opaque custom editors; none-selected versus unrestricted; immutable restrictions; localization; and summary item removal.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
