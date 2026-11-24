# Accessibility contract

This contract separates business meaning, control state and presentation responsibilities for accessibility. A capability declaration or DOM test does not establish accessibility conformance; applications must verify their complete interface and chosen backend.

## Business concept and target

An interface must communicate its meaning and support its intended tasks through the input and assistive technologies people use. Accessibility is part of each component's ordinary contract, including custom and plugin components; authors should not need to enable a separate accessibility mode.

WCAG 2.2 Level AA is a reference for applications requiring accessibility conformance. Automated conformance gates are backend/application policy and must be documented there. Every backend retains shared functional requirements for keyboard operation, focus, names, state and feedback. Native defaults do not establish conformance; known presentation limitations must remain documented.

Use native HTML semantics where suitable and WAI-ARIA Authoring Practices Guide (APG) patterns for custom interactions. WCAG defines conformance requirements; APG provides implementation guidance. Neither choosing a library, adopting a pattern nor passing an automated scan establishes conformance of an assembled application. The application integrator decides its required conformance target and verifies the complete workflow.

Business authors supply meaningful content and relationships. Implementations translate those definitions into accessible behavior without requiring authors to specify ARIA attributes, DOM IDs, tab order, or focus-trap code.

## Responsibility boundary

| Participant | Responsibility |
|---|---|
| Business definition | Supply action meaning, labels, titles, instructions, validation messages, meaningful grouping and order, and text alternatives for meaningful content; define business restrictions and workflows |
| Reusable business composition | Encapsulate semantic definitions and accessible workflows so its consumers provide only task-specific information; define any workflow-specific focus destination in semantic terms |
| Control | Maintain authoritative values, selection, availability, pending state, validation results, and interaction outcomes for the view to expose; follow business-owned lifetime and policy |
| View/actuator and shared UI mechanisms | Supply semantic elements, accessible names and descriptions, state attributes, keyboard interactions, focus management, status announcements, and association wiring; coordinate these across composed views |
| Strategy and theme | Preserve accessible structure and behavior while supplying readable, operable presentation, contrast, visible focus, responsive layouts, and appropriate motion treatment |
| Backend/plugin implementer | Declare supported contracts and demonstrate that its implementation and supported compositions fulfill them; repair gaps left by dependencies |
| Application integrator | Verify the complete workflow with real content, chosen themes, and supported environments; a component library cannot verify business meaning or every application composition |

Responsibilities may be implemented through shared services rather than repeated in every actuator. Focus coordination must follow the control's state and business policy without becoming an independent owner of selection, validation, or control lifetime.

## Minimum component guarantees

These are baseline practical obligations for relevant components, not an exhaustive restatement of WCAG.

### Meaning and names

- Use native semantics where they fit; custom widgets must expose the appropriate role, name, value, and state.
- A field's business label supplies its accessible name through implementation-owned wiring. A placeholder alone is insufficient.
- Composite controls identify their individual editable parts as well as the group. An overall “Address” label cannot identify every address input.
- An icon-only action needs action meaning, such as “Remove invoice line”; an artwork identifier such as `trash` is not a substitute. Decorative icons must not create duplicate announcements.
- Logical groups become accessible groups, headings, or landmarks where their meaning calls for them. Being a logical node does not automatically require a DOM wrapper, focus stop, or landmark.
- Localized names, descriptions, and status messages use built-in i18n. Visible labels and accessible names must remain consistent, including the visible label in the accessible name where required.

### Operation and focus

- Applicable operations work with a keyboard and with supported pointer/touch input. Use the relevant native or APG interaction pattern; not every widget uses the same arrow-key behavior.
- Focus is visible, moves in a meaningful order, and is not entirely obscured by application content. Views must coordinate focus through opening, dismissal, item removal, and responsive changes.
- A modal has a meaningful name, contains keyboard focus while active, and makes outside content inert. Initial and return focus depend on the content and workflow. Associated popups must remain operable within the modal interaction even if rendered elsewhere.
- UiModal enables Escape as a cancellation request by default, following its explicit business close policy; a consumer may disable that route through the documented prop. Declined closure must provide an understandable outcome and a usable path forward; accessibility must not silently override business policy or discard drafts. Exceptional dismissal behavior needs an explicit contract and review against the applicable pattern.
- Dragging interactions need the applicable non-dragging pointer alternative as well as keyboard access. Touch-target size and spacing follow the applicable WCAG requirements and exceptions.

### Feedback and changing state

