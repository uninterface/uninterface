# Choice groups and three-value checkboxes

Use UiRadioGroup to choose one value and UiCheckboxGroup to edit membership in a set. Each belongs inside one UiField with `group`, which supplies the field control, group label, help, required semantics and feedback. Individual options have their own labels and optional descriptions. A reusable business component should own the fields, codec selection, rules, sources and form session; its consumers supply typed initial data and a save operation. See [business component ownership](business-components.md).

## Values and codecs

Radio raw values are `string | undefined`: undefined means no choice, and the empty string is a legitimate choice key. Checkbox group raw values are duplicate-free `string[]`: [] means no members. A field codec translates the complete editing representation into a business value. Source keys are stable identities; display order is not membership order.

```ts
import {
  createUiEntryControl, createUiFieldControl,
  type UiCodec, type UiRadioGroupValue, type UiCheckboxGroupValue,
} from '@uninterface/uninterface'

type Delivery = 10 | 20
const deliveryCodec: UiCodec<Delivery | undefined, UiRadioGroupValue> = {
  parse(key) {
    if (key === undefined) return { ok: true, value: undefined }
    if (key === 'postal') return { ok: true, value: 10 }
    if (key === 'collect') return { ok: true, value: 20 }
    return { ok: false, issue: 'Unknown delivery method.' }
  },
  format(value) {
    return value === undefined ? undefined : value === 10 ? 'postal' : 'collect'
  },
}
const delivery = createUiFieldControl(undefined, deliveryCodec, [
  value => value === undefined ? 'Choose delivery.' : null,
])
const deliveryChoices = createUiEntryControl([
  { key: 'postal', label: 'By post' },
  { key: 'collect', label: 'Collect in person' },
])

type Permission = 1 | 2 | 3
const codes = { view: 1, edit: 2, approve: 3 } as const
const keys = { 1: 'view', 2: 'edit', 3: 'approve' } as const
const permissionCodec: UiCodec<Permission[], UiCheckboxGroupValue> = {
  parse(input) {
    const values: Permission[] = []
    for (const key of input) {
      if (key !== 'view' && key !== 'edit' && key !== 'approve')
        return { ok: false, issue: 'Unknown permission.' }
      values.push(codes[key])
    }
    if (new Set(input).size !== input.length)
      return { ok: false, issue: 'Duplicate permission.' }
    return { ok: true, value: values }
  },
  format(values) { return values.map(value => keys[value]) },
}
const permissions = createUiFieldControl<Permission[], string[]>(
  [1], permissionCodec, [], {
    inputEquals: (a, b) => a.length === b.length
      && new Set(a).size === a.length && new Set(b).size === b.length
      && a.every(key => b.includes(key)),
  },
)
const permissionChoices = createUiEntryControl([
  { key: 'view', label: 'View records' },
  { key: 'edit', label: 'Edit records' },
  { key: 'approve', label: 'Approve records', disabled: true },
])
```

```vue
<UiField :field="delivery" group label="Delivery" required>
  <UiRadioGroup :control="deliveryChoices" />
</UiField>
<UiField :field="permissions" group label="Permissions">
  <UiCheckboxGroup :control="permissionChoices" />
</UiField>
```

Initial values, accept and reset format business values into raw input. Parsing may be asynchronous; formatting is synchronous. Validation/submission use the parsed business snapshot. Choice interaction must not bypass the codec or translate members one at a time. Invalid parse results retain the draft. The examples reject unknown domain codes; applications can instead support deprecated IDs when their business model permits them.

Configure `inputEquals` for unordered membership. It changes only dirty comparison against the formatted baseline, leaving revisions, normalization, parsing and notifications intact. Without it, fields use [uiDefaultInputEquals](../api/functions/uiDefaultInputEquals.md), which compares arrays in order. The comparator must be pure and synchronous. Do not sort or reset a field just because a group mounts or its candidates refresh.

## Availability and retained selections

| Condition | Behavior |
| --- | --- |
| Disabled unselected item | Visible and unavailable for selection |
| Disabled selected item | Remains selected; checkbox cannot be directly unchecked; radio can be replaced through another enabled choice |
| Selected key missing from ready results | Retained line shows last known label or raw key and “Not in current choices” |
| Selected key not yet known | Raw key remains visible; its label appears when loaded |
| Idle/loading/refreshing/failure | Selection and known descriptions remain; source status is separate; candidate changes wait for ready results |
| Ready empty results | Show empty status; retain existing selected values |
| Missing key returns | Reconcile its retained display into the selected option without changing draft/baseline |

Missing does not mean deleted, invalid or unauthorized: a source may be partial or filtered. A transient request failure must not become a codec failure. Business rules decide whether retained values are allowed, including asynchronous checks against authoritative data. If eligibility changes independently, the composition requests revalidation explicitly.

