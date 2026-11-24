# UiCollectionFilterControl

`UiCollectionFilterControl` is a factory-created object, not a class. Import the type from `@uninterface/uninterface`.

Readonly binding: UiCollectionFilterBinding; dispose(): void. The business owner creates it once and disposes at session end. Disposal is idempotent, cancels scheduled/late filter work, stops the owned scope and calls editor.dispose once. It does not dispose the shared query/list owner. Views borrow binding independently of control lifetime.

Verify remounts preserve drafts before owner disposal, late work cannot write afterward and repeated disposal is safe.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
