# UiListValueOptions

Options for [createUiListValueControl](../functions/createUiListValueControl.md), imported from `@uninterface/uninterface`.

```ts
interface UiListValueOptions<T, E extends UiListValueEditor<T>> {
  initialValue: readonly T[]
  itemKey(item: T): UiListKey
  createEditor(item: T): E
  projection?: 'change' | 'validate'
}
```

Initial values are copied. Keys must be unique nonempty strings or finite numbers; string and number identities remain distinct. Key extraction and synchronous editor construction must not mutate existing session state. Each editor has exclusive record-field ownership and a nonthrowing disposer. Construction may reject malformed business input; preparation cleans up already-created candidates without publishing partial membership.

The options define one session, not a reactive replacement policy. Consumers of a business component provide initial data and operations; the component builds these internal options. A deliberate keyed remount starts a new session. Verify duplicates, reused fields, construction failure and independent collection owners. See [editable collections](../../guides/editable-collections.md).

`projection` selects when the typed row projection is refreshed. `change` (default) inspects edited rows automatically, without publishing child feedback, and inspects initial rows. `validate` starts from supplied typed initial values and inspects a row after explicit validation of its field or a descendant composed through `createUiRecordValueControl`. Standard text editors request this validation on blur. Draft edits only invalidate snapshots and mark `state.stale`; they do not parse/check a row. A completed failed boundary preserves the previous value and marks the row invalid. The row inspection may run its parsers, rules and checks; it does not publish additional child feedback.

To avoid all automatic checks during typing, also create scalar fields with `revalidateOn: 'validate'`. Projection selection does not change a child's own feedback policy. The collection's aggregate field defers change-time revalidation under `projection: 'validate'`. Form validation/submission still checks the complete raw collection in one coordinated pass, including hidden/unblurred children. Explicit `field.read()` deliberately checks fresh drafts regardless of projection timing. See [editable collections](../../guides/editable-collections.md#validation-boundaries).
