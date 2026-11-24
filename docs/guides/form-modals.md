# Form-integrated modals

Use this pattern for a focused create/edit task that should return the user to the collection or detail view they came from. The business component owns the editing workflow and supplies typed results. UiModal supplies the interaction boundary, while UiForm supplies the native form and connects the editing session to persistence. A dedicated page is also appropriate when the task needs its own navigation, long-lived context or several independent work areas.

This is an implemented composition pattern, demonstrated by Editor → Invoices and Examples → Collections. It requires no special form-modal component, backend CSS or additional form manager. For modal lifecycle details, see [awaitable modal interactions](modals.md); for encapsulating fields and controls, see [business components](business-components.md).

## Give the consumer a business operation

Package the dialog and form behind typed initial data and a save operation. For example, an application-owned InvoiceEditorDialog exposes `run(initialValue, save)` and returns a UiModalResult. Its ordinary caller does not construct field controls, duplicate validation rules or arrange the dialog's buttons.

| Owner | Responsibilities |
|---|---|
| Calling business feature | Choose the record, supply persistence, and route accepted changes to the correct collection/detail state |
| Editor composition | Own the draft, fields/codecs, validation, save-result feedback, dirty-close policy and session cleanup |
| UiForm and its control | Execute the native submit path, validate, coordinate pending state and accept successful values |
| UiModal and its backend | Present the modal, consult close policy, preserve modality, arrange body/actions and manage focus/scrolling |

Usually create a fresh form session for each modal run. Ordinary prop updates must not overwrite a live draft. Reopening starts from the latest accepted record. Retain a session outside the view only when the business workflow explicitly requires that lifetime, and document who eventually disposes it.

## Put completion actions together

Use the modal title to identify the task, the body for fields and feedback, and `#actions` for the completion actions. Start with **Save and Cancel together in the footer**. Suppress any duplicate Save action inside a reusable form's body. The backend keeps the footer outside the body scrollport and handles alignment, wrapping and RTL.

Do not add Reset simply because the form control supports it. Add it only when restoring the current editing baseline is a deliberate business requirement. The Invoice and Collections examples offer Save and Cancel only; underlying form reset support remains available for other workflows. Local actions such as Add line, Remove or an input's Clear action stay with the content they affect.

The following template excerpt assumes the owning component has created `form`, `modal`, a document-unique `formId`, and its typed `saveCustomer` operation for the current run. Labels are literal for readability; use the application's localized messages in production.

```vue
<UiModal :control="modal" title="Edit customer">
  <UiForm
    :id="formId"
    :control="form"
    :save="saveCustomer"
    :accept="result => result"
    label="Customer editor"
  >
    <UiField :field="form.fields.name" label="Name" required>
      <UiTextInput />
    </UiField>
    <!-- Application-owned validation/save feedback belongs here. -->
  </UiForm>

  <template #actions="{ session }">
    <UiButton
      :form="formId"
      :binding="form.bindings.submitButton"
      color="primary"
    >Save</UiButton>
    <UiButton
      :disabled="form.state.pending"
      @click="session.cancel()"
    >Cancel</UiButton>
  </template>
</UiModal>
```

In this excerpt, `saveCustomer` returns the canonical field-value object. Use an acceptance mapper appropriate to the service's actual return type; a save returning void must not use `result => result` as its canonical value mapping. The explicit `accept` mapper selects the canonical baseline and takes precedence over `acceptOnSave`. Without a mapper, `acceptOnSave: true` accepts the submitted values; it does not automatically adopt the service response.

