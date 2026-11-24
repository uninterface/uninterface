# uiButtonVariantQuery

Import from `@uninterface/uninterface` or `@uninterface/uninterface/backend`. A shared `UiStrategyQuery<UiButtonVariant>` identity for [uiButtonVariant](../../strategies/uiButtonVariant.md).

Custom strategies use `uiButtonVariantQuery.answer(value)` to answer the same concern. Button views query the identity at the existing logical node; the shared useUiButtonPresentation backend helper combines the answer with an explicit binding variant. Equal requested values agree; differing requests decline. An explicit UiButton.variant takes precedence over the regional answer.

Passing this identity to UiStrategy.block blocks incoming contributions from every family to this concern. Do not reconstruct an identity from its name. Verify custom answers, agreement/conflicts and blocking; see the [backend protocol](../backend/strategies.md#strategy-queries).
