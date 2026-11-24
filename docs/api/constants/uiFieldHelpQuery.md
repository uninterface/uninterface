# uiFieldHelpQuery

Import from `@uninterface/uninterface`, or from `@uninterface/uninterface/backend` when implementing a backend. A shared `UiStrategyQuery<'together' | 'replace-help'>` identity for [uiFieldHelp](../../strategies/uiFieldHelp.md).

Use `uiFieldHelpQuery.answer(value)` inside custom strategy factories. A participant queries it with its supported values using `useUiStrategy` at an existing core node, or a custom node's query method. See the [backend protocol](../backend/strategies.md#strategy-queries).

The agreement accepts equal supported values and declines differing ones. Core supplies a nonempty candidate list after scope, barriers and support filtering. The query does not prescribe toolkit markup or concrete measurements. Passing this identity to UiStrategy.block stops all incoming contributions to the concern, preserving local declarations and unrelated answers. Do not reconstruct an identity by name.

Verify typed answers, unsupported filtering, equal/conflicting contributions and custom-family blocking by this query. Exact values, meaning and supported backend subsets are documented by [uiFieldHelp](../../strategies/uiFieldHelp.md).
