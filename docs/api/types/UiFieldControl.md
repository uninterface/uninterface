# UiFieldControl

`UiFieldControl<T = unknown, D = T>` is the control returned by [createUiFieldControl](../functions/createUiFieldControl.md). `T` is the accepted business value; `D` is the editing representation. Import this type from `@uninterface/uninterface` for custom field compositions.

A form submission may publish the first mapped [UiFormSubmissionError](../classes/UiFormSubmissionError.md) issue onto this field. The field becomes checked and invalid without accepting a baseline. Editing, explicit validation, reset or acceptance replaces that feedback; further server checking happens through the application's next submission.

## Observations

The control maintains one editable business value independently of a rendered editor or an enclosing form. A form can coordinate this same control through its `fields` collection; the field control has no reference back to a form. Labels, instructions, and editor relationships belong to [UiField](../components/UiField.md), while whole-form validation and submission belong to [UiFormControl](UiFormControl.md). Business code owns the field's lifetime and baseline decisions in either setting.

Independence from UiField is a global field-control guarantee. UiField remains the recommended label/help/feedback presentation; without it, a custom view must supply the corresponding accessibility and feedback integration. The control's operations remain available without a mounted view. Direct binding support on a particular editor is a separate API capability, documented on that editor.

| Member | Type | Meaning |
|---|---|---|
| `state.input` | `D` | Current draft representation; use `set()` to edit |
| `state.issue` | `string \| UiMessageDescriptor \| null` | Published first validation issue |
| `state.valid` | `boolean` | Current draft completed validation successfully; false initially, while pending, after edits/reset/acceptance or validation invalidation |
| `state.checked` | `boolean` | Whether validation feedback has been requested |
| `state.validating` | `boolean` | Current feedback-producing parse/check is pending; independent of disabled |
| `state.disabled` | `boolean` | Business-owned editing restriction; applications may change it directly, including during submission |
| `state.effectiveDisabled` | `readonly boolean` | Business restriction OR temporary operation locks; observe this for control-level editing availability |
| `state.revision` | `readonly number` | Core-owned counter; advances on edits, draft notifications, changed parse-and-format drafts, reset/accept/check/tracker changes |
| `state.lastDraftChange` | `(UiFieldDraftChange & { readonly revision: number }) \| undefined` (read-only) | Immutable latest notification for the current revision; initially undefined, cleared by a later revision without notification detail |
| `dirty` | `ComputedRef<boolean>` | Configured inputEquals comparison against the formatted baseline ([uiDefaultInputEquals](../functions/uiDefaultInputEquals.md) by default), or any registered dirty draft |

Read computed refs with `.value` in ordinary TypeScript. Vue template unwrapping depends on where the ref is stored. Direct mutation of input/feedback is not the binding protocol. Custom compositions call `notifyDraftChanged()` after changing internal drafts. The revision is read-only; never manipulate it directly.

## Operations

| Method | Result and behavior |
|---|---|
| `set(input: D): Promise<void>` | Copies the input, increments revision, and, by default, rechecks feedback if checked without formatting input; ignores calls while effectively disabled |
| `notifyDraftChanged(change?: UiFieldDraftChange): void` | Synchronously invalidate prior field/form snapshots and feedback for a changed internal draft; preserve main input, baseline and checked history; no automatic validation |
| `read(): Promise<UiParseResult<T>>` | Parses, runs field rules, then registered checks; does not publish feedback |
| `validate(): Promise<boolean>` | Parses and formats successful input, evaluates rules/checks, marks checked, and publishes its issue or null; preserves input on parse failure |
| `reset(): void` | Restores the formatted baseline, clears checked/issue/valid, increments revision |
| `accept(value: T): void` | Formats/copies a new baseline and draft, clears issue and increments revision; retains checked status but clears valid until validation runs again |
| `addCheck(check: () => string \| UiMessageDescriptor \| null \| Promise<string \| UiMessageDescriptor \| null>): () => void` | Registers a composition check; returns removal callback |
| `trackDraft(isDirty: () => boolean): () => void` | Includes a reactive internal draft in dirty state; returns removal callback |

Submission locks do not write `state.disabled`. Changing that business flag while saving is supported; the effective state stays disabled until every restriction clears. UiField and editor disabled props add local restrictions without changing either control state. Direct `set()` observes control-level restrictions; view-only restrictions apply to that view's interactions.

A field may have one active form coordinator. The form borrows the field and does not acquire its lifetime: first disposal invalidates outstanding feedback work and releases coordination/locks; subsequent disposal is inert. After disposal returns, the field may validate independently or join a new form. It has no disposal method of its own.

Disabled does not exclude a field from validation or, when participating in a form, saving. Field-level reset/accept remain explicit control operations even when disabled; a participating form's reset operation guards pending saves. Do not call field reset/accept to bypass that form policy during submission. Registration/removal of an extra check alone does not publish fresh feedback; validate when appropriate. Dirty callbacks should observe reactive values.

Business compositions must unregister checks/trackers when their participation ends. There is no field disposal method. Unmounting a view does not reset the field. Rendering code must never own these baseline or lifetime choices.

