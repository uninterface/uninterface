# UiFormControl

Import this type from `@uninterface/uninterface` when accepting an existing form session, as [UiForm](../components/UiForm.md) does. Use `UiFormControl<T>` or the inferred return from `createUiFormControl<T>` to preserve model/field typing. The unparameterized type erases the model for generic view integration; it is a factory-created object type, not a class.

## Observations

| Member | Meaning |
|---|---|
| `bindings.submitButton` | Stable [UiButtonBinding](UiButtonBinding.md): submit role, pending activity, pending/disposed availability |
| `bindings.resetButton` | Stable [UiButtonBinding](UiButtonBinding.md): reset role, no loading, pending/disposed availability |
| `fields` | Named field controls supplied at creation |
| `dirty: ComputedRef<boolean>` | Any field differs from baseline or has a registered unfinished draft |
| `state.validating: boolean` | Current whole-form validation pass is in progress |
| `state.pending: boolean` | Validation/save request in progress |
| `state.validity` | `'unchecked'`, `'valid'`, or `'invalid'` from the whole-form check or distributed submission field issues |
| `state.outcome` | `'idle'`, `'invalid'`, `'saved'`, or `'failed'` submission outcome |
| `state.failure: string` | Public UiFormSubmissionError message, or empty when no public message was supplied |
| `state.error: unknown` | Complete submission error, including ordinary invalid results represented as UiFormSubmissionError; initially/when cleared `null` |
| `state.issues: (string \| UiMessageDescriptor)[]` | Whole-form rule issues; field issues live on fields |
| `state.resetRevision: number` | Reset signal for business compositions with internal drafts |

Whole-form validation and submission apply each field’s parse-and-format policy before collecting business values. Formatting does not establish a new baseline.

A field revision change invalidates previous whole-form validity/issues and, outside pending submission, clears the previous outcome/failure/error. Reset, a new submission and a new standalone form validation also clear the retained error. Editing and revalidation replace the affected field's distributed issue. Unknown field names are retained in the error without assignment; map API paths to the explicit collection keys in business code. Field validation alone does not establish whole-form validity. Observe state rather than assigning it directly.

## Operations

| Method | Contract |
|---|---|
| `validate(): Promise<boolean>` | Publish field checks; if all pass, run all form rules; no persistence |
| `submit<R>(onSubmit: (value: T) => Promise<R>, options?: { accept?: (result: R, submitted: T) => T }): Promise<R>` | Validate once, invoke the callback with required copied values, return its result; reject on validation, operation or lifecycle failure |
| `onReset(listener: () => void): () => void` | Subscribe after accepted reset; returns unsubscribe; rejects subscription after disposal |
| `reset(): void` | Restore field baselines and clear validity/outcome/failure/issues; increment reset signal; no-op while pending |
| `dispose(): void` | Idempotently stop internal effects, invalidate old work, release field participation and operation locks; reject future validate/submit/reset calls |

## Using `validate()` without submitting

Ordinary saving uses `submit(save)`, which always validates before invoking persistence. With [UiForm](../components/UiForm.md), `UiButton :binding="form.bindings.submitButton"` follows that path and presents its activity automatically. An unbound `type="submit"` also submits, but has no automatic state association. Neither a separate validation button nor a preliminary `validate()` call is required.

Call `validate(): Promise<boolean>` when a business transition needs valid input without saving, such as moving from an editing step to a review step. It takes no arguments and resolves to `true` only when the current field and form checks pass. Invalid or superseded work resolves to `false`; failure to complete a current check rejects. It returns no model. Synchronous and promise-returning parsers/rules use the same asynchronous contract.

```ts
import { ref, onUnmounted } from 'vue'
import { createUiFieldControl, createUiFormControl } from '@uninterface/uninterface'

// Inside a business component's setup: this form owns the details step.
const step = ref<'details' | 'review'>('details')
const details = createUiFormControl({
  name: createUiFieldControl('', undefined, [
    value => value.trim() ? null : 'Name is required.',
  ]),
})

async function continueToReview() {
  if (details.state.pending || details.state.validating) return
  if (!(await details.validate())) return
  step.value = 'review'
}

onUnmounted(() => details.dispose())
```