- Expose required, invalid, disabled/read-only, selected, expanded, and pending states where relevant, consistently with control state.
- Associate instructions and validation feedback with their fields. Submission failure provides an understandable route to affected fields, including fields in collapsed or otherwise hidden regions.
- Communicate relevant status changes without forcing focus to every message. Announcement timing should avoid duplicate or excessively frequent speech; do not announce every keystroke as an alert.
- Preserve user input on validation failure. An ordinary invalid business value produces feedback, not a capability crash.
- A table-to-card change preserves control-owned filters and selection; its new view must expose that state accessibly and maintain a meaningful focus destination.

### Presentation

- Backend-generated, visually hidden accessibility content must preserve its semantic purpose without changing visible layout or extending any scrollable area. This includes announcements, hidden labels, required descriptions and accessible error text. Business compositions must not need positioning or overflow workarounds. Focusable content intended to become visible on focus, such as skip links, requires its own operable presentation.
- Applications claiming WCAG conformance must meet the applicable text and non-text contrast requirements with their chosen theme, including dark mode. Native backend defaults may have documented contrast limitations; a test finding alone does not authorize changing those defaults. Semantic roles such as `error` are not proof of sufficient contrast.
- Color alone does not convey required information. Font or hierarchy strategies must preserve readability and meaningful structure.
- Support text resizing and reflow under the applicable WCAG conditions and exceptions. Preserve operation under zoom and system high-contrast/forced-colors settings.
- Respect reduced-motion preferences for nonessential motion. Strategies must not remove names, focus indicators, or essential feedback to obtain a visual effect.

## Conceptual authoring examples

**Amount field:** the business definition supplies “Amount,” its money codec, currency context, and validation messages. The form/control supplies current value and validity. The actuator connects label, input, instructions, and errors and exposes the resulting state. Moving the label through a strategy preserves those associations.

**Date range:** a reusable composition defines an overall “Travel dates” group plus “Start date” and “End date” part labels. Its consumers supply the value and business constraints. The actuator implements the grouping and part associations; the consumer does not write accessibility attributes for two vendor controls.

**Delete confirmation:** the business definition supplies what will be deleted, the dialog title, action labels, and the deletion/closure rules. The frame implementation coordinates modality, keyboard behavior, and focus. The business decides the control's lifetime independently of closing the visible dialog.

## Explicit capabilities and verification

Accessibility obligations belong in the relevant component and mechanism contracts and their [capability specifications](capability.md). Avoid a single `accessible: true` flag as the entire support claim. A useful declaration identifies the behavioral contract and its required semantic inputs; exact identifiers and schema remain open.

Compile-time checks can identify missing required label definitions, missing part associations, or implementations that do not declare required keyboard/focus behavior when those facts are statically available. Under the established hard-error policy, known unmet requirements fail compilation; ones encountered at runtime fail loudly. An unresolved dynamic label must not be falsely reported as verified, but compile-time uncertainty alone is not proof that a requirement is unmet.

Declarations cannot prove the quality of a label, actual focus behavior, screen-reader output, or every computed color combination. Verification therefore combines:

1. Static requirement matching and semantic-definition checks.
2. Automated checks of rendered semantics and key interactions.
3. Keyboard and assistive-technology checks of representative complete workflows, including composite controls, dialogs with popups, validation, and responsive view changes.

Document the browser/assistive-technology combinations and versions actually checked. Test the assembled adapter with its themes and strategies, not just the upstream dependency. Minimal presentation does not exempt a backend from this contract.

## Research basis

- [Reka UI accessibility](https://reka-ui.com/docs/overview/accessibility): provides roles/ARIA, keyboard navigation, and focus management while requiring consumers to supply meaningful labels.
- [Element Plus form accessibility](https://element-plus.org/en-US/component/form#accessibility): distinguishes a single labeled input from a multi-input group whose individual inputs need labels.
- [Bootstrap accessibility](https://getbootstrap.com/docs/5.3/getting-started/accessibility/): explains composition responsibilities, additional semantics/behavior, palette contrast limits, and reduced-motion support.
- [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) and its [modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/): reference interaction and semantic patterns.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/): conformance target; conformance concerns complete pages and processes, including responsive variants.

## Current limits and unspecified behavior

Per-component references specify implemented semantics and acceptance criteria. This baseline does not establish universal focus/announcement behavior or certify every testing environment. Business content, exceptional workflows and complex plugin controls need their own applicable obligations and verification.

### Focus presentation on author-supplied elements

[useUiFocusPresentation](../api/functions/useUiFocusPresentation.md) supplies backend-owned keyboard-focus presentation independently of focusability, roles and interaction. Apply the complete binding to the actual target. Native semantics or a documented custom interaction remains responsible for keyboard operability; a visible outline does not make a div an accessible control. See the [usage guide](../guides/focus-presentation.md) for ownership, examples and observable checks.
