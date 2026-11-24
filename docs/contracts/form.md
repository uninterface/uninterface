# Form contract

Field/form controls, data-type codecs, asynchronous validation, submission and reset are implemented. The final section describes proposed extensions separately; those proposals are not current APIs.

## Input-styled field editors

The [input-styled control contract](input-styled-controls.md) establishes common field placement, input surface, focus and shape expectations for text, selection and compound editors. It applies within the field's allocated control area; UiField/form strategies retain label and feedback arrangement. Not every field editor has this style.

## Business meaning and ownership

A field represents one editable business value, its editing representation, interpretation and validation. [UiField](../api/components/UiField.md) associates its editor, label, instructions, requirements and feedback. A form coordinates an explicit set of fields and a submission operation. A field can also be used independently, such as an editable setting; form participation is a separate relationship.

Field-control independence is a global rule, not a temporal-component exception. UiField is the recommended presentation for ordinary fields, but a field control must remain usable without it or without a form: value updates, codec interpretation, validation, dirty state and reset do not depend on mounting the wrapper. Custom/standalone presentation assumes responsibility for accessible names and relevant help/feedback associations. This architectural guarantee does not imply that every existing editor already accepts a direct binding outside UiField; follow each editor's documented current API. Explicit field registration, not UiField presence, determines form participation.

The application owns domain data, field ordering, rules, persistence and session lifetime. Uninterface controls maintain editing state and coordinate validation and submission. Backends present that state and report interactions. They must not start a competing validation engine or decide which business values are acceptable.

| Concept | Responsibility |
|---|---|
| Field control | Maintain one draft, baseline, validation result and editing availability |
| Form control | Coordinate its field collection, whole-form rules, submission and reset |
| Codec | Parse the editing representation into a business value and format that value back into an editing representation |
| Validation rule | Check whether a parsed value or complete model is acceptable for the task |
| Field view and editor | Associate labels, instructions and feedback; display input and report edits |
| Backend | Realize accessible markup, focus, field feedback and native toolkit integration |
| Theme | Supply concrete colors, typography and spacing |

A reusable business component normally encapsulates its fields, codecs, rules and editing workflow. Its consumer supplies typed data and business operations. See [business components](../guides/business-components.md).

## Current field participation and lifetime

[createUiFormControl](../api/functions/createUiFormControl.md) receives a stable named collection of controls created by [createUiFieldControl](../api/functions/createUiFieldControl.md). That explicit collection determines participation; rendering a UiField inside UiForm does not register it, and hiding or unmounting its view does not remove it. Disabled fields remain included in validation and submission. Dynamic field membership and an inactive-field mode are not implemented.

Business code chooses where the session lives and when it ends. A view must not independently dispose a shared session. A business component may deliberately use its mount as the session boundary and dispose its form on unmount. Forms own detached internal effect scopes; the calling Vue scope ending does not end the form's coordination. Business owners must register explicit cleanup. A field has at most one active form coordinator, enforced atomically at construction, including duplicate identities. Multiple views may consume the same coordinated session. Separate controls may edit the same record under application policy; sharing that record does not imply sharing field controls.