Bind the step's fields and feedback through the usual components. A Continue action can be a non-submitting `UiButton` calling this handler. This example is business composition using existing controls, not a built-in wizard API. Define focus behavior for the transition and failed validation as part of that composition.

The operation has these observable effects:

- It validates **all** factory-created fields supplied at creation concurrently, including disabled fields and fields whose views are hidden or unmounted. It does not stop after the first invalid field. For step-only checks, use a control whose explicit field collection represents that step; visibility does not change participation.
- Each field is marked checked and publishes its issue. Successful parsing formats its draft, even if a later rule fails; parse failures retain the original draft. Field rules and registered composition checks participate.
- If every field passes, form rules run in declaration order against copies of the same validated model snapshot. Their issues replace `state.issues`. If a field fails, form rules are skipped and `state.issues` is cleared; field issues remain on `fields[name].state.issue`.
- `state.validating` is true during the pass and `state.validity` is unchecked until a current result becomes `'valid'` or `'invalid'`. `validate()` does not dispatch save, set pending, lock fields, accept a baseline, or move focus. A new standalone form validation clears earlier submission outcome/error/failure feedback. Formatting can also change dirty state and trigger revision watchers. Validation is not a read-only query or a submission outcome.
- Baselines remain unchanged. Further field revisions invalidate the whole-form result; a prior `true` does not authorize saving a later draft without another check. Use `submit(save)` for persistence so validation and snapshot collection stay coordinated.

Invoke it at a settled editing boundary, not on every keystroke: parse-and-format can rewrite input. A direct form validate call during submission awaits its existing validation pass rather than starting another. Invalid user input should produce `false` through codec/rule results. Calling a disposed control rejects; unexpected exceptions from codecs/rules/checks also propagate from direct `validate()` calls.

For one field, use [UiFieldControl.validate()](UiFieldControl.md). Field validation alone does not establish whole-form validity. A direct control validation call does not perform the invalid-focus behavior that `UiForm` applies after a rejected submit.

## Submission and lifetime

```ts
try {
  const saved = await form.submit(saveCustomer)
  openCustomer(saved.id)
} catch (error) {
  // The form has already updated feedback for a current failure.
  // Handle application-specific recovery or diagnostics here.
}
```

Programmatic callers must await or handle the promise. For normal UI submission, UiForm consumes rejection at the native-event boundary and performs invalid-focus handling; its view does not expose the callback's success value.


Submit acquires temporary field locks before validation and releases only its own locks on completion or disposal. These locks combine with the business-owned `field.state.disabled` restriction in read-only `field.state.effectiveDisabled`. Business restrictions may change while pending and are never overwritten by lock cleanup. Disabled fields remain part of the model and validation. Repeated pending submit rejects with [UiFormSubmissionStateError](../classes/UiFormSubmissionStateError.md), reason `pending`, without dispatching again or changing the active attempt's state.

Submission awaits validation and saves that pass's copied value snapshot, without parsing or running rules again. Loading covers both validation and persistence. A stale pass never invokes save. Without a per-submission mapper, successful `acceptOnSave: true` uses the submitted snapshot. A supplied `accept(result, submitted)` mapper explicitly selects a complete canonical model instead and takes precedence over `acceptOnSave`. The business callback accepts the required validated model and returns `Promise<R>`. `submit()` resolves with that exact result, preserving its inferred type and identity, including `undefined` for a void callback. Any resolved value, including `false` or `null`, means success. A returned model is not automatically applied to the draft or baseline.

### Accepting a canonical save result

```ts
const result = await form.submit(saveCustomer, {
  accept: (response, submitted) => ({ ...submitted, ...response.customer }),
})
```

Use a pure synchronous mapper returning a complete `T`. It runs after persistence resolves and before submission locks are released, with the exact callback result and a copy of the submitted model. The result is still returned unchanged to the caller. A response is not applied unless this option is supplied; `UiForm` can forward the same policy through its optional `accept` prop.

