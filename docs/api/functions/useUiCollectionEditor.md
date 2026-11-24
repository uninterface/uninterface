# useUiCollectionEditor

Import from `@uninterface/uninterface`. Call during a Vue component's setup to attach one borrowing view to a [UiCollectionEditorControl](../types/UiCollectionEditorControl.md). Returns [UiCollectionEditorView](../types/UiCollectionEditorView.md).

```ts
const view = useUiCollectionEditor(editor, {
  fields: row => [row.fields.description, row.fields.quantity],
})
// <UiForm :focus-invalid="view.focusInvalid" ...>
```

Options are [UiCollectionEditorViewOptions](../types/UiCollectionEditorViewOptions.md). The attachment provides a renderless descendant context. Uninterface editors using their UiField context register their public focus handles automatically; no component-reference map is required. The matching collection connects backend row recovery to these handles. UiTable registers its creation-action fallback. Other collections can use the same row recovery, with their normal native fallback when no registered editor can focus.

Each borrowing view needs its own component setup/attachment. An attachment is for one matching collection view; use separate child components when the same controller appears twice. Descendants must use its stable list binding. Changing the controller requires remounting. Mounting, hiding or disposing the attachment never creates, accepts, resets or disposes editable values. Deactivation/removal cancels its pending focus work and removes its registrations/listeners. SSR setup does not access the document or focus anything.

Actions invoked through descendant UiButton views capture this attachment synchronously. Add focuses the new row only in that originating view. Programmatic `editor.add()` does not infer a view to focus. Removal uses the view where focus was displaced, including programmatic removal. Invalid recovery is explicit through the returned method.

Verify two borrowing views share data but keep focus local; unmount/remount preserves drafts; hidden-invalid reveal precedes focus; newer operations, moved focus and ended views cancel obsolete work. See [the guide](../../guides/collection-editors.md).