Acceptance is shared with `createUiFieldControl`; custom compositions additionally must account for unfinished internal input, clear it on the business reset signal, and retain accessible labels for individual editing parts.

Explicit validation is a settled editing boundary: successful parsing supplies a business value, formatting replaces the draft with its canonical representation, and rules/checks determine whether it is valid for the task. The revision increments only if formatting changes the draft. This invalidates enclosing form results just like other draft changes. A later rule failure does not undo formatting. Repeating validation of a canonical draft does not increment its revision.

The accepted baseline remains unchanged. Dirty state is recomputed against that baseline; an equivalent canonical draft may become clean, while a changed value stays dirty. Only `accept()` establishes a new baseline. Explicit `validate()` is also used by whole-form validation and submission, including fields whose editing is disabled; automatic checks while typing use the feedback-only path. Invoke explicit validation when editing is ready to settle, not on each input event. Custom composite editors must finish or retain their unfinished draft according to their own editing-boundary contract before validation.


## Internal draft changes

Use `notifyDraftChanged(change?: UiFieldDraftChange): void` when a composition changes unfinished/internal input relevant to this field's checks or dirty tracking without replacing its main input. Ordinary main-input edits use `set(input)`, which already notifies; do not double-notify the same edit. See the [hook example](../../guides/validation.md#internal-draft-notification) and the complete [confirmed email composition](../../guides/confirmed-email.md).

Update the internal draft, then notify synchronously before yielding. Notification advances `state.revision`, invalidates in-flight/cached field snapshots and enclosing form validity, clears the field's obsolete issue and valid/validating state, and preserves checked history. Dirty trackers are reevaluated through revision observation; dirty follows actual draft/baseline differences, not notification alone. It does not parse, format, validate, accept, reset, persist or cancel transport. Call `validate()` explicitly at the composition's settled editing boundary when new feedback is needed.

The composition must enforce effective control availability and local view restrictions before accepting user edits. Notification reports a change that already happened: it is processed even while disabled or submission-locked. A notification during a pending submission makes the old snapshot obsolete; it cannot authorize editing or undo a dispatched save.

Optional [UiFieldDraftChange](UiFieldDraftChange.md) metadata identifies the initiating origin and logical parts. All notifications invalidate the entire field, regardless of parts. Core copies and freezes the metadata and parts, attaches its own revision, and publishes `state.lastDraftChange` with that revision in one update. No arguments produces `{ revision }`; unknown origin stays unspecified, and empty parts are treated as unspecified.

`lastDraftChange` is a read-only latest-change observation. Vue watchers may batch notifications; it is not an event queue or audit log. A later revision without notification detail clears it, including set/reset/accept, changed normalization, and check/tracker registration/removal. Validation that leaves the draft revision unchanged retains it. Baseline and field lifetime are unaffected by observing metadata.

## Asynchronous completion

`set()` updates the draft immediately unless effectively disabled; await its promise when automatic feedback completion matters. If checked and `revalidateOn` is `change` (the default), it awaits a feedback-only parse/check without formatting. With `revalidateOn: 'validate'`, it performs no parsing/rules/checks; the next explicit validation or submission checks the draft. See [field options](UiFieldControlOptions.md). Explicit `validate()` always returns a promise, even with synchronous callbacks. It sets checked/validating and clears the old issue while working. The latest current result publishes feedback and sets valid from its outcome; `false` means invalid or superseded, never permission to proceed.

Edits, internal draft notifications, reset, baseline adoption, and check/tracker registration changes invalidate pending feedback. Older completions cannot rewrite input, publish an issue, or clear a newer check's pending state. Matching concurrent explicit checks can share a pass; a fresh check after completion evaluates again. An obsolete operation can still consume resources until its promise settles; no network cancellation is implied.

`read()` takes an input snapshot, awaits parsing/rules/checks, and returns its result without normalization, feedback, or pending-state changes. Its result describes that captured input, which may no longer be current after awaiting. For a current validity decision use `validate()`; for saving use the form's coordinated `submit()`.

Current callback exceptions/rejections propagate to the caller and clear validating; they are not converted into user-input issues. A failed feedback check clears checked status. Obsolete feedback failures are ignored. Vue event handlers return the promises so current failures reach Vue's error handling. Code that calls these methods directly must await or handle them.

Form coordination uses controls created by `createUiFieldControl` and internally retains their validated snapshots. There is no public cached-value property and no need to parse again to submit.

Validation and codec issues may be literal strings or [UiMessageDescriptor](UiMessageDescriptor.md) objects. Views resolve descriptors against application resources so existing feedback changes language without revalidation. Literal strings remain unchanged.

A composition check may await validation of a distinct, privately owned draft control to include its result and publish that control's feedback. It must not mutate the checked field's input/baseline, recursively validate the same field, or create cyclic checks. A private draft change during checking must still notify and supersede the outer pass; do not bypass stale-result protection to force success. The [confirmed email example](../../guides/confirmed-email.md) uses an identity codec for its private draft, so delegated validation does not rewrite that draft.
