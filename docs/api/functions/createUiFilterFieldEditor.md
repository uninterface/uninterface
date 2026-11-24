# createUiFilterFieldEditor

`createUiFilterFieldEditor<V, D>(context: UiFilterEditorContext<V>, field: UiFieldControl<V, D>, view: Component): UiFilterEditorInstance<V>` adapts a scalar or compound field created by createUiFieldControl. Import from `@uninterface/uninterface`.

Create inside a definition's createEditor callback. The field must begin at context.initialValue. The stable Vue view borrows that field; it obtains filter operations/presentation with useUiCollectionFilter. Existing codecs and rules own parsing/validation; the adapter retains the exact validated result without a second parse and shares native blur/choice validation. Actual set/draft notifications call changed; normalization, rule registration and external replacement do not trigger live queries. replace accepts a new field baseline; dispose removes observers and invalidates pending field validation. Additional business resources remain the editor factory's responsibility.

Verify compound raw drafts, native choice validation, normalization without duplicate requests, accessible errors, synchronization suppression and observer disposal.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
