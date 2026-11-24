# UiField

A field represents one editable business value, with its editing state, interpretation, and validation. `UiField` associates that value's control with its editor or read-only preview, label, instructions, requirements, and feedback. A business author names the field and supplies its rules through the control. The backend decides how those related parts are arranged and presented.

The field concept applies to form editing, standalone settings, and values edited within larger compositions. Form participation is a separate relationship: `UiField` does not require a parent `UiForm`. A data-schema property, table column, or read-only key/value entry has its own responsibility and is not, by itself, this editing-field concept. Table and settings examples describe possible uses of fields; they do not declare additional implemented components.

```vue
<UiField :field="form.fields.amount" label="Amount (USD)" required
  help="Use a nonnegative amount. Extra decimal places are rounded to the nearest cent.">
  <UiTextInput inputmode="decimal" />
</UiField>
```

Import from `@uninterface/uninterface`, in an application initialized with `createUiApplication`.

The `field` prop accepts a [UiFieldControl](../types/UiFieldControl.md) created directly by [createUiFieldControl](../functions/createUiFieldControl.md), or obtained from a form's `fields` collection. In the current API, [createUiFormControl](../functions/createUiFormControl.md) establishes participation through that explicit collection. Nesting a field under `UiForm` does not register it, and rendering it elsewhere does not remove it from the collection. A standalone field retains its parsing, validation, and baseline operations; the business composition decides how its value is used or persisted.

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `field` | `UiFieldControl<any, any>` | Required | Editing/validation control |
| `label` | `string` | Required | Business name of the field or group |
| `help` | `string` | Omitted | Instructions associated with the control/group |
| `disabled` | `boolean` | `false` | Additional restriction on editors using this field context; does not mutate the control |
| `required` | `boolean` | `false` | Announce that a value is required; enforcement still belongs to rules/codecs |
| `group` | `boolean` | `false` | The field represents composite or read-only preview content with group semantics |

The default slot contains one associated input, or the composition's content when `group` is true. No public emitted events or methods. A simple field must have one label target; multiple editing children need a group and individually labeled nested fields. Nested inputs use the nearest field context. Availability combines control, field and editor restrictions; see the [common control API](../../guides/controls.md). Group labels do not replace the names of individual controls.

[UiSegmentedSelect](UiSegmentedSelect.md) is one composite editor, like UiSelect: omit `group`. Its backend encapsulates the internal radio targets and focuses the current/first enabled segment when the field label is activated. Internal option markup does not make the enclosing field a group. UiRadioGroup and UiCheckboxGroup still require `group`.

Core generates stable IDs for this mounted field and descriptions, provides the control context, and reads its issue. It does not dictate label position or container tags. The backend must associate the label with the correct input, preserve help/error IDs, expose an accessible group when requested, and make invalid groups focusable for submission feedback. Localized required wording comes from provider messages; the backend may display a symbol while preserving accessible required information. Errors must be understandable without color alone.

Groups may use a native fieldset/legend or equivalent named-group semantics. The backend does not validate, own the value, or clear the field on unmount. Generated IDs are accessibility wiring, not persistent business identifiers.

Acceptance: label activation targets the control, help/errors are linked, groups have names, and validation feedback tracks the shared control regardless of rendered structure.

[UiStrategy](UiStrategy.md) selects supported label positions, helper/error coexistence and validation-failure presentation. `uiValidationFailure` accepts none/show/show-below/show-embedded/show-tooltip. Embedded requests the message inside the visible control surface; tooltip requests an anchored floating bubble. Floating-label support depends on the editor and backend; hidden ordinary labels preserve accessible names; checkable labels and group titles stay visible under hidden. [uiCheckablePresentation](../../strategies/uiCheckablePresentation.md) controls their field arrangement. Omitted strategies preserve backend defaults. None suppresses visible field messages while retaining native invalid-state highlighting, aria-invalid, validation state and submission blocking. In the none mode, the error ID is removed from the description association and helper text returns if it was hidden only by the error. In tooltip mode, scrolling the anchor out of view hides the bubble while preserving its accessible description. Form summaries remain independent. Successful validation adds no presentation. Label show requests default visible placement. Unsupported positions generalize through beside/show; alignment details depend on the selected backend’s documented support. These preferences never run validation or change business rules; see the [support and fallback contract](../../contracts/strategy.md#common-vocabulary-and-support).

Marker appearance is a form-level presentation strategy concern, separate from each field's semantic requiredness and validation rules. The default annotation placement, concrete rendering and theme treatment belong to the backend; yes preserves its configured placement. Ordinary controls support `aria-required`; generic required groups instead need an appropriate localized description, because that ARIA property does not apply to `group`. A decorative marker cannot be the only source of required semantics. [UiStrategy](UiStrategy.md) can apply required annotations and other field-presentation preferences, subject to the [support and fallback contract](../../contracts/strategy.md#common-vocabulary-and-support). No per-field marker symbol or placement prop is exposed.

A grouped field may contain UiInputFrame with individually named UiTextInputs projecting parts of the same draft. Do not introduce child UiFields solely to name these parts; see [shared input frames](../../guides/input-frames.md).

A grouped field may also contain [UiPreviewRegion](UiPreviewRegion.md), a bordered read-only view of the field value. It consumes naming, availability and feedback without editing or triggering validation. An editor and preview may observe the same control; neither view creates additional form participation. This differs from an unrelated read-only key/value entry.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

## Alignment

The backend coordinates labels and control surfaces under the [field alignment discipline](../../guides/field-alignment.md). Above labels share the control allocation's logical start; beside labels anchor to the first text/interaction row. Taller editors and feedback grow downward. Business consumers do not supply offset CSS.