Form disposal stops its effects, invalidates outstanding validation and releases its temporary locks and participation claims. Supplied fields remain independently usable and may join another form after disposal returns. Repeated disposal is inert; old async completion cannot publish into or unlock a replacement session. Business save operations already dispatched are not cancelled. See [reliable owner cleanup](../guides/business-components.md#reliable-owner-cleanup) for supported helper patterns.

The form control requires disposal; a field control has no disposal operation. Custom compositions unregister their extra checks and draft trackers when participation ends. See the [field](../api/types/UiFieldControl.md) and [form](../api/types/UiFormControl.md) references for operations and cleanup.

## Values, requiredness and normalization

Keep the editing representation, parsed business value and saved application value distinct. Incomplete text must remain available for correction; it must not cause an older parsed value to be submitted as current input.

A [codec](../api/types/UiCodec.md) provides `parse(input)` and `format(value)`. Parsing can return immediately or asynchronously; formatting is synchronous. Explicit validation formats successfully parsed input before evaluating business rules. A later rule failure does not undo formatting. Parse failure preserves the raw draft. Automatic feedback while typing does not format the input. Neither path adopts a new baseline.

Each codec documents its accepted format, empty representation, normalization, precision and information loss. Parsing a formatted supported value should recover an equivalent value under that policy. Supported values are structured-cloneable scalars and simple arrays/records with JSON-comparable drafts; arbitrary class instances, files and cyclic/reactive graphs are not promised.

[Numeric editing](../guides/number-and-money.md) uses the shared number codec for ordinary numbers and scaled integers. The application supplies formatting locale and numeric policy. A read-only currency formatter also takes explicit currency and scale.

`required` on UiField supplies accessible requirement information; a business rule or codec enforces presence. There is no automatic emptiness rule: `0` and `false` are values, and “must accept the terms” needs a true-only rule. Optional empty input and malformed supplied input need distinct codec/rule outcomes. Rules are not automatically skipped for optional values. Whitespace and empty-collection semantics belong to the business data type.

## Asynchronous validation

Field and form validation are asynchronous by contract. Parsers, field rules, whole-form rules and registered composition checks may return immediate results or promises. They must not mutate controls or persist data. Formatting stays synchronous.

- Field validation parses, formats successful input, evaluates rules/checks and publishes the first issue. Field `read()` checks a captured input without publishing feedback or normalizing it; its result is not a guarantee about a later draft.
- Form validation checks all supplied fields concurrently. Only when they pass does it run whole-form rules against copies of the same validated model snapshot. A field check alone never establishes whole-form validity.
- `state.validating` reports work in progress. Current validity is not established merely because there is no displayed error.
- Edits, reset and baseline changes invalidate obsolete results. Late work cannot rewrite newer input or feedback. This does not imply network cancellation.
- Current parser/rule exceptions reject direct validation calls; they are not converted into user-input mistakes. Submission catches validation/save failures and records a failed outcome. Callers must await or handle direct promises.

Issues can be literal text or message descriptors. Descriptors retain their translatable identity so language changes can update existing feedback without revalidating; literal business strings remain literal.

The current shared inputs validate text on blur and discrete choices on change; UiSelect also validates on blur. By default, once checked, edits update feedback without reformatting during typing. Field option `revalidateOn: 'validate'` defers that automatic work until the next explicit boundary or form validation/submission. Editable collections also select `projection: 'validate'` to prevent independent row inspections during typing; see [collection validation boundaries](../guides/editable-collections.md#validation-boundaries). Submission always checks current values regardless of earlier feedback. Backends choose how to present the resulting status, not when to execute validation. See [asynchronous validation](../guides/validation.md) for concurrency, error handling and exact return behavior.

## Submission, reset and baselines

| Operation | Current guarantee |
|---|---|
| `await form.validate()` | Publish field and whole-form validation without saving, adopting a baseline or moving focus |
| `await form.submit(save)` | Validate once and invoke persistence with the copied validated snapshot; reject duplicate active attempts |
| `form.reset()` | Restore field baselines and clear validation and outcome state; no-op during pending submission |
| `field.accept(value)` | Explicitly establish that field's formatted baseline and draft |
| `form.dispose()` | Stop coordination, prevent new operations and prevent late save success from adopting a baseline |

Submission sets pending state and locks field editing and form reset through validation and persistence, then releases only its own locks. The business restriction `field.state.disabled` remains independently writable; read-only `field.state.effectiveDisabled` combines that restriction with operation locks. Local UiField/editor disabled props add view restrictions. No layer restores a saved disabled value or enables editing against another active restriction. Invalid input never reaches the save operation. Saving uses the values already validated, without parsing a second time.

The business callback receives required validated values and resolves with `R` on success or rejects on failure. `submit<R>(onSubmit: (value: T) => Promise<R>): Promise<R>` returns that exact result. Local invalidity rejects with UiFormSubmissionError at stage `validate`; current callback exceptions propagate unchanged after feedback publication and lock cleanup. Duplicate/obsolete/disposed attempts reject with [UiFormSubmissionStateError](../api/classes/UiFormSubmissionStateError.md), without replacing current feedback. UiForm handles rejections at its native-event boundary; programmatic callers must await or catch them. Returned models are not applied automatically.

[UiFormSubmissionError](../api/classes/UiFormSubmissionError.md) standardizes public failures: `stage` identifies validation before dispatch (`validate`) or the submit operation (`submit`), with a general message and optional named field issues. Server-returned validation issues use stage `submit`. Applications translate their own API responses; backends never interpret them. The form retains the complete error and public message, and assigns the first issue of each recognized field. Unknown keys and additional issues remain available for application inspection. General-only failures do not invalidate fields. Unexpected exceptions remain available diagnostically. UiForm displays no result messages; the business composition chooses safe error wording and delivery, without exposing raw exceptions.

`acceptOnSave` defaults to false. When explicitly enabled, successful submission adopts the submitted snapshot as the reset baseline. An explicit per-submission `accept(result, submitted)` mapper instead selects a complete canonical model inside the guarded submission; `UiForm.accept` forwards the same policy. All field formatters run before baseline commits. The mapper is synchronous, pure and responsible for authoritative response adaptation; no second save or automatic domain validation is inferred. Failure retains drafts and baselines, including any normalization already performed. Neither success nor failure automatically closes a frame or navigates away. Disposal and local reset cannot cancel or undo an already dispatched business operation.

[UiForm](../api/components/UiForm.md) routes native submission through the control and moves focus after invalid submission. Its native reset route cancels browser reset and calls the control. `bindings.submitButton` and `bindings.resetButton` project role, pending activity and availability to UiButton. These bound buttons require a matching UiForm and native form association: either logical/native containment or explicit UiForm `id` and UiButton `form` association for external actions in the same application and native document/tree scope. See [control bindings](control-binding.md).

## Field presentation and accessibility

The field definition establishes what belongs together. Presentation decides how the label, control, requirement marker, help and feedback appear. Ordinary business use should not require per-field spacing or toolkit-specific validation wiring.

Backends supply documented defaults today. Error feedback may replace help or coexist with it; accessible descriptions must match what is displayed. Required-marker appearance is separate from required semantics and validation. A visible marker alone cannot convey requiredness accessibly. A placeholder never replaces a label, and status must remain understandable without color alone.

UiForm renders only its default content and owns no form-wide result presentation. Business compositions explicitly observe the control and choose inline notices, transient delivery or hosting-view messages, including whole-form issues. They own wording, announcements, dismissal and focus after removal. See [UiForm](../api/components/UiForm.md#application-owned-results) for the supported composition and obligations. Field validation and invalid-field focus remain built in; without an invalid field, focus falls back to the named form. Invalid checkable groups recover to the first enabled checkbox or selected enabled/first enabled radio, without changing selection. A named group/status container is used only when no option is usable; temporary fallback focusability is removed on blur. Options retain their feedback associations and native focus indicators; fallback containers use backend-consistent focus-visible presentation. See the [choice group focus rules](../guides/choice-groups.md#interaction-and-presentation).

## Custom compositions

The [shared input frame direction](frame.md#shared-input-frame-direction) documents the implemented UiInputFrame with ordinary UiTextInput surface for named projections of one compound field. It uses the existing control hooks below. Explicit backend/plugin participants can retain engagement across owned popups through the [control-frame API](../guides/control-frames.md); this does not transfer or aggregate validation ownership.

A custom editor may contribute checks through `addCheck()` and unfinished-draft tracking through `trackDraft()`. After changing internal input, it calls `notifyDraftChanged()` synchronously to invalidate old field/form validation and clear obsolete field feedback without changing the main input or baseline. Optional origin/parts metadata is descriptive: every notification invalidates the whole field snapshot. Core exposes a copied, immutable latest notification with its revision through `state.lastDraftChange`; later revisions without notification detail clear it. Notification does not start validation or cancel transport, and it remains effective while locked because it reports a change already made. It must account for all current input before submission, respect availability, respond to the business reset signal and provide a meaningful focus target. It must not count internal parts as duplicate owners of the same business value.

These hooks do not supply a general draft-preparation protocol or a built-in tags editor. A composition must define whether unfinished input becomes part of its value or blocks validation. A separate successful parse must not silently discard that input. The [UiFieldControl reference](../api/types/UiFieldControl.md) describes the supported hooks and notification semantics; the [validation guide](../guides/validation.md#internal-draft-notification) illustrates composition-owned attachment, changes, reset and cleanup.

## Observable acceptance

| Scenario | Required result |
|---|---|
| Parsing fails | Draft text survives and invalid input is not saved |
| Parsing normalizes a value, then a business rule fails | Canonical draft remains; reset still targets the previous baseline |
| Validation finishes after a newer edit/reset | Obsolete feedback cannot overwrite current state |
| A check cannot complete | No successful validation or save is reported |
| A field is hidden or disabled | Its declared form participation remains unchanged |
| Submission is invalid or requested twice while pending | No invalid save or duplicate persistence operation occurs |
| Saving fails | Draft and baseline survive; failure is reported |
| Saving succeeds | Baseline adoption follows the explicit canonical accept mapper or acceptOnSave policy |
| A disposed session's save completes | It cannot establish a new baseline |
| Field presentation changes | Labels, descriptions, focus and business state remain correctly associated |
| A composite contains unfinished input | Its documented check/preparation policy accounts for that input |

Browser and assistive-technology checks are needed for focus, announcements and visual presentation; control-level tests alone cannot establish those guarantees.

Field presentation strategies are implemented for labels, required annotations, help and validation failures. They do not change codecs, rules or participation. See the [strategy catalog](../strategies/README.md).

## Proposed extensions — not implemented

The following directions do not add props or operations to the current form API:

- **Conditional and repeated participation.** A future inactive-field state could exclude a field while retaining its draft for reactivation. Read-only/disabled interaction would remain distinct from inclusion. Repeated fields would need stable identity and correction targets; no nested HTML forms are implied. Detailed paths and collection APIs are unspecified.
- **Dependency scheduling and richer issues.** Declared rule dependencies, debouncing, cancellation and warning severity need further contracts. Current form revision invalidation is not a dependency scheduler. Submission-error mapping uses the stable field collection and rejects obsolete completions; dynamic nested/repeated field paths are not implemented.
- **Composite preparation and child lists.** A broader editor protocol could coordinate draft preparation, internal focus targets and local list editing. A text-like tags editor is an illustrative composition, not an available component. Filtering a child list must not remove hidden values from its parent draft. See [lists](list.md) and [plugins](plugin.md).
- **Additional workflow policies.** Live editing during save, server-normalized return values, general model replacement and reusable notification-delivery services need their own contracts. Those policies must preserve snapshot consistency and explicit baseline ownership. Application-owned dismissal must not clear form outcome state.

These extensions would need acceptance cases for inactive-field exclusion, dependency changes, repeated identities and strategy-independent field meaning before claiming support.

Choice group behavior and ownership are defined in the [choice groups guide](../guides/choice-groups.md). Each group edits one field, uses codecs for business translation, retains unavailable selections, and leaves repair/eligibility rules with its business owner.

## Structured editing values

Field drafts may include File/Blob descriptors and Date values. Snapshot copying preserves immutable File/Blob instances and copies mutable records, arrays, Dates and URLs. Default dirty equality is uiDefaultInputEquals: structural arrays/plain records (including undefined and cycles), primitive identity, Date time, URL href and File/Blob metadata. It does not read file bytes. A business-specific inputEquals may refine this policy. Equality only determines dirty state; it never suppresses validation, revisions or notifications. See [files and uploads](../guides/files.md) for validated replacement and baseline ownership.

## Field geometry obligations

The [field alignment discipline](../guides/field-alignment.md) defines label/control spacing and first-row anchors for above, beside and integrated labels. Group semantics do not by themselves change spacing. Taller editors, wrapped labels and feedback grow from the relevant anchor; explicit layout alignment remains authoritative.
