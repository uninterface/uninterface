# Connect a control once

Use a control binding when a component has a defined role in an existing control. The producer already knows which state and operation belong together; the component should not reconstruct that relationship through several independent props.

Within a business editor, use:

```vue
<UiForm :control="control" :save="save" label="Record editor">
  <!-- Fields -->
  <UiLayout direction="horizontal" wrap>
    <UiButton
      :binding="control.bindings.submitButton"
      color="primary"
      variant="filled"
    >
      Save record
    </UiButton>
    <UiButton
      :binding="control.bindings.resetButton"
      color="danger"
      variant="outline"
    >
      Reset changes
    </UiButton>
  </UiLayout>
</UiForm>
```

The submit binding supplies type, live loading and availability. The reset binding supplies its own role and availability. The save callback is supplied once, to the form. Keep these buttons inside the matching `UiForm` in both logical and rendered structure, or use explicit `id`/`form` association as shown below. No button-level pending ref, conditional label swap, or click handler is needed. The outer consumer of this editor still supplies only typed data and persistence, as described in [business components](business-components.md).

HTML defines both submit and reset button types; see the [HTML button specification](https://html.spec.whatwg.org/multipage/form-elements.html#attr-button-type). These bindings use the corresponding form events as a single interaction route. Submit also covers implicit submission such as Enter in a text input. For reset, the backend cancels the browser's default restoration of native controls and reports the request to core. The form control restores its accepted data baseline and clears validation/outcome state, keeping the model and presentation synchronized. A successful save can establish a new accepted baseline according to the form's policy.

The reset type expresses a standard form interaction; it does not give the backend ownership of editing state. Ordinary control actions use `type: 'button'` with an `activate` callback. Choose the route from the required interaction semantics rather than assuming every control operation needs its own button type.

`UiButton` understands [UiButtonBinding](../api/types/UiButtonBinding.md), not forms. A custom control can provide the same interface using reactive getters and an ordinary-action callback. Its owner remains responsible for asynchronous state, duplicate-request policy, errors, and disposal. Passing a promise-returning callback does not automatically create a loading state.

Use direct loading to observe an operation when a binding is unnecessary:

```vue
<UiButton :loading="report.refreshing" @click="report.refresh()">
  Refresh report
</UiButton>
```

This illustrates an application-owned report control, not a built-in report API. The button displays activity and prevents activation while refreshing. Effective disabled is `loading || disabled`; when loading ends, an explicit disabled restriction still applies. The control must also guard direct programmatic requests. The backend selects the indicator and accessible status; authors do not supply spinner CSS or timing.

Do not spread a binding into a snapshot. Pass it intact so reads remain reactive and target/association checks remain effective. Do not add `type`, `loading`, or `@click` alongside a binding. Local `disabled` can tighten availability, but business rules that also apply to programmatic invocation belong in the control. Color, variant, and meaningful labels can remain local.

This interface exposes a target contract. The static `submit` role does not force `UiButton` to import the form-control implementation, and backend views only receive resolved button props. This preserves selective imports and allows another producer to use the same presentation without adding producer-specific branches to the button.

See the [control-binding contract](../contracts/control-binding.md) for ownership, limitations, backend responsibilities, and acceptance criteria. Region loading and generalized directives remain outside this initial surface.

## External form actions

A modal body and footer are separate presentation regions. Use the standard native form association to retain one submission/reset route across them. Create `formId` with Vue `useId()` inside the owning business component; its consumer still supplies business data and operations, not these wiring details.

```vue
<UiModal :control="modal" title="Edit record">
  <template #default>
    <UiForm :id="formId" :control="form" :save="save" label="Record editor">
      <!-- Fields -->
    </UiForm>
  </template>
  <template #actions="{ session }">
    <UiButton :form="formId" :binding="form.bindings.submitButton">Save</UiButton>
    <UiButton :disabled="form.state.pending" @click="session.cancel()">Cancel</UiButton>
    <UiButton :form="formId" :binding="form.bindings.resetButton">Reset changes</UiButton>
  </template>
</UiModal>
```

The form owns validation, persistence and baseline reset. The modal owns its session and dismissal policy. The business composition decides whether saving completes the session and whether cancellation needs confirmation; the actions slot infers neither. Backends arrange the buttons in declaration order according to their footer policy.

External buttons and their UiForm must share the Vue application and native document/tree scope. IDs must be document-unique and contain no whitespace; do not nest forms or create conflicting native IDs. Core checks that the named host belongs to the binding's control. Missing hosts keep bound actions disabled until they appear; unmounting or renaming a host releases its association. A mismatched owner is rejected. Multiple views of one control may use different IDs. An unbound `type="submit"` with `form` retains ordinary native semantics but does not acquire managed pending state.

Verify button clicks and Enter submission save once, invalid submission focuses the field, reset restores the accepted baseline, pending/disposal restrictions remain effective, and unmount/remount restores only the matching association. Test native keyboard behavior in a browser; simulated DOM checks do not establish it.
