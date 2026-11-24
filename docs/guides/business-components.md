# Authoring and consuming business components

A business component packages a meaningful task or arrangement, such as editing a record or arranging a modal's header, scrollable content, and footer. Its consumer supplies the facts and operations needed for that task. The component author composes Uninterface primitives and controls to fulfill the task's contract.

Both roles are business-side development. Keeping business ownership does not require putting every field definition or control in the outermost application component.

## Give consumers a task-level interface

A record editor's ordinary consumer should be able to write:

```vue
<RecordEditorForm
  :initial-value="record"
  :save="saveRecord"
/>
```

`RecordEditorForm` is an application-defined component, not an export from `@uninterface/uninterface`. In the reference example its interface is:

```ts
interface RecordValue {
  name: string
  reference: string // Optional input; an empty string is valid.
  amount: number // Nonnegative safe integer cents, in USD.
  enabled: boolean
  category: string // supplies, services, or equipment for a valid record.
  delivery: 10 | 20 | undefined // required before save: post or collection.
  permissions: number[] // stable permission IDs; membership has no order.
  channels: number[] // notification channel IDs in this record.
  decision: boolean | null // approval, with null meaning undecided.
}

interface RecordEditorFormProps {
  initialValue: RecordValue
  save: (value: RecordValue) => Promise<void>
}
```

The consumer supplies data in the agreed business representation. Amount is integer cents, not the decimal text being edited. It supplies a save operation that resolves on success and rejects on failure. A component cannot infer persistence from a data object alone; other workflows may instead define a typed completion event or live model binding.

In this example, notification channel IDs are `1` for email, `2` for text message and `3` for postal delivery. For example, supply `channels: [1]` to initialize the record with email selected. Postal delivery remains visible as an unavailable choice. The component translates the numeric IDs into picker keys and back when saving.

| Owner | Responsibility |
|---|---|
| Consumer | Load the record, supply persistence, apply successful saves to application data, decide when to start or end an editing session |
| Business component | Select fields and codecs, attach domain rules, supply labels/options, create and dispose controls, compose inputs/actions, define draft/reset/save policy |
| Uninterface control layer | Maintain editing state, parse and validate values, coordinate pending operations and feedback under the selected policy |
| Backend | Present the shared semantics and state, realize accessible interactions, and report user actions |

Codecs and domain rules can live in reusable business modules. The component selects and connects them so its consumer need not know the field keys, input representations, or validation plumbing. Domain rules that also apply on the server should remain enforceable there; UI validation is not a substitute for persistence-side enforcement.

## Create the control at the session boundary

For a client component whose mounted lifetime is its editing session, create controls once during setup and dispose the form on unmount. The following excerpt illustrates the setup for one field. The reference form also defines fields for reference, amount, enabled, category, delivery, permissions, notification channels and approval.

```ts
import { onUnmounted } from 'vue'
import { createUiFieldControl, createUiFormControl } from '@uninterface/uninterface'

const props = defineProps<{
  initialValue: { name: string }
  save: (value: { name: string }) => Promise<void>
}>()

const control = createUiFormControl(
  {
    name: createUiFieldControl(props.initialValue.name, undefined, [
      value => value.trim() ? null : 'Name is required.',
    ]),
  },
  { acceptOnSave: true },
)

onUnmounted(() => control.dispose())
```

