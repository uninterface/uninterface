# UiForm

Connects an editing session to a business save operation. The business supplies a [form control](../types/UiFormControl.md), an accessible name, and persistence. Uninterface coordinates validation, pending state and focus after invalid submission; the backend renders the form.

```vue
<UiForm :control="form" :save="saveRecord" label="Customer editor">
  <UiField :field="form.fields.name" label="Name" required><UiTextInput /></UiField>
  <UiButton
    :binding="form.bindings.submitButton"
    color="primary"
    variant="filled"
  >Save</UiButton>
  <UiButton
    :binding="form.bindings.resetButton"
    color="danger"
    variant="outline"
  >Reset</UiButton>
</UiForm>
```

Import from `@uninterface/uninterface`, in an application initialized with `createUiApplication`.

| Prop | Type | Required | Meaning |
|---|---|---|---|
| `id` | `string` | No | Native form ID; generated when omitted. Supply a document-unique, nonempty ID without whitespace when external buttons target this form |
| `control` | `UiFormControl` | Yes | Business-owned editing session |
| `save` | `(value: any) => Promise<unknown>` | Yes | Receives parsed, valid, copied values; rejects on failure |
| `accept` | `(result: any, submitted: any) => Record<string, any>` | No | Pure synchronous mapper selecting a complete canonical reset baseline after successful save |
| `focusInvalid` | `() => Promise<boolean>` | No | Optional composed-field reveal/focus; true handles recovery, false permits the normal fallback for a still-current invalid result |
| `height` | `'content' \| 'full'` | No | Default content; full passes the bounded parent allocation to one authored layout |
| `label` | `string` | Yes | Accessible form name |

The default slot contains fields and actions. No public emitted events or instance methods. The save callback is the submission integration point. The present component boundary has erased model typing; use the inferred `createUiFormControl<T>` control and a typed application save function for application code. Do not nest forms.

For a modal-hosted editor, follow [form-integrated modals](../../guides/form-modals.md): place Save and Cancel in one modal footer and associate Save with the body form. Reset remains available when the business task calls for it.

## Behavior and responsibilities

A submit request awaits `control.submit(save, { accept })`. It checks fields and whole-form rules, prevents duplicate pending requests, and locks fields/reset during the save. Backend validation engines are not used. Invalid submissions first await optional `focusInvalid` recovery; when it is absent or returns false and the failure is still current, they ask the backend to focus the first invalid field or composite group; if only form-level issues exist, it focuses the named form. Text blur/discrete-change validation belongs to the shared input components, not the backend.

Use `control.bindings.submitButton` and `control.bindings.resetButton` on descendant buttons to connect activity and availability once. UiForm supplies their matching logical host and native event route; the button does not inspect the form control. Keep bound buttons inside this form in both Vue and rendered structure, or give UiForm an explicit `id` and external buttons the same `form` value. External buttons must belong to the same Vue application and native document/tree scope. A missing host disables them; a host belonging to another control is rejected. Unmounting or changing the form ID releases the association. Multiple views of one control use different IDs. Native reset is intercepted and calls `control.reset()`, including its pending guard and accepted-baseline behavior.

The save callback is not invoked when validation fails. An ordinary form needs no separate validation action. For a business transition that checks without saving, the owning composition may await [control.validate()](../types/UiFormControl.md#using-validate-without-submitting); that direct operation publishes validation but does not invoke this component's submission focus handling.

A thrown [UiFormSubmissionError](../classes/UiFormSubmissionError.md) supplies a public message and optional field issues. The control retains the public message in `state.failure`, the original error in `state.error`, and distributes recognized field issues. UiForm does not display the general message or unexpected exception details. The native-event handler consumes success values and catches rejections after the control updates state; programmatic callers receive the result or rejection. Lifecycle state rejections do not create user-facing failures. On success, baseline adoption follows the optional `accept` mapper, otherwise `acceptOnSave`. The mapper must return a complete authoritative model without changing controls or starting persistence. See [canonical acceptance](../types/UiFormControl.md#accepting-a-canonical-save-result). The business owns control lifetime and must call `dispose()` when done.

The backend supplies accessible form naming, submit/reset semantics, suppression of competing native validation, busy state and invalid-field focus. There is no feedback slot, result presenter or notice capability requirement.

The form itself becomes programmatically focusable only when submission needs it as a fallback. It retains a visible focus indicator consistent with the backend while focused, then removes its temporary focusability on blur. Ordinary pointer interaction with empty form space must not focus the form. Invalid editors remain the preferred focus destination.

## Application-owned results

UiForm renders only its default slot. The owning business composition chooses whether, where and how to present outcomes: an inline UiNotice, a toast or a message in a hosting view. There is no automatic success, failure, validation summary or activity paragraph. Field-level validation remains with UiField.

Observe `control.state.outcome`, `failure`, `issues`, `pending` and `validating`. Whole-form rule issues must be presented by the composition because they have no individual field destination. Render descriptors with `useUiI18n().text`. Use a safe application message when `failure` is empty; do not display raw `state.error` details. A simple failure notice can be composed independently:

```vue
<UiNotice
  v-if="!form.state.pending && form.state.outcome === 'failed'"
  kind="error"
  announcement="polite"
>
  {{ form.state.failure || 'The customer could not be saved. Please try again.' }}
</UiNotice>
```

An application-owned reusable component may encapsulate this policy. It should suppress outdated results during a new operation, distinguish validation from persistence, and render whole-form issues when applicable. Success dismissal is presentation state: never reset the form or change its outcome to hide a notice. Reset dismissal for a new operation/control, preserve it across language changes, and restore focus through an explicit destination (for example, a UiButton ref's `focus()`). Error lifetime, announcements and duplicate delivery are the composition's responsibility. UiForm neither assumes a modal host nor closes one. Check announcements and focus in a browser for the chosen delivery composition.

## Acceptance

Invalid values prevent save and receive feedback/focus; a valid submit calls save once; pending edits and repeated submits cannot change the operation; failures retain the draft; reset and success follow business baseline policy. The same scenario applies to every backend. Real-browser focus/live-region and assistive-technology verification remain necessary.

The backend owns consistent field spacing and label/help/error arrangement. Its presentation policy must not require business code to tune per-field margins or compensate for toolkit markup. Concrete layout and styling choices belong in the backend's documentation.

The form exposes busy state during validation and submission, including standalone form validation. Bound submit buttons show submission activity. There is no separate form-wide “Saving…”/“Checking…” text or successful-validation paragraph. Field-level validation feedback is unchanged. Backend views never schedule validation themselves.


For hidden collection fields, use [editable-collection recovery](../../guides/editable-collections.md#revealing-an-invalid-child). The callback belongs to the owning business view and must await revealing/rendering before focusing. Control changes and unmount prevent obsolete fallback focus.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

## Full-height form layout

`height="full"` makes the form an allocation boundary for one explicit layout root, for example a `UiLayout height="full"` with content-sized Reference, a remaining-space line table and supporting feedback/actions. It changes allocation, not validation, field ownership, native submission or styling. Requires `form.height.v1`.

The host must provide a bounded offer, such as a modal with `bodyScroll="content"`. The form does not invent viewport height, inspect arbitrary descendants or allocate multiple direct children as fields. Keep default content height for ordinary document-flow forms. The author owns the layout's scrolling decision and ensures supporting regions/actions remain reachable. Verify form association, invalid focus, pending locks, retained drafts and long-row scrolling; native geometry requires a browser.