Neither group has a built-in clear or removal action. A workflow that rejects obsolete selections must provide a repair operation, for example:

```ts
async function removeObsoletePermission(key: string) {
  await permissions.set(permissions.state.input.filter(value => value !== key))
  await permissions.validate()
}
```

Guard such actions with the workflow's availability rules, including any local view restrictions. Disabling one editor does not automatically disable a separate button. A disabled checkbox is not a “may deselect but may not select” policy, and UI availability is not server authorization. Reset may restore unavailable accepted values. Source refresh never silently prunes the draft.

The source control is business-owned. `autoLoad` defaults to true. With false, call control.load explicitly; there is no picker-opening gesture. Source clear leaves the group idle, and failed requests require explicit recovery through load/refresh. Dispose the entry control and any form session when their owner ends; field controls have no separate dispose method. Hiding a borrowing view does not own that lifetime.

## Interaction and presentation

Radio groups support ordinary Tab, Space and arrow navigation with disabled skipping and wrap. Selected-radio activation does not clear selection. Checkbox groups expose individually tabbable binary members; Space toggles one member. Leaving the group validates, while moving focus within it does not itself cause blur validation. Actual selection changes validate.

Required annotations are descriptive. Business rules enforce nonempty choices, minimum/maximum membership and conflicting combinations. Initial invalid selections stay visible and correctable. Preventive min/max blocking is not an editor prop.

Failed submission follows the same option-first focus policy as the editor's `focus()` handle: a checkbox group focuses its first enabled checkbox, even if another checkbox is already selected; a radio group focuses its selected enabled option, otherwise its first enabled option. Recovery changes no value. Each option retains its field-feedback descriptions, and error highlighting remains independent of focus.

The named group/status container is a programmatic fallback when no option is usable, such as an empty, loading, failed or all-disabled source. Effective disabling prevents direct editor focus. Fallback focusability is added only for that request and removed on blur; groups and outer field wrappers do not acquire standing Tab stops. A focused option keeps its backend-native indicator without an additional enclosing focus outline. A focused fallback container uses the backend's common `:focus-visible` treatment, including contained and forced-colors presentation. Pointer interaction does not force a keyboard outline; browser/user focus preferences still apply.

Both groups support vertical or horizontal wrapping presentation. Backends own markup, spacing, toolkit integration, visible focus and actual focus targets. Standard attributes/listeners target the semantic group. Focus handles follow the [common focus contract](controls.md#focus). There are no rich option slots, nested groups, bulk selection, cascade selection, search input or virtualized collections in these components.

## A genuine third checkbox value

UiCheckbox defaults to binary. `tristate` or `:binary="false"` enables the raw representation `true | false | 'indeterminate'`. Supply only one mode prop. Binary mode rejects the sentinel instead of coercing it. The field is the sole value owner; no separate indeterminate presentation prop competes with it.

```ts
import type { UiCheckboxValue } from '@uninterface/uninterface'
const decisionCodec: UiCodec<boolean | null, UiCheckboxValue> = {
  parse: value => ({ ok: true, value: value === 'indeterminate' ? null : value }),
  format: value => value === null ? 'indeterminate' : value,
}
const decision = createUiFieldControl(null, decisionCodec)
```

```vue
<UiField :field="decision" label="Approve this request">
  <UiCheckbox tristate cycle-indeterminate />
</UiField>
```

With `cycle-indeterminate`, click/label/touch/Space activation cycles false → true → indeterminate → false. General and Choices use this opt-in behavior. Omitting it retains the default behavior: indeterminate activates to true, then true/false toggling. Business code can also set the sentinel explicitly when its workflow requires it. If all three answers must be equally discoverable, use three named radio choices. Reset restores the accepted baseline, not an assumed unknown value. Three-value support requires a declared backend capability; lack of support fails explicitly. Checkbox-group members remain ordinary binary membership.

## Verification

Verify business codec round trips and the submitted snapshot, unordered dirty comparison, reset/accept, parse failures and async stale protection. Exercise missing initial values, disappearing disabled selections, loading/error/empty sources, explicit repair and source recovery. Test failed submission by pointer and Enter, option-first recovery without value changes, fallback naming/tabindex cleanup, keyboard/forced-colors focus, and per-option names/descriptions and group feedback in a real browser. Shared test operations come from `@uninterface/testing/playwright`; backend adapters resolve actual interaction targets without selecting by duplicated labels or forcing clicks.

For joined, concise single-choice presentation, use [UiSegmentedSelect](segmented-selection.md). It reuses this value/source contract and defaults to horizontal segments, but belongs inside an ordinary UiField without group. Internal radio-group semantics do not impose a grouped-field presentation.
