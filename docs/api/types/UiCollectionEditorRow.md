# UiCollectionEditorRow

`UiCollectionEditorRow<T, E extends UiListValueEditor<T>>` is imported from `@uninterface/uninterface` and returned by collectionEditor.row(key).

- `key: UiListKey` preserves numeric versus string identity.
- `item: T | undefined` is the current last successfully projected typed record.
- `editor: E | undefined` is the borrowed current row editor.
- `bindings.removeButton: UiButtonBinding` supplies live availability, loading and immediate draft removal.

Guard editor before using its fields in a slot finishing a stale render. Unknown, removed and disposed targets return undefined and an unavailable removal action. A retained row handle belongs to its original editor identity; reinserting the same key creates a fresh handle and leaves the old action unavailable. Do not dispose a borrowed editor or submit its last-valid item projection.

Core owns identity-safe lookup and stable bindings. Backends render actions and focus targets. Verify retained identity on ordinary projection updates, safe removal during rendering, key reuse and numeric/string separation. [Usage](../../guides/collection-editors.md).