Inside that component, pass `control` and `props.save` to [UiForm](../api/components/UiForm.md), and bind the individual controls through [UiField](../api/components/UiField.md). Keep dirty indicators, validation feedback, and reset actions with the editing workflow. Use `control.bindings.submitButton` and `control.bindings.resetButton` to connect button roles, loading, and availability once; see [control bindings](control-bindings.md). The consumer does not need access to the whole control merely to display the form. UiForm supplies no automatic result messages. This business component explicitly owns save-result notices or other delivery, including whole-form rule issues, safe error wording, announcements and dismissal. See [application-owned results](../api/components/UiForm.md#application-owned-results).

Use [UiLayout](../api/components/UiLayout.md) for arrangement and responsive allocation. Ordinary HTML remains suitable for content such as a heading. Avoid backend classes, concrete spacing, or toolkit validation managers in the business component. Presentation changes must preserve its editing session.

## State the model and save policy

The example `RecordEditorForm` defines these guarantees:

- `initialValue` initializes an isolated draft once per mount. Editing never mutates the supplied object.
- A later mutation or replacement of `initialValue` does not overwrite the draft or change its reset baseline. There is no prop watcher that implicitly reloads the form.
- Name is trimmed and required; category must be one of the available nonempty options; enabled is boolean. Its amount field uses the [numeric codec](number-and-money.md) with a fixed formatting locale, nonnegative values and scale 2 to edit USD cents. Excess precision rounds to the nearest cent.
- Delivery radio keys map to numeric business codes; checkbox membership maps to numeric permission IDs with set-style dirty comparison. Approval maps the raw indeterminate sentinel to null. The approval checkbox uses `tristate cycle-indeterminate` to edit all three values directly. The component exposes no approval helper or field controls; its consumers supply business data and save operations. All participate in the same save/reset session.
- Save validates and normalizes before calling the supplied operation with a copied business value. Invalid input prevents persistence. Input text and field-control objects do not escape through that callback.
- Pending save disables editing/reset and prevents duplicate submission. Rejection retains the draft and baseline and presents the error. Resolution establishes the submitted value as the reset baseline.
- Reset restores the initial value until the first successful save, and the most recently accepted value afterward.
- Unmount disposes the editing control. It does not cancel an application save already in progress. Late completion cannot establish a baseline in a new component instance.

These are policies of this business component, not mandatory defaults for all forms. In particular, `acceptOnSave` is explicitly enabled. This example callback returns no replacement model. When the service returns canonical data, the composition can supply `UiForm.accept` or the typed `form.submit(save, { accept })` mapper; see [canonical save acceptance](../api/types/UiFormControl.md#accepting-a-canonical-save-result).

An ordinary form's submit action includes validation and rejects invalid input before calling persistence. A separate validation action is unnecessary. When a business workflow needs a check without persistence, such as continuing to a review step, the owning business component can use [await validate()](../api/types/UiFormControl.md#using-validate-without-submitting). It publishes feedback and may normalize drafts; it does not save or move focus. Keep this operation inside the composition unless its consumer has a documented need to request such a transition.

Use a deliberate new session when switching records. For example, a consumer can render `:key="editingSessionId"` and change that key together with the new `initialValue`. Resolve unsaved-change and pending-operation policy before discarding the session. Do not key the component by the entire model or a value that changes on every edit or save. Keeping the key stable when the saved record updates avoids resetting the active component.

Changing a key does not cancel persistence or stop the consumer's callback from updating application data. The consumer remains responsible for routing asynchronous results to the correct record.

Server rendering does not invoke component unmount hooks. A server-rendered editing session needs an explicit request owner and cleanup in `finally`; see [application isolation](application-isolation.md).

## Lift ownership only when the workflow needs it

Externally owned controls are useful when an editing session must survive removal of its view, span several views, or participate in a larger workflow. In that case, retain the session with its business owner and dispose it at the business-defined endpoint. Forms own their internal watcher scopes, so stopping the scope where a form happened to be created does not stop its coordination. A borrowing view must not register disposal of the shared session. See [createUiFormControl](../api/functions/createUiFormControl.md) for participation and disposal obligations.

Even then, a consumer should not need to reconstruct a component's private field collection. A business-specific session factory can encapsulate field definitions and return a documented, typed session API. Add this interface when the concrete workflow requires it; ordinary components do not need both internal and external ownership modes by default.

If the parent only needs an observation such as unsaved changes, expose a narrow, documented event or slot when needed. Do not expose all field internals merely for one status indication.

## Reliable owner cleanup

Use Vue's existing cleanup hooks at the owner boundary. A component owning one session per mount can use `onUnmounted` as above. An owner composable called inside an active Vue scope can instead register `onScopeDispose` immediately after construction:

```ts
import { onScopeDispose } from 'vue'
import { createUiFieldControl, createUiFormControl } from '@uninterface/uninterface'

// Call synchronously inside the actual owner's setup/effect scope.
function useOwnedNameSession(initialName: string) {
  const form = createUiFormControl({ name: createUiFieldControl(initialName) })
  onScopeDispose(() => form.dispose())
  return form
}
```

Use this helper only when that scope owns the session. Passing an existing session to a child does not transfer cleanup responsibility. A retained business service can own the control directly, expose its own close/dispose operation and call `form.dispose()` there; it needs no additional Vue scope just to keep form watchers alive.

For a bounded asynchronous task, use `try/finally` so both success and failure clean up:

```ts
const form = createUiFormControl({ name: createUiFieldControl(initialName) })
try {
  return await form.submit(saveName)
} finally {
  form.dispose()
}
```

Register cleanup before later initialization that might fail. When constructing a service outside a Vue owner scope, catch initialization errors, dispose already-created controls and rethrow; apply the same rule when assembling multiple sessions. The form factory cleans up its own failed construction, but cannot clean up unrelated resources created by the caller. Repeated disposal is safe, although one explicit business owner should still be identifiable.

Verify the pattern by stopping a borrowing view and then editing: whole-form validity must still invalidate. Stop the actual owner and check that new form operations reject, temporary locks clear, and its supplied fields can join a new form. Complete an older save after that reuse: it must not change the new session's feedback, baseline or availability. Disposal prevents stale UI publication; it cannot undo persistence already dispatched.

## Apply recurring business patterns

A focused create/edit dialog can package its form session and modal behind one typed operation. Follow the [form-integrated modal pattern](form-modals.md) for a single completion-action footer, native submission, retry and dirty-close policy.

A reusable record browser can package domain fields and actions with [UiCollectionView](collection-views.md). Keep query/selection ownership explicit and editor sessions outside replaceable table/card views. Ordinary consumers should not reconstruct field definitions for each presentation.

## Document and verify the composition

Document the task, required and optional inputs, exact model types and units, mutation policy, callbacks/events/slots, session lifetime, reset/save behavior, validation feedback, and required capabilities. State which decisions belong to the consumer and which are already fulfilled by the component. Provide a minimal consumer example and explain the reasons behind defaults.

For humans and development agents, a usable contract should answer: “Can I complete this task using the documented inputs and operations without inspecting field wiring or designing the presentation?”

Write acceptance cases against that contract whenever possible before implementing the composition:

1. Mount the actual component with typed data and operations alone.
2. Verify correct initial presentation, draft isolation, and business-value output.
3. Exercise invalid input, successful save, failure/retry, duplicate submission, and reset baselines.
4. Verify that prop updates preserve an active draft and deliberate session replacement creates a fresh one.
5. Verify that an old asynchronous completion cannot change the new session's UI state.
6. Exercise the same composition across supported backend and responsive configurations, including keyboard use and accessible feedback.

Control and DOM tests establish state and wiring behavior. Browser and manual checks are needed for geometry, visual focus, and assistive-technology behavior; report evidence at the level actually verified. See the [test-kit contract](../contracts/test-kit.md) and [accessibility responsibilities](../contracts/accessibility.md).

The [confirmed email example](confirmed-email.md) extends this ownership pattern with a private draft, delegated checks, draft-change notifications and a borrowing view that can be hidden without ending its session.
