# createUiFormControl

Creates a UI editing session over named fields. The business chooses the field set, cross-field rules, persistence, lifetime, and whether success establishes a new editing baseline.

A reusable business component can create this control internally and accept typed initial data and a save operation from its consumer. Business ownership does not require creation in the application's root component. Use an external business owner when a session must outlive its views; see the [business component guide](../../guides/business-components.md).

```ts
import { createUiFieldControl, createUiFormControl } from '@uninterface/uninterface'
const form = createUiFormControl({ name: createUiFieldControl('Ada'), enabled: createUiFieldControl(true) }, {
  acceptOnSave: true,
})
try {
  const saved = await form.submit(value => repository.save(value))
  // Use the application's saved result as appropriate.
} catch (error) {
  // Feedback has been updated; handle application-specific recovery here.
}
// Call when the business-owned editing session ends:
form.dispose()
```

```ts
createUiFormControl<T extends Record<string, any>>(
  fields: { [K in keyof T]: UiFieldControl<T[K], any> },
  options?: { rules?: UiValidationRule<T>[]; acceptOnSave?: boolean },
)
```

`fields` contains controls created by `createUiFieldControl` and is the stable named collection used by this session; dynamic addition/removal is not implemented. Fields may have different draft representations. `rules` defaults to `[]` and checks the full parsed model only after field validation succeeds. `acceptOnSave` defaults to `false`; explicitly choose `true` to adopt the submitted snapshot after success. A per-submission `accept(result, submitted)` mapper explicitly adopts a complete canonical model instead; see [canonical acceptance](../types/UiFormControl.md#accepting-a-canonical-save-result). The inferred return preserves field keys; [UiFormControl](../types/UiFormControl.md) documents every member.

The returned `control.bindings.submitButton` and `control.bindings.resetButton` are stable, read-only [UiButtonBinding](../types/UiButtonBinding.md) projections for use inside a matching `UiForm`. They derive their properties from this control without another lifecycle owner; submit shows pending activity, reset only becomes unavailable. Disposing the control leaves both unavailable.

The returned `control.fields` exposes the supplied collection of existing field controls. For example, if `amount` is passed as `{ amount }`, then `control.fields.amount === amount`. The form coordinates those controls; it does not create replacement controls or discover fields by inspecting the rendered component tree. A field control also supports independent use without form participation.

Each field can participate in at most one undisposed form. Duplicate field identities (including reactive proxies of the same control) and participation in another form throw at construction. All candidates are checked before any claims are installed; a failed construction releases any effects and claims it created. Multiple views may borrow the same coordinated session. Separate controls may edit the same business record under application policy.

Creation starts revision watchers in an internal detached Vue effect scope. Stopping the calling scope or unmounting a borrowing view does not stop coordination. Business code must explicitly dispose the session when finished; register cleanup with the actual owner, using the [cleanup patterns](../../guides/business-components.md#reliable-owner-cleanup). Disposal stops internal effects and releases participation and submission locks immediately. Fields remain independently usable and can join another form after disposal returns. Repeated disposal and old async completions cannot invalidate a replacement session. No operation cancels an already dispatched business save.

Whole-form validation calls each field’s explicit validation, applying parse-and-format even if no input blur occurred. It evaluates form rules against the resulting business values. Submission uses those values without adopting a baseline unless `acceptOnSave` is enabled or a per-submission `accept` mapper is supplied, and saving succeeds. Parse failures retain their raw drafts; normalized drafts remain normalized after a failed save, with reset still targeting the existing baseline.

For normal saving, call `submit(save)` or use `UiForm` with a submit button; validation is included. Await `validate(): Promise<boolean>` separately when a business transition needs a check without persistence. See [programmatic validation](../types/UiFormControl.md#using-validate-without-submitting) for a step-transition example, field participation, feedback and normalization effects, focus responsibility, and errors.

Core owns validation and submission state; the backend neither supplies a competing form manager nor owns persistence. The application callback receives a copied accepted model and may resolve with a result or reject on failure. `submit<R>(onSubmit: (value: T) => Promise<R>, options?: { accept?: (result: R, submitted: T) => T }): Promise<R>` returns its exact result and rejects on failure. Programmatic callers must await or handle rejection. UiForm handles rejection at its native-event boundary. Returned results do not automatically replace the model or establish a server-returned baseline. Use [UiFormSubmissionError](../classes/UiFormSubmissionError.md) to report public messages and named field issues; translate the application's API response at that boundary. No backend configuration or rendered form is needed to operate the control.

Acceptance: complete models validate before saving; pending requests dispatch once; failures retain drafts/baselines; reset restores the explicit baseline; success adoption is opt-in; disposal rejects new operations and prevents late baseline adoption. See [UiFormControl](../types/UiFormControl.md) for exact limits.