The mapper owns domain adaptation and validation of authoritative returned data; the library does not rerun business validation or persistence against it. Missing model fields are rejected. Every field codec and composed-field participant prepares the canonical value before any baseline is adopted, so a formatter exception does not partially accept earlier fields. Current mapper/formatter failures record failed outcome and preserve the previous baseline; external persistence already completed and is not rolled back. A mapper that changes draft revisions, or a session disposed while mapping/formatting, cannot accept an obsolete result.

After successful acceptance, reset returns to canonical data, dirty tracking is clean and outcome remains saved. Child composition acceptance may reconcile identities under its own documented lifecycle. Programmatic draft changes while saving still make the submission obsolete. Verify default submitted-snapshot policy, opt-in canonical mapping, missing/invalid model failure, format-before-commit behavior and reset after canonical save.

Throw [UiFormSubmissionError](../classes/UiFormSubmissionError.md) for public feedback and optional field issues. `state.error` retains the complete error; `state.failure` exposes only this class's general message and is empty for unexpected thrown values. The business composition supplies safe, localized general failure feedback; neither the control nor UiForm renders it automatically. Local invalid results reject with a validate-stage error and outcome `invalid`; current callback/parser/rule exceptions produce outcome `failed` and reject with the original thrown value. Feedback and field mapping are updated, and the submission releases its locks, before rejection reaches the caller.

Obsolete completions reject with UiFormSubmissionStateError (`obsolete` or `disposed`) without publishing feedback; an obsolete rejected operation is retained as its cause. Recognized field issues make the form invalid, independently of stage. The full mapping is retained, while each field displays its first issue. General-only failures do not mark fields invalid.

Form effects belong to the control's detached scope, so the caller's scope ending does not implicitly dispose it. The actual business owner must register cleanup; see [reliable owner cleanup](../../guides/business-components.md#reliable-owner-cleanup). A field has at most one active form coordinator, checked atomically at creation; multiple views may borrow that same session.

First disposal stops the internal effects, invalidates pending validation and prevents subsequent save dispatch, late feedback and baseline adoption. It immediately releases its submission locks and field participation. Supplied fields remain live and can be validated or attached to a new form after disposal returns. Old async cleanup cannot release a new form's lock or publish into its fields, and repeated disposal changes nothing. A disposed form must no longer be used. Disposal does not cancel an already dispatched business operation; its external effects are the application's responsibility. Do not change field baselines or the field set during pending work. Control input values must meet the copying constraints documented on [createUiFieldControl](../functions/createUiFieldControl.md).

Core owns these mechanics. Business code owns policy and lifetime. Backends observe bindings and report interactions; unmounting a form view cannot dispose or reset its control on its own.

Acceptance includes isolated drafts, validation scopes, whole-model rules, failed-save retry, duplicate prevention, independent business restrictions and operation locks, and explicit baseline adoption. Request cancellation, dependency scheduling, and live edits during save are not implemented.


Standalone validation leaves editing enabled. Changes to any participating field invalidate that pass's model; pending form-rule results cannot overwrite newer feedback. Reset and disposal also invalidate the pass. A newer standalone form validation supersedes an older one. Obsolete standalone validation completions return false without publishing success. A current callback failure rejects direct validation; submission also rejects, records its failed outcome and never saves. See [asynchronous validation](../../guides/validation.md) for examples and error handling.

Validation and codec issues may be literal strings or [UiMessageDescriptor](UiMessageDescriptor.md) objects. Views resolve descriptors against application resources so existing feedback changes language without revalidation. Literal strings remain unchanged.

Reset also prepares all fields before publishing their restored values. A preparation failure preserves existing drafts and baselines; staged collection editors are discarded. Successful reset restores nested collection membership/order and clears child feedback as well as form feedback.

Reset subscribers run synchronously after successful baseline/state reset and resetRevision advancement, for both native and programmatic reset. Pending no-ops or reset preparation failures do not notify. Each registered listener is called even if another throws; reset then throws AggregateError containing observer failures, with the reset already completed. Unsubscribe when the borrowing owner ends; form disposal removes all subscribers. `form.onReset(feedback.reset)` connects an explicit [feedback route](../../guides/feedback-routing.md) without a second button-click path. Verify accepted, pending, failed and disposed lifecycles.
