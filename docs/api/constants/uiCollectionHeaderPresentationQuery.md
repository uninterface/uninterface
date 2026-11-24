# uiCollectionHeaderPresentationQuery

Import from `@uninterface/uninterface`. A `UiStrategyQuery<UiCollectionHeaderSelection, UiCollectionHeaderContext>` consumed by the logical `collection-header` node. Custom strategy families may answer it; UiStrategy.block stops incoming contributions to it.

Agreement evaluates selectors against the supplied header context and compares resulting adaptation objects by identity. Undefined selector results abstain. Disagreement/all abstentions return undefined; UiCollectionHeader restores responsive built-in defaults. Function identities and diagnostic names do not decide agreement. Resolution remains synchronous and reactive. Invalid returned adaptations are errors, not string lookups.

See [uiCollectionHeaderPresentation](../../strategies/uiCollectionHeaderPresentation.md) for API, defaults and ownership. Verify distinct selectors selecting the same object, equal names on distinct objects, reactive selection, blocking and scoped fallback.
