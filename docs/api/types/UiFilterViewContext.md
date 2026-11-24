# UiFilterViewContext

Import type from `@uninterface/uninterface`.

`UiFilterViewContext<E extends { readonly pattern: string }>` contains readonly binding: UiCollectionFilterBinding, editor: E and presentation: UiFilterPresentationContext, plus submit(): Promise<UiFilterCommitResult> and clear(): UiFilterCommitResult. Unlike UiCollectionFilterViewContext.editor (a registered component), this editor is the typed pattern binding. Read properties reactively; do not destructure live observations into stale snapshots. Route completion through these operations to preserve applied events and popup behavior. Verify a custom component's editing, submission, context changes and owner-held drafts.

See [built-in filters](../../guides/filter-patterns.md) and [filter adaptations](../../guides/filter-adaptations.md) for supported examples, ownership and observable checks.
