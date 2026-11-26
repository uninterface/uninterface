# Asynchronous validation

Validation belongs to the control layer. Business code defines the meaning of values and rules; components request validation and present its progress and result. Backends do not decide validation timing or run another validation engine.

Both field and form `validate()` return `Promise<boolean>`. Always await them before making a transition. A current successful pass resolves true; invalid or superseded work resolves false. Unexpected failures reject direct validation.

## Codecs and rules

Codec parsing may return an immediate `UiParseResult<T>` or a promise of that result. Formatting remains synchronous for initialization, normalization, and accepted baselines. Simple codecs need no artificial async wrapper.

```ts
import {
  createUiFieldControl,
  createUiFormControl,
  type UiCodec,
  type UiValidationRule,
} from '@uninterface/uninterface'

const nameCodec: UiCodec<string> = {
  parse: input => input.trim()
    ? { ok: true, value: input.trim() }
    : { ok: false, issue: 'Enter a name.' },
  format: value => value,
}

// `names` is a business-supplied service.
const availableName: UiValidationRule<string> = async value =>
  await names.isAvailable(value) ? null : 'That name is unavailable.'

const form = createUiFormControl({
  name: createUiFieldControl('', nameCodec, [availableName]),
})

async function continueToReview() {
  if (form.state.validating || form.state.pending) return
  if (await form.validate()) {
    // Enter the business workflow's review step.
  }
}
```

A parser can itself be `async`, for example to load a conversion resource or delegate computation:

```ts
// `parser` is an application-supplied parser service or worker adapter.
const codeCodec: UiCodec<string> = {
  parse: async input => await parser.parseCode(input),
  format: value => value,
}
```

The adapter returns `UiParseResult<string>` and must preserve the codec's declared interpretation. Return `{ ok: false, issue }` for an invalid representation. Keep interpretation in the codec and task-specific acceptance in rules. Neither should mutate the field or persist business data.

A failed service request is different from a negative validation result. Reject if the check cannot complete, or handle the failure explicitly; do not turn it into successful validation. Application error handling owns the recovery path for programmatic calls. Vue component events return validation promises to Vue's error handling. Submission catches validation failures and reports its failed outcome without calling save.

## Execution and state

Field validation awaits parsing, applies formatting to a current successful parse, then awaits field rules and registered checks in order, stopping at the first issue. Formatting does not accept a baseline. `state.validating` is true while feedback-producing work is current; a new check clears the previous issue. An empty issue is not proof of validity while work is pending.

Form validation starts independent field checks concurrently and waits for all. If every field passes, it evaluates form rules against copies of that same parsed model and collects their issues in declaration order. Form `state.validating` covers this whole pass. Standalone validation leaves editing enabled and does not set submission `state.pending`.

Text blur and discrete changes request explicit validation. By default, editing a checked field triggers an asynchronous feedback refresh while preserving raw input; `revalidateOn: 'validate'` defers that refresh. `set()` changes input immediately and returns a promise for that refresh; await or handle it when calling directly. `read()` asynchronously checks a captured draft without publishing feedback or formatting it. Its returned value can become obsolete while awaiting; it is not a substitute for coordinated submission.

Controls and grouped fields expose validation progress as accessible busy state. UiForm exposes busy state without adding Checking or Saving text. Presentation remains backend-owned.

## Validation timing

The business component owns validation timing through field control options. For text fields whose parsing, rules and checks should run on blur and submission:

```ts
const amount = createUiFieldControl(initialAmount, amountCodec, amountRules, {
  revalidateOn: 'validate',
})
```

Typing updates the raw draft, dirty state and revision immediately, invalidates old success and clears obsolete feedback. It performs no automatic parsing/rules/checks, including after a previous failure. Text editors invoke `validate()` on blur, which formats and publishes feedback. Form validation/submission checks every participating raw draft even if it has never blurred. Default `revalidateOn: 'change'` retains feedback refresh while correcting a checked field. Both modes wait for an explicit boundary before initial feedback.

`validate` names the control operation, so it works without a mounted view. Discrete editors can request explicit validation when an option is chosen; the option does not change their interaction boundary into blur. Explicit `read()` always evaluates its snapshot. Another composition can also request checks: use an editable collection's `projection: 'validate'` alongside this field option to avoid its default change-time row inspections. See [collection validation boundaries](editable-collections.md#validation-boundaries).

