# uiFieldLabelsQuery

Import from `@uninterface/uninterface`, or from `@uninterface/uninterface/backend` when implementing a backend. A shared `UiStrategyQuery<'show' | 'above' | 'beside' | 'beside-far' | 'beside-near' | 'floating' | 'hidden'>` identity for [uiFieldLabels](../../strategies/uiFieldLabels.md).

Use `uiFieldLabelsQuery.answer(value)` inside custom strategy factories. A participant queries it with its supported values using `useUiStrategy` at an existing core node, or a custom node's query method. See the [backend protocol](../backend/strategies.md#strategy-queries).

The agreement accepts equal requested values and declines differing ones. Backend field integration accepts the whole common vocabulary and generalizes only after agreement; do not pre-map concrete positions to show/beside to manufacture agreement. Core supplies a nonempty candidate list after scope, barriers and support filtering. The query does not prescribe toolkit markup or concrete measurements. Passing this identity to UiStrategy.block stops all incoming contributions to the concern, preserving local declarations and unrelated answers. Do not reconstruct an identity by name.

Verify typed answers, documented fallback, equal/conflicting contributions and custom-family blocking by this query. Exact values, meaning and supported backend subsets are documented by [uiFieldLabels](../../strategies/uiFieldLabels.md).
