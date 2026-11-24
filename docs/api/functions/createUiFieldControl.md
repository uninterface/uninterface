# createUiFieldControl

Creates a control for one editable business value, its editing representation, interpretation, validation feedback, and dirty state. The control is independent of the rendered input and can be used without a form. Form participation is established separately by supplying the control to [createUiFormControl](createUiFormControl.md); that form coordinates the existing control.

```ts
import { createUiFieldControl } from '@uninterface/uninterface'
const name = createUiFieldControl('', undefined, [value => value.trim() ? null : 'Name is required.'])
await name.set('Ada')
await name.validate() // true
await name.read() // { ok: true, value: 'Ada' }
```

```ts
createUiFieldControl<T, D = T>(initial: T, codec?: UiCodec<T, D>, rules?: UiValidationRule<T>[], options?: UiFieldControlOptions<D>): UiFieldControl<T, D>
```

`initial` supplies the initial business value. `codec` defaults to identity parsing/formatting, so `D` must equal `T` when it is omitted. `rules` defaults to an empty array and is evaluated in supplied order. The first parse/rule/composite-check issue wins. Explicit validation formats successfully parsed input before checking rules, while automatic checks during editing, when enabled, preserve raw input. The result is a [UiFieldControl](../types/UiFieldControl.md); see that page for every operation and state property.

Initial formatting and updates are copied to avoid modifying the supplied original. Arrays and plain records are copied recursively; Date and URL values are copied by value. Immutable browser File/Blob objects retain their identity, including inside descriptors. Vue proxies are unwrapped while copying supported values. Other object types use structured cloning, which does not guarantee preservation of arbitrary class behavior; unsupported cloning or formatting throws. Both the draft and parsed business value must meet these copying requirements. Default dirty comparison uses [uiDefaultInputEquals](uiDefaultInputEquals.md); supply `inputEquals` when business equality differs, including when file metadata alone is insufficient.

Business code owns initial values, codec, rules, and lifetime. Uninterface owns draft state and validation execution; backends only read render bindings and report input. No rendering or backend configuration is required to create a field. Codec parsing, rules and registered checks may return promises. Formatting remains synchronous. They must not edit the validated draft or baseline or persist data and may be evaluated repeatedly; core owns scheduling and stale-result protection. See [asynchronous validation](../../guides/validation.md).

Acceptance: draft changes leave the original untouched; parse errors preserve raw input; read does not publish feedback; reset restores the baseline; disabled edits are ignored. See the control tests and record-editing amount example.

The optional fourth argument supplies [UiFieldControlOptions](../types/UiFieldControlOptions.md), including inputEquals for domain-appropriate draft/baseline dirty comparison. `revalidateOn: 'validate'` defers checked-field feedback refresh until explicit validation; omission retains change-time feedback. Text blur and form submission remain validation boundaries. See [validation timing](../../guides/validation.md#validation-timing).
