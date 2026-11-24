# Common control API

Use this guide to compose field editors and manage their availability and focus without depending on backend markup. The current field editors are [UiTextInput](../api/components/UiTextInput.md), [UiCheckbox](../api/components/UiCheckbox.md), [UiSelect](../api/components/UiSelect.md), [UiRadioGroup](../api/components/UiRadioGroup.md), and [UiCheckboxGroup](../api/components/UiCheckboxGroup.md). [UiButton](../api/components/UiButton.md) is an action rather than a value editor; it shares disabled and focus behavior but obtains its state from its own props or button binding.

## Input-styled controls

An **input-styled control** fits a field's control area, normally fills its available width, aligns to the logical start (left in LTR, right in RTL), and provides a coherent input frame with visible focus. The closed control normally occupies one row. Textarea is the explicit multiline adaptation; selected values may wrap inside a multiselect's frame.

Choose the component for its business semantics: UiTextInput for editable text, UiSelect for a single choice, and a compact UiMultiSelect for several choices. Their backend supplies the shared look and feel. Arrange the field with normal Uninterface layouts and form strategies; no business-side width or border CSS is required. The [contract and applicability table](../contracts/input-styled-controls.md) describe backend duties and current exceptions, including bounded native multiselect-listbox presentation. Temporal ranges share a frame while retaining separately named endpoint editors.

For a compound editor, use [UiInputFrame with UiTextInput](input-frames.md) to make several named parts and supporting content act as one input-styled control. The owning composition still defines values, operations and validation. Field editors such as checkboxes can have other presentations; this term is a shared style agreement, not a required superclass or an extra author-selected prop.

## Props and ownership

There are no mandatory props common to every editor. Each editor requires a surrounding [UiField](../api/components/UiField.md), which supplies the field control and accessibility relationships. UiSelect additionally requires an entry control for its choices. Consult each component reference for its specific props.

| Common editor prop | Type | Default | Meaning |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Adds a local restriction preventing user edits and focus requests |

Effective disabled state combines the field control's read-only `state.effectiveDisabled`, the nearest UiField's `disabled` prop, and the editor's `disabled` prop with logical OR. The control derives its effective state from business-owned `state.disabled` OR temporary submission locks. Business code may change `state.disabled` during submission; finishing or disposing that submission releases only its own lock. Local false never overrides another restriction. UiField and editor props do not mutate the shared field control, so another presentation of that control can have different local availability. Nested fields establish their own context; disabling a field is not a general subtree-disable mechanism.

```vue
<UiField :field="amount" label="Amount" :disabled="!canEdit">
  <UiTextInput inputmode="decimal" />
</UiField>

<UiField :field="enabled" label="Enabled">
  <UiCheckbox :disabled="operationPending" />
</UiField>
```

Use control-level state for restrictions shared by every presentation, UiField for this field presentation, and the editor prop for a restriction specific to that editor. Disabled changes preserve the draft, accepted baseline and existing validation feedback. They do not exclude a field from validation or submission. Programmatic baseline operations such as accept and reset remain available; `field.set()` ignores changes while the field control is effectively disabled, including before a view rerenders. UI availability is not business authorization.

Label, help and required annotations belong to UiField. Drafts, parsing, validation, issues and validating state belong to the field control; they are not competing editor props. Required annotation presentation does not supply a validation rule. Source loading in UiSelect does not automatically disable it. UiButton combines its own disabled restriction with binding availability and loading; it does not consume UiField restrictions.

## Focus

All field editors and UiButton expose the same method through a Vue template ref:

```ts
focus(): Promise<boolean | null>
```

The method requests focus on the actual interaction target, without changing the value, activating an action, toggling a checkbox, or opening a select. It accepts no arguments. Backends finish their necessary rendering or scheduled focus work before settling; pending work is represented by an unsettled promise.

| Result | Meaning |
|---|---|
| `true` | The intended target was verified focused, including when it already held focus |
| `false` | Focus could not be requested, including a disabled or unmounted control, or verification found the target was not focused |
| `null` | The request was issued but the backend cannot reliably observe the outcome |

Expected inability to focus resolves normally. Unexpected errors reject. The result describes focus at verification time and cannot guarantee continued focus. Consumers should await the result and handle rejection when their workflow depends on it. Null is not success or pending. Current backends inspect their actual DOM targets and return true or false; null supports encapsulated implementations that cannot verify.

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { UiField, UiTextInput, createUiFieldControl } from '@uninterface/uninterface'

const name = createUiFieldControl('')
const editor = useTemplateRef<{ focus(): Promise<boolean | null> }>('editor')

async function focusName() {
  if (!editor.value) return false
  return await editor.value.focus()
}
</script>

<template>
  <UiField :field="name" label="Name"><UiTextInput ref="editor" /></UiField>
  <button type="button" @click="focusName">Focus name</button>
</template>
```

Call after mounting. If a composition conditionally renders an editor, wait for Vue to render it before reading its ref. A retained handle called after unmount resolves false. Backends must verify focus where possible, including the appropriate root for shadow DOM, rather than returning null routinely. Business code must not search toolkit DOM or assume a wrapper is the focus target.

## Implementation and verification

The backend capability `control.focus.v1` declares the asynchronous focus handle for all field editors and UiButton. Each component checks this requirement at runtime.

Core combines restrictions, rejects user updates using live effective availability, and delegates focus. Backends reflect disabled state on the operable target, prevent disabled interaction, preserve accessible naming/description/state and visible keyboard focus, and expose the asynchronous focus handle. An editor and UiField must retain a single value owner. Target attributes and listeners follow the individual component contracts; do not override generated IDs, values or ARIA associations. See the [backend reference](../api/backend/README.md).

Verify each editor with local, UiField and control-level disabling, including simultaneous restrictions and recovery after only one restriction clears. Confirm another presentation's local state is unaffected. Change control-owned disabled state and attempt updates before rerender to check live guards. Parent prop changes take effect when Vue delivers them to the child. Confirm focus reaches the actual target, returns true when already focused, returns false while disabled or after unmount, and does not invoke/change/open the control. Move focus in a focus handler and check the returned result reflects the eventual verification. Real-browser checks are required for keyboard and focus behavior; simulated DOM tests do not establish visual focus or toolkit geometry.

## Scope limits

UiTextInput additionally supports `readonly`, `type="password"` and `multiline`; see its reference for combinations and target behavior. Readonly permits focus, selection and copying while rejecting user edits; it does not exclude the field from validation or submission, and business control operations retain their normal behavior. UiCheckbox, UiSelect and UiButton have no readonly contract. Autofocus is not a shared guaranteed prop. Date/time editors need not use text-specific options.

UiRadioGroup and UiCheckboxGroup also support disabled and the shared focus handle. See [choice groups](choice-groups.md) for group focus entry, async choices and codec mapping. UiCheckbox supports explicitly enabled tristate values; ordinary activation resolves the third value rather than cycling through it.
