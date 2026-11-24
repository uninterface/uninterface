# UiCollectionEditorView

`UiCollectionEditorView` is imported from `@uninterface/uninterface` and returned by useUiCollectionEditor during Vue setup.

`focusInvalid(): Promise<boolean>` reveals the first invalid full-order row and focuses its first participating invalid field. True means focus was handled; false permits UiForm's normal invalid-field/form fallback. Pass it to UiForm.focusInvalid. The existing value control rejects obsolete membership/draft/recovery snapshots. A disposed or deactivated attachment returns false.

`register(field, handle): () => void` explicitly registers a custom editor's public `focus(): boolean | null | Promise<boolean | null>` handle and returns its unregister function. The custom editor owner must unregister on removal; field identity must match a participating field from the view options. Uninterface's field-context editors register automatically. Focus handles retain responsibility for native target availability, visibility, disabled state and any asynchronous native focus mechanics.

The attachment borrows the controller; it has no value-reset or disposal authority. Component scope cleanup removes registrations and cancels pending recovery. Verify view-local registration, custom-focus fallback, hidden-invalid reveal and cleanup. [Guide](../../guides/collection-editors.md).
