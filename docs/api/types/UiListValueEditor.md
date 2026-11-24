# UiListValueEditor

`UiListValueEditor<T>`, imported from `@uninterface/uninterface`, describes one owned business record editor:

```ts
interface UiListValueEditor<T> {
  readonly field: UiFieldControl<T, any>
  dispose(): void
}
```

The field holds one record value with any raw draft type. It must come from the field factory or a supported composition such as [createUiRecordValueControl](../functions/createUiRecordValueControl.md). Additional typed editor properties are preserved by collection inference, allowing views to borrow scalar controls.

`createEditor` must return fresh exclusive ownership. It must not return a field already claimed by a form/collection, share the same editor between keys, mutate existing owners during construction, or independently persist. `dispose` releases the editor's own resources, must be idempotent and must not throw. Invalid borrowed returns are rejected without disposing another owner's control. Successfully staged editors are owned and cleaned up by the collection, including when preparation is abandoned.

Verify view removal does not dispose this object, confirmed removal does so once, and raw invalid drafts survive view changes. [Collection factory](../functions/createUiListValueControl.md).
