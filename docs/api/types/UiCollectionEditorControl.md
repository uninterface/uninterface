# UiCollectionEditorControl

`UiCollectionEditorControl<T, E extends UiListValueEditor<T>, F = Record<string, unknown>, S extends string = string>` is a factory-created object imported from `@uninterface/uninterface`.

| Member | Meaning |
|---|---|
| `value` | Borrowed UiListValueControl; contributes its existing `field` to the parent form |
| `bindings.list` | Stable UiListBinding for the local projection, including editor-owned row removal bindings |
| `bindings.addButton` | Ordinary UiButtonBinding when createItem is supplied; otherwise undefined |
| `list` | Owned projection's state, same bindings, pagination, column-support observations, setQuery, refresh and retry; no second membership editing API or disposer |
| `row(key)` | Stable UiCollectionEditorRow for a current editor identity, with safe undefined editor/item for stale rendered rows |
| `state.pending` / `adding` | An editing action is in progress / that action is Add |
| `state.error` | Last editing-action error, or null; do not expose exception text as public feedback |
| `state.disposed` | Controller or borrowed value has ended |
| `summarySource` | Full-membership all/complete summary metadata, with stale status for unprojected/pending/invalid rows |
| `add()` / `remove(key)` | Immediate draft membership operations, returning Promise<boolean> |
| `dispose()` | Idempotently ends coordination/projection, without disposing the borrowed value |

Actions recheck current restrictions before mutation. Only one editing action runs at a time. Disabled, duplicate, obsolete or missing-row requests return false. Construction errors are recorded and return false without changing accepted membership. An old Remove binding cannot remove a later editor reusing the same key. Query changes do not dispose hidden editors. Source-read errors remain in list.state.error; action errors remain separate. A reveal/focus failure after insertion records error but retains the successful insertion result, so a caller does not retry creation accidentally. No operation persists a row.

Projection updates are synchronous local reads scheduled from the value's revision; locked parent operations defer them until restrictions clear. No application refresh watchers are needed. Projection changes never validate or rewrite raw drafts; Save must use the parent form's validated model. The summary supplies metadata/iteration, not business totals or currency formatting.

Use [useUiCollectionEditor](../functions/useUiCollectionEditor.md) for view-local focus integration. The business owner creates/disposes the controller, parent form and value; borrowing views retain no ownership over these lifetimes. Verify action locks, canonical parent save/reset, raw-input/caret retention, stale-key safety and disposal during pending work. [Guide](../../guides/collection-editors.md).
