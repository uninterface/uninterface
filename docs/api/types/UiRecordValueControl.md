# UiRecordValueControl

`UiRecordValueControl<T extends Record<string, any>>` is the factory-created result of [createUiRecordValueControl](../functions/createUiRecordValueControl.md), imported from `@uninterface/uninterface`.

- `field: UiFieldControl<T>` contributes the complete record to a parent.
- `fields: { readonly [K in keyof T]: UiFieldControl<T[K], any> }` exposes the borrowed scalar editors with their typed business values.
- `dispose(): void` ends the aggregate session and releases child coordination.

The aggregate owns coordination; supplied scalar controls retain their raw drafts and rules. Do not also place those scalar fields in another form while this aggregate is active. Views borrow `fields`; mounting/hiding them does not initialize, accept or dispose anything. Keep one explicit business owner and dispose it once its session ends.

Verify full-record validation/dirty state, staged acceptance/reset, lock propagation without overwriting disabled flags and safe child reuse after disposal. [Usage guide](../../guides/editable-collections.md).
