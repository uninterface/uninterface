# UiFormSubmissionError

Use this error when a validation or save operation needs to report a user-facing failure, optionally associated with named fields. Import it from `@uninterface/uninterface`. The application translates its API responses into this shape; Uninterface does not prescribe an HTTP response format.

```ts
import { UiFormSubmissionError } from '@uninterface/uninterface'

throw new UiFormSubmissionError({
  stage: 'submit',
  message: 'Please correct the highlighted fields.',
  fields: { email: ['This email address is already registered.'] },
  cause: originalError,
})
```

## Constructor and properties

```ts
class UiFormSubmissionError extends Error {
  constructor(options: {
    stage: 'validate' | 'submit'
    message: string
    fields?: Readonly<Record<string, readonly (string | UiMessageDescriptor)[]>>
    cause?: unknown
  })
  readonly stage: 'validate' | 'submit'
  readonly fields: Readonly<Record<string, readonly (string | UiMessageDescriptor)[]>>
}
```

The class extends standard `Error`, sets `name` to `'UiFormSubmissionError'`, and supports standard `message`, `cause` and stack diagnostics. `stage` and `fields` are read-only properties. Field mappings and issue arrays are copied and frozen; omitted fields become an empty mapping.

| Input | Meaning |
|---|---|
| `stage: 'validate'` | Failure during checks before invoking the submit operation |
| `stage: 'submit'` | Failure from the submit operation, including server-returned validation errors |
| `message` | Public message data. An empty string supplies no general message; the business composition chooses any fallback |
| `fields` | Optional issues keyed by the exact names in the form control's explicit collection |
| `cause` | Original diagnostic cause; never rendered automatically |

Stage identifies the phase, not the failure's category or origin. Either stage may include field issues or only a general message. A server rejecting an email uses `submit`; a service outage also uses `submit`, usually without fields. The form preserves the declared stage.

Field keys are literal collection keys, not dotted paths into nested models. Map API paths at the application boundary. Empty issue arrays do not invalidate a field. Unknown keys remain in the error for application inspection but are not assigned to another field or automatically shown as whole-form issues; supply an adequate general message. Messages must be safe public text. General messages are literal strings; field issues may also use [UiMessageDescriptor](../types/UiMessageDescriptor.md) for reactive localization.

## Form handling and ownership

[UiFormControl.submit()](../types/UiFormControl.md#submission-and-lifetime) catches this error, retains it in `state.error`, exposes its general message through `state.failure`, and distributes the first issue of each recognized field to its existing feedback. All additional issues remain available on `error.fields`. Recognized nonempty field issues mark the form invalid, allowing UiForm's existing invalid-focus behavior. General-only failures do not invent field invalidity. The control then rejects with the same error instance, after restoring availability. UiForm handles that rejection for native submit events; programmatic callers use `try`/`catch`.

Ordinary invalid codec/rule results do not need to throw. At the submission boundary the form rejects with a `validate`-stage error retained in `state.error`, with an empty message and the current field issues. Whole-form rule messages remain in `state.issues`. The outcome remains `invalid`. An exception from a codec, rule or submission callback produces outcome `failed`, regardless of stage. Direct field/form validation keeps its existing result/rejection contract.

Editing a field clears its distributed issue and refreshes local validation; reset, acceptance and revalidation also replace its feedback. Form edits, reset, the next submission, or a new standalone form validation clear the retained submission error. An unchanged field's issue remains until that field is rechecked or reset. Results from obsolete or disposed submissions cannot publish field errors or accept a baseline; those attempts reject with [UiFormSubmissionStateError](UiFormSubmissionStateError.md).

Current unexpected exceptions are retained as-is in `state.error` and propagated unchanged to the programmatic caller, use generic localized failure feedback, and do not automatically mark fields invalid. Do not display their raw messages or causes as public feedback.

Core owns catch/distribution and lifecycle protection. Backends use existing field invalidity and descriptions; they do not interpret API responses. UiForm renders no general result feedback. The business composition chooses delivery from control state; see [application-owned results](../components/UiForm.md#application-owned-results).

## Observable verification

- A submit-stage server validation error retains its public message and displays the recognized field's first issue, prevents baseline adoption, and retains the full error and cause.
- A general service failure leaves valid fields unmarked and allows a retry after pending ends.
- Editing, rechecking and reset replace obsolete issues; late failures after a changed snapshot or disposal cannot overwrite current state.
- Local invalid results prevent the save callback and expose a validate-stage error without requiring rules to throw.