Generate `formId` once for the owned form instance, for example with Vue `useId()`. The footer button's `form` attribute associates it with that native form even though it is outside the form's DOM subtree. Its submit binding supplies type, loading and availability. Do not combine this binding with an `@click` call to submit or a second persistence callback. That would create competing submission routes. See [external form actions](control-bindings.md#external-form-actions).

A reusable form may own its session while its enclosing dialog owns the footer. The pair can share a narrow internal interface: form ID, submit-button binding, pending/dirty observations, field-focus request and accepted-save event. The dialog uses these to arrange actions and evaluate closure; it does not reconstruct the form or take over its controls. `InvoiceEditorForm` and `OrderEditorForm` demonstrate this through their application-specific `externalActions` option and exposed members. Those names are not additional Uninterface APIs or requirements for every business component.

## Treat saving and closing as one workflow

Define the outcomes before wiring the buttons:

| Event | Recommended behavior |
|---|---|
| Invalid submission | Keep the modal and draft; show feedback and focus the relevant invalid editor |
| Save pending | Let the submit binding show activity and prevent duplicate submission; disable Cancel and deny dismissal through the close policy |
| Save fails | Keep the same draft and modal, show application-owned feedback, and allow retry |
| Save succeeds | Accept canonical values, then complete the modal with the accepted business value |
| Cancel on a clean draft | Close without a discard prompt |
| Cancel on a dirty draft | Offer Keep editing or Discard; preserve the exact draft when editing continues |
| View/owner is removed | Release the session and prevent late callbacks from publishing into a later run |

UiModal does not infer completion from a form's save. The editor composition observes successful acceptance and calls the current modal session's `complete(value)` exactly once. An emitted `saved` event must carry accepted values after that acceptance, rather than the raw input or an optimistic copy. Decide which owner publishes the result to the collection so the same save is not applied twice. A failed save is a recoverable editor outcome; it should not automatically terminate the modal with `session.fail()`.

Apply closing policy in `beforeClose`, so Cancel, Escape, the close button and any enabled backdrop route follow the same rules. A typical policy is:

```ts
async beforeClose(request) {
  if (request.status === 'completed') return true
  if (form.state.pending) return false
  if (!form.dirty.value) return true
  const decision = await discardConfirmation.run()
  if (decision.status === 'error') throw decision.error
  return decision.status === 'completed' && decision.value
}
```

Here `discardConfirmation` is another declared modal control whose completion value is boolean. Completion is allowed because the composition requests it only after successful acceptance. Forced teardown and terminal modal failure cannot be vetoed; they do not imply rollback of already dispatched persistence. Keep asynchronous callbacks tied to the run that created them, with cleanup at that run's endpoint.

## Preserve usable focus and space

Request initial editor focus from the modal's `opened` hook, after the form is mounted. If the user has already moved focus to an editor or an action during entry motion, preserve that focus. Keep the invoking collection action mounted and enabled through modal cleanup so focus can return to it. Use an internal duplicate-open guard while modality blocks the background; disabling the opener until the awaited run returns is too late for focus restoration.

By default, use document-flow layouts in the modal body and let that body own vertical scrolling. For an editor with persistent supporting content and a scrollable line table, explicitly choose `UiModal bodyScroll="content"`, `UiForm height="full"`, and a full-height layout allocating the table its remaining space. The table receives `height="full"`; short invoices remain naturally sized and long ones scroll their rows, with summary/Add and modal Save/Cancel reachable. Keep the body overflow fallback for viewports too short to fit fixed regions. See [content-owned modal scrolling](../api/components/UiModal.md#content-owned-scrolling). Choose a preferred width appropriate to the fields, such as 32rem for a small record or 52rem for the invoice line table, and use available width on mobile when appropriate. UiModal applies the viewport cap. Any horizontal scrolling inside an editor remains an explicit decision for that content. See [modal sizing](../contracts/modal-sizing.md).

Keep submission activity on the bound action and the form's normal availability state. Data-loading masks serve a separate operation; use a loading-capable container when asynchronously replacing a section's data. See [loading ownership](loading.md).

## Observable acceptance

- Save and Cancel occupy one modal footer; there is no duplicate body Save or unintended Reset. Fields and local collection actions remain in the body.
- The rendered Save button's native `form` property points to the intended form. Opening a second editor or reopening one does not create duplicate IDs or stale associations.
- Clicking Save and native keyboard submission use the same form path. Invalid input prevents persistence; repeated submission while pending saves once.
- Failure/retry keeps the same draft. Successful canonical acceptance closes once and updates the correct record.
- Every enabled dismissal route obeys dirty and pending policy. Keep editing retains raw unfinished input; Discard leaves persisted data unchanged.
- Long content and narrow screens keep footer actions reachable. Check wrapping, localized labels, Tab order, initial focus, nested confirmation and return focus.
- Removing the owner during save cannot publish into a new editor session; cleanup releases the form and modal resources.

The two demo workflows have DOM coverage across supporting backends for native association, shared footer placement, validation, pending behavior, failure/retry and dirty dismissal. Browser geometry and assistive-technology acceptance require separate verification on the selected backend. Use the checklist above; do not infer visual conformance from DOM assertions.

At very short viewport heights, verify the backend's overflow fallback. Retaining a usable editing area can require body scrolling when fixed supporting regions would otherwise leave no operable rows. Completion actions remain in the modal footer; do not hide or overlap row controls to preserve pinning.
