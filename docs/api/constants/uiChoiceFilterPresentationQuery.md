# uiChoiceFilterPresentationQuery

Import from `@uninterface/uninterface`. Typed contextual query for [uiChoiceFilterPresentation](../../strategies/uiChoiceFilterPresentation.md), consumed at collection-filter. Answer type is UiFilterSelection<UiChoiceFilterEditorBinding<any>>; context is the corresponding UiFilterViewContext.

Custom strategy families may answer it; query blocking stops all incoming contributions to this concern. Selectors agree on selected adaptation identity, not function/name identity. No answer/conflict restores that pattern's default. The pattern discriminant prevents applying a different pattern's renderer; subtype-specific value semantics remain the custom view author's obligation. Verify scoped and blocked answers, equivalent selections, incompatible selectors and reactive context without query writes. See [filter adaptations](../../guides/filter-adaptations.md).