This execution policy belongs to control ownership. `uiValidationFailure` and other presentation strategies decide how feedback appears, not when business rules execute. No business-side debounce, input interception or backend-specific blur wiring is required.

Verify parser/rule/check call counts stay unchanged through typing before and after an invalid blur; real blur checks the edited field; and immediate submission validates the latest unblurred value. Edits during asynchronous work must still supersede that work.

## Newer input wins

Each feedback result belongs to the input revision and validation request that produced it. Edits, resets, baseline adoption, and changes to registered checks or draft trackers invalidate affected work. An obsolete result cannot normalize newer text, replace current feedback, or clear a newer pending state.

A newer standalone form validation supersedes its predecessor. A field change while form rules are pending invalidates that model. Superseded operations resolve false after their work settles; they never authorize a transition or save. Older failures are ignored when the owning operation is already obsolete.

This guards correctness but does not cancel a network request or worker job. Abort signals, debouncing, caching, and automatic cross-field dependency scheduling remain outside the current API. Rules depending on external changing state need a deliberate revalidation request; core cannot detect arbitrary service changes.

## Internal draft notification

A composition may hold unfinished input outside the field's main value. Register its validation and dirty contributions, and call `notifyDraftChanged()` whenever that input changes. This closes the gap between the composition's draft and the field/form's validated snapshot. Checks still run only when validation is requested; notification alone does not refresh feedback automatically.

This example belongs inside the setup of a business component that owns the editing session. It illustrates integration hooks, not a built-in composite editor:

```ts
import { onScopeDispose, ref, watch } from 'vue'
import { createUiFieldControl, createUiFormControl } from '@uninterface/uninterface'

const field = createUiFieldControl('')
const form = createUiFormControl({ value: field })
onScopeDispose(() => form.dispose())

const unfinished = ref('')
const removeCheck = field.addCheck(() =>
  unfinished.value ? 'Complete or discard the unfinished input.' : null,
)
const removeDirty = field.trackDraft(() => unfinished.value !== '')
onScopeDispose(() => {
  removeCheck()
  removeDirty()
})

function updateUnfinished(text: string) {
  if (field.state.effectiveDisabled) return
  unfinished.value = text
  field.notifyDraftChanged({ origin: 'user', parts: ['unfinishedText'] })
}

watch(() => form.state.resetRevision, () => {
  unfinished.value = ''
  field.notifyDraftChanged({ origin: 'programmatic', parts: ['unfinishedText'] })
}, { flush: 'sync' })
```

Wire user changes to `updateUnfinished`, also respecting the editor's local disabled/readonly restrictions. The composition decides how unfinished input is completed or discarded. Its normal committed value updates use `field.set(value)`; notify separately only for an additional internal draft change. An unfinished draft blocks validation here, so saving cannot silently omit it. Form reset clears it explicitly; resetting a field does not discover private composition state.

All logical parts contribute to the same field snapshot: `parts` never narrows invalidation or selects which rules run. If external work changes a draft while editing is locked, notify that change anyway so stale results cannot be published. This is not permission to bypass submission locks for user edits.

Observe `field.state.lastDraftChange` for optional origin, logical parts and the core-generated revision. Metadata is copied and immutable, and omission means unknown. Revision and detail are published together, but normal Vue watchers may batch successive changes. This supports current-state reactions and diagnostics, not guaranteed delivery of every event. Other revision changes clear the detail; validation without a draft change retains it.

