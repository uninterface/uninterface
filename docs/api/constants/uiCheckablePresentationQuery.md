# uiCheckablePresentationQuery

Import from `@uninterface/uninterface`, or `@uninterface/uninterface/backend` for backend authoring. This shared `UiStrategyQuery<'adapt' | 'flushed' | 'control-aligned' | 'separated'>` identifies the concern implemented by [uiCheckablePresentation](../../strategies/uiCheckablePresentation.md).

Custom factories return `uiCheckablePresentationQuery.answer(value)`. Field implementations accept the complete vocabulary and resolve adapt after agreement with the label query. Equal contributions agree; different values decline and retain the default adapt policy. Query blocking stops incoming contributions without affecting local declarations or other concerns. Do not reconstruct this identity by name.

The query owns presentation agreement, not control values, markup or theme measurements. Verify equal/conflicting answers, scope, family/query barriers and default restoration. See the [backend strategy protocol](../backend/strategies.md#strategy-queries).
