# UiCheckbox

Edits a binary or explicitly enabled three-value field. Both `true` and `false` are meaningful values; unchecked is not inherently missing or invalid.

```vue
<UiField :field="form.fields.enabled" label="Enabled"><UiCheckbox /></UiField>
```

Import from `@uninterface/uninterface`. Must be inside [UiField](UiField.md), in an application initialized with `createUiApplication`, with a boolean editing representation by default. `tristate` or `:binary="false"` enables `true | false | 'indeterminate'`. `binary` or `:tristate="false"` selects binary mode; omitting both defaults to binary. Supplying both mode props is an error. State comes solely from the field; there is no separate indeterminate prop. Optional `disabled?: boolean` defaults to false and adds a local restriction. A template ref exposes `focus(): Promise<boolean | null>`. See the [common control API](../../guides/controls.md) for restriction ownership and focus outcomes. There are no slots or public emitted events. Standard target attributes/listeners are forwarded; do not override generated value/availability/accessibility bindings.

Core reports changes through `field.set(value)` and validates that field after the change. Business rules decide whether checked is required. The backend provides native-equivalent checkbox semantics, associated naming/help/errors, keyboard Space toggling, visible checked/unchecked/disabled/focus states, and boolean update reports. It does not interpret `false` as absent or mutate a business model directly.

Binary mode rejects the indeterminate sentinel and all other incompatible raw values. Tristate requires `input.checkbox.tristate.v1`, failing explicitly if absent. With `cycleIndeterminate?: boolean` omitted or false, activation maps indeterminate to true, true to false and false to true. Setting `cycle-indeterminate` opts into false → true → indeterminate → false for pointer, associated-label, touch and Space activation. It requires `tristate` or `:binary="false"`; enabling it with binary values throws. Supporting indeterminate values alone does not enable this cycle. Backends expose mixed semantics and a distinct visual state. Business code can explicitly restore indeterminate through field.set, a codec can map it to a business value, and reset restores the accepted baseline. Use three named radio choices when all three answers should be directly selectable. Collection membership belongs to [UiCheckboxGroup](UiCheckboxGroup.md). `UiField.required` is descriptive and does not enforce checked state.

Acceptance: pointer, label, touch and Space activation each produce one field update. The default and opt-in transition tables repeat consistently; native checked/mixed state follows the accepted value. Disabled activation does not advance; codecs, validation, submission and reset to every accepted baseline preserve the business value.

The backend's field and checkbox views coordinate label/description placement and disabled presentation internally. Business code declares `UiField` and `UiCheckbox` without choosing toolkit markup or label placement. Concrete arrangements are documented by the backend.

Requires backend `control.focus.v1` for the shared focus handle.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

## Label presentation

Labels and group headings remain visible even under `uiFieldLabels('hidden')`. Individual option labels stay beside their controls. Standalone checkbox/switch labels are adjacent except with the explicitly selected separated arrangement. [uiCheckablePresentation](../../strategies/uiCheckablePresentation.md) selects flushed, control-aligned or separated placement; omission uses `adapt`. Backends own native markup, responsive stacking and logical-direction alignment. Changes preserve the control, value, focus and label activation. See the [shared principles](../../guides/design-principles.md#checkable-control-labels).

## Spacing

Arrange independent checkbox fields with [UiLayout](UiLayout.md). The visible checkbox square is smaller than its complete interaction row: assess spacing between the full labeled controls, including any help or validation feedback. Consumers should not compensate with local margins, smaller hit areas, or changes to field semantics. Use [UiCheckboxGroup](UiCheckboxGroup.md) for membership choices of one value, not merely to pack independent boolean fields closer together.

Backends must coordinate the field wrapper, checkbox row and surrounding layout so external field margins do not duplicate layout-owned peer spacing. Preserve control sizing, label association, visible focus and room for help/errors; nested compositions retain ownership of their internal spacing.

Observable checks: adjacent independent checkbox fields have one owner of peer separation; adding or removing help/errors adjusts only the affected field's content; keyboard focus stays visible and the full labeled control remains operable at supported sizes and narrow widths.
