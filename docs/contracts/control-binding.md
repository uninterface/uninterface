# Control binding

Target-specific bindings connect buttons, links, collapsibles, drawers, tabs and collection views to their owners. Each target has its own contract; there is no universal binding object. Explicit external form association is supported for form buttons. The existing field context is related functionality, not a universal public binding API.

A control binding connects a control to a component in a specific role. It supplies static configuration, reactive properties, and the applicable interaction route. State ownership remains with the control. Components consume the target contract without learning the producer's concrete type.

Activity and explicit availability remain separate observations. For buttons they combine through a fixed rule: loading requests an activity indication and prohibits activation, so effective disabled is `loading || disabled`. Disabled alone does not request an activity indication. A form submit binding may supply both loading and disabled during saving. Its reset binding supplies disabled without loading, because Reset is not executing the save. A component can also display loading directly without a control binding.

## Responsibilities

| Party | Obligation |
|---|---|
| Business composition | Choose the owning control, connect the appropriate role once, supply operations, labels and rules, and decide lifetime |
| Binding producer | Project live state and role configuration; define operation policy, allowed invocation and outcome handling |
| Core component | Check target compatibility and composition rules, derive effective props, and route interactions once |
| Backend | Present supplied state accessibly and report interaction through the specified route; no competing state manager |

Bindings are read-only to consumers. Updates must remain reactive rather than copied into local loading flags. Multiple views can consume the same owner; mounting or unmounting them does not decide control lifetime. Bindings must not carry toolkit classes, backend component instances, or concrete styling decisions.

Define owned properties and allowed additions for each target. Do not resolve conflicting behavioral properties by Vue prop order. [UiButtonBinding](../api/types/UiButtonBinding.md) owns type/loading/activation, allows local disabled to further restrict availability, and leaves semantic content and presentation options to the component. Native form events and activation callbacks are exclusive routes, preventing duplicate execution.

## Link bindings

UiLink accepts either an explicit `href` or a producer-independent [UiLinkBinding](../api/types/UiLinkBinding.md). A shared navigation owner or business composition projects the destination URL, confirmed current-location state and navigation-request route without creating a separate control for each link. The application/router remains the policy and confirmed-location owner. Modified-click, new-tab and other native link operations must be preserved; refused navigation must not optimistically update current location. UiLinkBinding exposes href, current, disabled and request(event); href and binding cannot be combined. [createUiNavigationControl](../api/functions/createUiNavigationControl.md) supplies reusable link bindings. See the [navigation guide](../guides/navigation-and-tooltips.md).

Optional `color?: UiThemeColor` is local presentation independent of navigation ownership. Omission preserves backend/theme link presentation; explicit values request shared semantic roles, with extension roles requiring declared theme support. Backends own actual colors and interaction treatments. Native anchors remain supported for ordinary content. Verify native link behavior, confirmed-state updates, refused navigation, accessible current state, theme support and lifecycle cleanup. A key-only navigation binding uses button semantics without inventing a URL.

## Implemented form relationship

`form.bindings.submitButton` and `form.bindings.resetButton` project the form control. Their names identify the target role. Core uses generic binding-scope metadata to require their matching `UiForm`; `UiButton` imports no form-control implementation and does not inspect form state. Backend button views receive only normalized button props, not the original binding or its owner.

The form's current submit policy validates before saving, blocks duplicates, and locks editing/reset while pending. Its invalid draft remains submittable so the person can request feedback. Programmatic calls use the same control lifecycle. Submission success, failure, and disposal follow the form contract; a promise does not imply cancellation support.

Native association uses either containment or an explicit UiButton `form` matching UiForm `id`. Explicit association supports sibling slots and teleported buttons in the same Vue application and native document/tree scope, including modal footer actions. Business authors supply document-unique IDs (Vue `useId()` is suitable in a reusable component), and must not introduce duplicate native IDs, nested forms or arbitrary DOM reassociation. Core checks the registered host against the binding’s scope without teaching UiButton about form controls. Missing hosts disable bound actions until available; different owners are rejected. Host registrations follow control/ID changes and unmount cleanup. Multiple submission intents, universal binding composition, and automatic managed association from `type="submit"` alone are not claimed. A plain submit type still provides native submission, but obtaining managed button state requires the binding.

## Loading presentation

[UiButton](../api/components/UiButton.md) independently supports `loading`. Backends must provide a perceivable indication and accessible state/status while preserving the action's label. They must prevent activation while loading or disabled, preserve the action element without deliberate focus relocation, and support reduced motion. Native disabled behavior governs focusability; loading must not remount the button. Indicator structure, spacing, animation and any size changes belong to the backend's presentation policy. Backend documentation describes its indicator and reduced-motion treatment. Built-in activity wording is provided through [UiMessages](../api/types/UiMessages.md).

Region loading, overlays, loading directives/services, progress reporting, and cancellation need their own host and interaction contracts. A visual mask must not silently determine whether underlying actions are allowed. These facilities are not implemented by button loading support.

## Verification

Test a non-form producer alongside form submit/reset; verify all loading/disabled combinations, availability recovery and preserved explicit restrictions, conflict errors, shared pending state across buttons, duplicate prevention before rerender, native reset/submit routing, programmatic activity, unrelated enabled actions, disposal and baseline behavior, and unchanged business markup across backends. Real-browser checks must cover Enter submission, accessible naming, visible indicators, focus and reduced motion. DOM simulation verifies state and wiring, not visual or assistive-technology conformance.

## Collapsible bindings

UiCollapsibleBinding projects expanded/disabled state and a synchronous requestExpanded callback. It can be produced by createUiExpansionControl or another business owner. UiCollapsible consumes that target contract without inspecting a particular control. Binding and v-model ownership are mutually exclusive; local disabled only tightens user availability. Owner-driven expansion changes remain possible while disabled. Backends receive resolved state and forward requests without committing a competing state.

Expansion controls coordinate keys independently of placement and mounting. A shared binding does not imply visual adjacency or cross-panel keyboard navigation. See [UiCollapsibleBinding](../api/types/UiCollapsibleBinding.md) and [panels](../guides/panels.md). Verify a non-expansion-control producer, rejected requests, synchronous coordination, local restrictions, view remount and stale binding requests after owner disposal.
