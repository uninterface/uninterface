# UiFilterCommitResult

`UiFilterCommitResult = 'committed' | 'unchanged' | 'invalid' | 'unavailable' | 'superseded'`. Import the type from `@uninterface/uninterface`.

Committed means criteria accepted by the query owner, not remote-read completion. Unchanged means the current criterion already matches and no query is issued; draft normalization/reset may still occur. Invalid leaves editable draft/feedback without a write. Unavailable means disabled/disposed/unsupported or source rejection. Superseded means a newer edit, external replacement or lifecycle transition invalidated asynchronous work.

UiCollectionFilter's view-context submit/clear emits applied only for committed/unchanged results. Unexpected explicit exceptions reject and populate binding.error. Verify results with delayed validation and remote reads independently.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