Verify that changing unfinished input invalidates previous success immediately, clears stale feedback, updates dirty state without changing the main input/baseline, and prevents older asynchronous checks or saves from publishing. Verify reset and owner cleanup, and that explicit validation includes the registered check. See [UiFieldControl](../api/types/UiFieldControl.md#internal-draft-changes) for the complete contract and [UiFieldDraftChange](../api/types/UiFieldDraftChange.md) for metadata.

## Submission owns one pass

Ordinary saving needs only `UiForm` and `form.bindings.submitButton`. Supply the save operation once to the form. There is no need to validate separately or maintain a second busy flag.

Clicking Save directly from an edited field still submits for validation when leaving the field reveals a new inline error. The field's invalid state and accessible description update when validation finishes. The inline message can enter the layout after the click so the pressed button stays in place.

Submission locks editing and reset before validation, awaits its checks, and passes the validated snapshot to save without reparsing or rerunning rules. Submit-button loading covers validation and persistence. Duplicate submits are blocked through both stages. Direct `form.validate()` calls during submission await that submission's pass.

Disposing the form invalidates pending checks and prevents a save that has not yet started. It does not undo a dispatched operation. Reset outside submission invalidates pending checks and restores baselines. Business code owns lifetime and must not bypass submission locks by directly resetting or accepting individual fields.

See [UiFieldControl](../api/types/UiFieldControl.md), [UiFormControl](../api/types/UiFormControl.md), [UiCodec](../api/types/UiCodec.md), and [UiValidationRule](../api/types/UiValidationRule.md) for complete interfaces.

## Validation state and failure presentation

`field.state.valid` means that validation completed successfully for the current draft. It starts false and becomes false when editing, validation begins, the field resets or accepts a baseline, or checks are invalidated. Await validation when business logic needs its result; an empty issue while unchecked or pending is not success. Obsolete async results cannot reestablish validity.

Use `uiValidationFailure('show-below')` within UiStrategy to request failure messages below editors. `show` lets the backend choose, `show-embedded` requests the message inside the editor surface. `show-tooltip` requests an anchored error bubble. The bubble appears when at least 50% of the editor anchor is visible, and scrolling it out of view preserves the invalid state and its accessible description. A popup above its owning modal’s header and footer uses below-field feedback where supported. `none` hides field failure presentation without making invalid data valid or allowing submission; provide an appropriate failure explanation elsewhere in the workflow. Form summaries are independent. Successful validation does not trigger success presentation. See the [strategy guide](strategies.md).

## Submission failures and server field issues

Translate your API's response into [UiFormSubmissionError](../api/classes/UiFormSubmissionError.md) in the business save operation. Use stage `submit` even when the server reports invalid field values: the stage describes when the failure occurred. Use `validate` for failures during pre-submit checks. Either stage can carry a general message and optional field issues.

```ts
import { UiFormSubmissionError } from '@uninterface/uninterface'

async function saveCustomer(value: Customer) {
  const response = await customerApi.save(value)
  // These response properties belong to this application's API.
  if (!response.ok) {
    throw new UiFormSubmissionError({
      stage: 'submit',
      message: response.publicMessage,
      fields: response.emailIssue ? { email: [response.emailIssue] } : {},
    })
  }
  return response.customer
}
```

The form control catches this error, exposes its general message through `state.failure` and assigns recognized field issues. The owning business composition presents that general message. Keys must match the explicit form collection; translate nested API paths yourself. Fields display their first issue while the full error remains on `form.state.error`. Empty/unknown mappings do not mark arbitrary fields invalid. Include a useful general message when no correction target is available. Unexpected exceptions remain on `state.error` with an empty `state.failure`; the composition supplies safe, localized public feedback instead of exposing diagnostic details.

Editing the affected field clears the distributed issue and, by default, reruns local feedback checks. With `revalidateOn: 'validate'`, those checks wait for the next explicit boundary or submission. Revalidation replaces it, and the next submit runs checks and persistence again; clearing an issue does not establish that the server will accept the correction. Reset restores the baseline and clears feedback. A failed save never accepts a baseline. The callback receives a required validated value and may resolve with a result; `form.submit()` returns that exact result without replacing the model automatically. An explicit synchronous `accept(result, submitted)` option (or `UiForm.accept`) selects a complete canonical baseline inside the guarded submission; see [canonical acceptance](../api/types/UiFormControl.md#accepting-a-canonical-save-result). It rejects with local UiFormSubmissionError or the current callback's original error after feedback and availability are updated. Programmatic callers must use `await` and handle failures; UiForm handles native-event rejection. Pending, obsolete and disposed attempts use [UiFormSubmissionStateError](../api/classes/UiFormSubmissionStateError.md).

The form control owns distribution and stale-result protection. Backends retain their normal error presentation, including selected field strategies. UiForm does not render general result messages. The owning business composition chooses delivery and presents whole-form issues explicitly; see [application-owned results](../api/components/UiForm.md#application-owned-results).

For a complete rendered example using these hooks, see the [confirmed email composition](confirmed-email.md), including its value model, focus behavior, reset synchronization and owner cleanup.
