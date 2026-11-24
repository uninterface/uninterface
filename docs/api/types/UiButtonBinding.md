# UiButtonBinding

A read-only, reactive connection from a control to a button. Import this interface from `@uninterface/uninterface`. The button understands this target contract, not the producer's form, list, or business rules. It does not copy state or own the producer's lifetime.

```ts
interface UiButtonBinding {
  readonly target: 'button'
  readonly type: 'button' | 'submit' | 'reset'
  readonly disabled: boolean
  readonly loading: boolean
  readonly activate?: () => void | Promise<void>
}
```

| Member | Meaning |
|---|---|
| `target` | Identifies the compatible component contract; must be `button` |
| `type` | Ordinary activation, native form submission, or native form reset |
| `disabled` | The producer currently prohibits activation |
| `loading` | Present ongoing activity and prevent button activation |
| `activate` | Optional invocation callback for `type: 'button'` only |

Use getters over reactive control state or a Vue reactive object so reads stay live. Do not spread or destructure a binding into a snapshot. `readonly` means consumers must not assign its properties; the producer updates its underlying state. A binding is not a DOM-prop bag or a backend render binding.

## Form bindings

```vue
<UiForm :control="form" :save="saveRecord" label="Record editor">
  <!-- Fields -->
  <UiButton
    :binding="form.bindings.submitButton"
    color="primary"
    variant="filled"
  >Save record</UiButton>
  <UiButton
    :binding="form.bindings.resetButton"
    color="danger"
    variant="outline"
  >Reset changes</UiButton>
</UiForm>
```

[createUiFormControl](../functions/createUiFormControl.md) creates stable, frozen binding objects once per control. The submit binding supplies `type: 'submit'`, loading during pending submission, and disabled while pending or disposed. The reset binding supplies `type: 'reset'` and the same disabled condition, but never presents submission as its own loading. A disposed form stops presenting activity and leaves both actions unavailable.

Invalidity alone does not disable submit: the person can request validation and receive feedback. Multiple submit buttons observe the same state; programmatic `form.submit(saveRecord)` updates them too. The `save` operation remains supplied once to `UiForm` for user submission. Bindings do not invoke another save callback.

Both form bindings require a matching `UiForm`. Without an explicit `form` prop, keep the button inside that form in Vue ancestry and rendered content; a missing or different logical host fails loudly. For external actions, set UiForm `id` and UiButton `form` to the same document-unique ID. Internal scope metadata verifies the named host belongs to the binding’s control, without exposing the form to UiButton. The button stays disabled while that host is absent, including before mounting and after unmounting. A different owner fails loudly. Explicit targeting supports sibling slots and Teleport within the same Vue application and native document/tree scope. Do not nest native forms or arbitrarily reassign their DOM ownership. Multiple submission intents remain unsupported.

Native submit/reset is the sole invocation path for these bindings. Backends report those events to core; core validates/saves or resets. No competing click callback is installed. Enter-key submission uses the same form route. Use `form.submit()`/`form.reset()` for direct control operations. Unmounting a button or form view does not dispose the control.

## Other producers

An application or plugin can supply an ordinary button binding without form knowledge:

```ts
import type { UiButtonBinding } from '@uninterface/uninterface'

// `task` is the owning control; it guards requests and owns async outcomes.
const refreshButton: UiButtonBinding = {
  target: 'button',
  type: 'button',
  get disabled() { return !task.canRefresh },
  get loading() { return task.refreshing },
  activate: () => task.refresh(),
}
```

This example supplies its own task producer, which must guard programmatic invocations and decide concurrency, failure handling, and lifetime. The built-in [list item context](UiListItemContext.md) also supplies ordinary button bindings for configured activation/removal operations. `UiButton` invokes `activate` once per permitted activation and returns its result to Vue's event handling. It does not infer loading, catch business failures into a form message, or invent cancellation from a promise. Unhandled callback errors follow Vue's error handling. An ordinary binding without `activate` is display-only.

## Composition and errors

- With a binding, omit local `type`, `loading`, and `@click`. Supplying them is an error, including identical values, because the binding owns these concerns.
- Local `disabled` may additionally restrict availability: effective disabled is `binding.loading || binding.disabled || disabled`. A local false cannot enable a loading or producer-disabled action. Ending loading preserves any remaining disabled restriction. This is a view-local restriction; business constraints affecting every invocation belong in the owning control.
- Labels, color, and variant remain component inputs. Binding does not prescribe presentation.
- A binding with the wrong target, invalid fields, or an `activate` callback on submit/reset fails loudly. A bound button cannot supply a native `form` attribute that overrides association.

Core checks live availability at activation as well as rendering disabled markup. The producer still owns the atomic execution guard: disabled rendering is not a concurrency lock. Submit guards in the form control cover calls before Vue updates the DOM.

`button.binding.v1` is provided by core. Bound buttons require backend `button.loading.v1`; reset also requires `form.reset.v1`. See [UiButton](../components/UiButton.md) for presentation and accessibility obligations.

Acceptance: independent producers use the same contract; reactive changes preserve the button; loading or disabled blocks activation, and only clearing both restores availability; local restrictions cannot weaken producer restrictions; mismatched hosts/conflicting props fail; multiple submit buttons share one operation; reset stays idle during save; failures release activity; removal of a consuming view does not end control state.
