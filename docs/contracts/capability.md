# Capability contract

Capabilities use explicit identifiers, JSON declarations and requirement checks. Conditional dependency resolution and automatic requirement discovery are not provided.

## Business meaning

A capability names a documented behavior an implementation can fulfill. A component name alone does not establish support for every behavior: fixed layout division, for example, does not imply user-adjustable division.

Applications declare the capabilities they need. Core and the selected backend supply support declarations. An unmet requirement is an error; silently replacing it with weaker behavior does not fulfill the contract.

## Current declarations and matching

Core and backend packages expose `capabilities.json`. Capability identifiers are exact strings with a version suffix, such as `actions.v1` or `theme.colors.v1`. The backend descriptor exposes its supported identifiers at runtime. See [UiBackendDescriptor](../api/types/UiBackendDescriptor.md) and the [backend assembly contract](../api/backend/README.md).

`createUiApplication(root, { requires })` checks explicit requirements against the union of core and selected-backend capabilities before mounting. Components also check the capabilities needed by their supplied options. Business code can inspect active support through [getUiRuntime](../api/functions/getUiRuntime.md). Tooling checking an arbitrary candidate can use [assertUiCapabilities](../api/functions/assertUiCapabilities.md).

The current checker matches literal identifiers; it does not negotiate versions, infer dynamic Vue expressions, install providers or prove that a declared implementation behaves correctly. Build tooling can check explicit manifests before execution. The development workspace does so for its scenarios; installing core alone does not install an automatic Vue-template scanner.

### Control focus

`control.focus.v1` declares the asynchronous focus handle for UiTextInput, UiCheckbox, UiSelect, UiRadioGroup, UiCheckboxGroup and UiButton. Results, implementation obligations and acceptance checks are defined by the [common control API](../guides/controls.md#focus). Disabled handling remains part of each control's base interaction contract.

### Optional strategy preferences

`strategy.scope.v1` declares core attachment, logical scope and barriers. Backend strategy capabilities declare query integration with documented value subsets; they do not imply every vocabulary value is implemented. See the [strategy support contract](strategy.md#common-vocabulary-and-support). Participants ignore concerns they do not implement. Implemented common concerns agree on requested values before applying their documented fallback relationships; ordinary presentation remains usable. Explicit capability requirements are still enforced: an application requiring an absent strategy capability fails rather than treating optional fallback as fulfillment.

### Theme-color declarations

`theme.colors.v1` declares the six baseline roles. Optional `themeColors` definitions describe extensions; `theme.color.<name>.v1` declares support for each extension. Color-consuming component capabilities require the shared baseline. Claims without valid definitions or baseline support are rejected by the shared validator. Applications explicitly declare required extensions. See [theme colors](../guides/theme-colors.md).

## Failure behavior

Known unmet requirements must fail the build when found during a build check. Runtime checks throw an error identifying the selected backend and missing capabilities. They must not reduce a required feature to a warning or silently substitute an unrelated presentation. Application error handling may report the failure, but cannot treat the unsupported operation as fulfilled.

Static verification covers only requirements available to the checker. A successful scan does not prove that all future dynamic combinations are supported; runtime checks remain necessary.

## Implementation responsibility and verification

Every declared capability must document its business meaning, implementation obligations, limits and observable acceptance criteria. Support declarations must agree with those contracts. Tests derive from the rules, preferably before implementation, and exercise supported behavior through Uninterface; declarations alone are not conformance evidence.

Verify that supported requirements pass, absent identifiers fail, invalid theme declarations fail, and failures do not activate a weaker substitute. Browser and manual checks remain necessary for interaction, geometry and accessibility claims. See the [test-kit contract](test-kit.md).

## Proposed extensions — not implemented

A broader model may express dependencies among backends, components, strategies and plugins, including conditional support and combinations. It would need to identify the origin of each requirement, distinguish unresolved support from verified support and retain hard errors for known mismatches. General version negotiation, conditional matching and automatic requirement discovery have no public API yet.

The [plugin contract](plugin.md) distinguishes backend-specific extensions from higher-level compositions. Their eventual declarations should express actual dependencies without requiring a backend list for an independent composition. Capability matching would establish support; it would not replace [strategy agreement](strategy.md) or choose a conflict-resolution policy.


Text editor extensions declare `input.text.readonly.v1`, `input.text.password.v1` and `input.text.multiline.v1`. Their exact behavior and backend obligations are defined by [UiTextInput](../api/components/UiTextInput.md). These capabilities are independent of `input.text.v1` and `control.focus.v1`; declare each capability separately. `theme.color-mode.v1` covers the shared application ownership/inheritance contract, not merely a toolkit's ability to render a dark palette.

`input.radio-group.v1` and `input.checkbox-group.v1` require the full corresponding [choice group](../guides/choice-groups.md) contract, including async source states, retained values, naming, availability and keyboard/focus behavior. `input.checkbox.tristate.v1` additionally requires sentinel representation, mixed presentation and indeterminate-to-checked activation; it is independent of binary checkbox support.

`focus.presentation.v1` declares presentation-only bindings for author-supplied focus targets, fulfilled through the backend `./focus` module and stylesheet. It is separate from `control.focus.v1`, which moves focus through a control handle. See [focus presentation](../guides/focus-presentation.md).

`native.content.v1` declares the complete [native HTML content baseline](native-html.md), supplied through the backend stylesheet. It covers the documented native set without per-element component imports or author CSS. Application setup can require it before mounting; capability matching does not detect an omitted stylesheet or prove visual conformance.

### Collection editor coordination

collection.editor.v1 is the core local projection/action coordination contract in [collection editors](../guides/collection-editors.md). collection.editor-focus.v1 is the backend integration with the optional core recovery callback, registered field focus handles and creation-action fallback described in [backend collection views](../api/backend/collections.md#editable-collection-focus-coordination). These are separate from list.value.v1 (draft ownership) and control.focus.v1 (individual focus handles). A matching attached collection requires backend recovery support at runtime; generic collections without the attachment retain their existing behavior. Verify immediate insertion/removal, view-local focus, stale-target cancellation and native fallback, not merely the presence of focus methods.
