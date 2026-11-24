# UiCollectionEditorViewOptions

`UiCollectionEditorViewOptions<E>` is imported from `@uninterface/uninterface`.

`fields?: (editor: E) => readonly UiFieldControl<any, any>[]` supplies business field order for initial and invalid focus. Omission treats editor.field as the one participating custom field. A record editor normally lists its editable scalar fields and omits identity/read-only fields. This is an association with existing controls, not an authoring schema or another validation inventory.

`reveal?: (key: UiListKey, reason: 'add' | 'invalid') => void | Promise<void>` makes a newly inserted or invalid row visible. Clear restrictive filters/select its page and await the necessary presentation work. The attachment then awaits Vue rendering before requesting focus. It must not modify the validated draft or take over browser focus. Complete unfiltered views need no callback.

Core calls these associations without interpreting business slots or backend DOM. Backends retain target mechanics. Verify that reveal completes before focus, full hidden drafts remain participants, the requested borrower alone receives focus and obsolete reveals cannot focus removed/replaced rows. [Usage](../../guides/collection-editors.md).
