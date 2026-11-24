# createUiCollectionEditorControl

Import from `@uninterface/uninterface`. Creates a [UiCollectionEditorControl](../types/UiCollectionEditorControl.md) connecting an existing editable value to local collection views and immediate Add/Remove actions.

```ts
const editor = createUiCollectionEditorControl({
  value: lines,
  createItem: createEmptyLine,
  disabled: () => form.state.pending,
})
```

The generic parameters are `T`, `E extends UiListValueEditor<T>`, `F = Record<string, unknown>` and `S extends string = string`. Options are [UiCollectionEditorOptions](../types/UiCollectionEditorOptions.md). The factory borrows the value and owns its list projection, action state and subscriptions. It initializes the local projection once; mounting a borrowing view does not issue reads. It does not validate the initial data, create a native form or persist rows.

The business owner disposes this control before its borrowed value. Keep it in the business component/session, independently of borrowing-view lifetime. See [collection editing](../../guides/collection-editors.md) for complete setup, responsibilities and rationale.

Verify initial projection without checks, boundary-time updates without a rendered loading mask, single activation, independent restrictions, retained raw drafts and cleanup without disposing the borrowed value. Errors retain accepted membership/baselines under the existing staged-value contract.
