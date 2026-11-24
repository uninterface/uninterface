# Compatibility test kit

The testing integration supports shared scenarios, Playwright operations and control/DOM checks. General automatic capability-driven case selection is not provided.

## Purpose and responsibilities

The kit verifies that an implementation fulfills documented Uninterface rules in actual use. A backend may present the same scenario differently while preserving its meaning, operations and outcomes. Capability declarations are claims; executable acceptance and human inspection supply evidence.

Every capability needs business meaning, implementation obligations and observable acceptance criteria. Cases derive from these rules and should precede implementation whenever possible. Unsettled design choices must remain explicit, rather than becoming test requirements merely because an implementation happens to behave that way.

| Participant | Responsibility |
|---|---|
| Scenario author | Compose a meaningful business task with inputs, operations, preconditions and expected outcomes |
| Shared acceptance suite | Exercise the documented rules through Uninterface, across applicable backends |
| Backend integration | Connect native presentation and supply mappings to actual rendered test targets |
| Backend-specific suite | Verify additional native integration and presentation requirements |
| Application test author | Assert the application's business outcomes and choose its accessibility policy |

## One runnable scenario, two uses

The same demo must work for human exploration and automated interaction. People inspect appearance and experience the workflow; automated scripts operate the actual composition to verify outcomes. Tests must not substitute a reconstruction of the interface or bypass its control layer.

Controllable data and simulated operations allow repeatable failure and transition checks. A scenario must remain usable independently of a test runner. See [testing business workflows](../guides/testing.md) for setting up the fixture and asserting outcomes.

## Current execution boundary

Shared tests use semantic roles, accessible names and application test IDs rather than toolkit CSS. `@uninterface/testing/playwright` supplies common operations for single/multiple selects, radio/checkbox groups and binary/tristate checkboxes, plus optional navigation entry discovery and field presentation mappings for the active label, control surface and required decorations. Backend `./testing` mappings identify rendered targets; the shared harness retains interaction rules. See [testing business workflows](../guides/testing.md) and the testing package's **mapping contract** in `@uninterface/testing` (`docs/adapter-contract.md`).

The adapter must identify real controls and popup surfaces. It must not force clicks, set model state, call private Vue handlers or repair focus to make acceptance pass. Native select operations can inspect and choose DOM options but do not verify the operating system's popup appearance. Composite controls use ordinary actionable interactions. Saved data and other business outcomes still need explicit assertions.

This responsibility split also applies to application lifecycle and hydration tests. A shared scenario specifies operations such as activating a field's label and checking focus; the backend maps the actual active label and its pointer-receiving target, including native duplicate, floating or pointer-pass-through presentations. The shared action clicks at the painted label's position using normal actionability checks. Test assembly must select the same backend for the rendered application and its testing adapter. Semantic roles, keyboard requirements, unique IDs and valid accessibility references remain shared acceptance rules. Backend differences in rendered parts belong in mappings, not conditional acceptance branches in scenarios.

Shared conformance adds keyboard, focus, presentation and accessibility checks. Backend-owned suites supplement those checks and are loaded only for the selected backend. They must not weaken shared requirements or turn a required failure into an irrelevant skip. Backend-owned suite metadata is documented in [backend testing integration](../api/backend/assembly.md#browser-testing-integration).

## Coverage and evidence

Each executable case should identify the rule, configuration, preconditions, actions and expected result. Include error paths and transitions where required, not just initial rendering. Record tested dependency versions so results have a concrete scope.

Distinguish unsupported, not exercised, failed and passed. An optional capability need not be claimed; a required or claimed capability cannot be treated as verified simply because its cases were skipped. General automatic case selection from capability declarations is not implemented.

Control and simulated-DOM checks establish state and wiring behavior. Browser checks establish exercised interaction and geometry. Manual assistive-technology checks remain necessary under the [accessibility contract](accessibility.md). None alone certifies all compositions or complete accessibility conformance. Applications choose their own acceptance policy; test helpers do not import workspace-specific contrast exceptions.

Backend implementations must permit repeatable scenarios and resource cleanup without changing business-owned control lifetime. The same business scenarios should run against each candidate without duplicated rule tests. Runner configuration, test commands and report storage belong to the environment supplying the scenarios; they are not installed by core.

## Proposed coverage — not implemented by this contract

| Scenario | Required behavior if supported |
|---|---|
| Form inside a modal | Field feedback remains associated; focus, background interaction and closing follow the modal contract |
| Desktop table changes to mobile cards | The shared list control retains filters and selection |
| Local child-list editing | Edits affect the parent draft without requiring an API; filtering does not remove hidden values |
| Composed rich input | Draft, value, availability, validation, reset and focus obey the field contract |

These are coverage directions, not claims that modal, list or rich-input APIs exist. Additional harness interaction models, general capability-driven selection, standardized reporting and release gates remain unspecified. Any extensions must retain the shared-rule and real-interaction boundaries above.
