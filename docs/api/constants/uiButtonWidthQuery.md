# uiButtonWidthQuery

Import from `@uninterface/uninterface` or `@uninterface/uninterface/backend`. Shared UiStrategyQuery<'content' | 'full'> identity for [uiButtonWidth](../../strategies/uiButtonWidth.md).

Custom strategies answer with uiButtonWidthQuery.answer(value). Equal supported values agree; differing values leave the backend default. UiStrategy.block with this query blocks all incoming answers to this concern, including custom families. Blocking uiButtonWidth blocks only that factory's family.

Backend button views consume the query through useUiButtonPresentation().width(). The helper returns undefined for icon-only and parent-input-frame actions. It supplies intent, not markup. Verify scope, agreement/conflict, query barriers and reactive selection; see the [backend reference](../backend/README.md).
