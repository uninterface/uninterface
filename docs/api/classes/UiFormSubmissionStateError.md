# UiFormSubmissionStateError

Import from `@uninterface/uninterface` to distinguish a form-session state restriction from a validation or business-operation failure. The form control creates this error when it cannot start or accept completion of a submission. Applications normally catch it rather than construct it.

```ts
class UiFormSubmissionStateError extends Error {
  constructor(reason: 'pending' | 'obsolete' | 'disposed', options?: ErrorOptions)
  readonly reason: 'pending' | 'obsolete' | 'disposed'
}
```

This class extends standard `Error`, sets `name` to `'UiFormSubmissionStateError'`, and supports standard cause/stack diagnostics. Its message is diagnostic text, not localized public feedback.

| Reason | Meaning |
|---|---|
| `pending` | Another submission already owns this control. This attempt does not validate or invoke the callback, change feedback, or release the active attempt's locks. |
| `obsolete` | Validation or a dispatched callback completed against an obsolete snapshot. Its result cannot authorize a save, publish feedback, or establish a baseline. |
| `disposed` | The control was disposed before the request or while work was pending. No new callback is dispatched after disposal and no late feedback/baseline is accepted. |

An obsolete or disposed attempt may already have dispatched the business operation. Rejection does not cancel a request or undo external effects. If an obsolete callback rejects, the state error retains that rejection as `cause`; current callback failures instead propagate unchanged.

```ts
try {
  const saved = await form.submit(saveCustomer)
  openCustomer(saved.id)
} catch (error) {
  if (error instanceof UiFormSubmissionStateError) return
  // Apply application handling for public or unexpected failures.
  throw error
}
```

Core owns lifecycle checks and lock cleanup. Core-generated lifecycle rejections do not replace an active attempt's feedback or mark fields invalid. [UiForm](../components/UiForm.md) consumes them at its native-event boundary; programmatic callers must await or handle rejection. Backends do not interpret them. Public validation and business failures use [UiFormSubmissionError](UiFormSubmissionError.md).

Verification: a duplicate rejects with `pending` while the first attempt remains locked; obsolete success cannot replace a newer baseline; late rejection retains its cause without publishing field issues; disposal blocks new calls and suppresses late feedback.
