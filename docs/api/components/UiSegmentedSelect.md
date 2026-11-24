# UiSegmentedSelect

Selects one field value from a small set of joined, always-visible choices. Import from `@uninterface/uninterface`; place inside an ordinary `UiField` (omit `group`). This is value selection, with radio semantics; navigation tabs and independent toggle actions have separate contracts. See the [segmented selection guide](../../guides/segmented-selection.md).

```vue
<UiField :field="period" label="Period">
  <UiSegmentedSelect :control="periods" />
</UiField>
```

| Prop | Default | Meaning |
| --- | --- | --- |
| `control: UiEntryControl` | Required | Owner-supplied flat static or asynchronous choices |
| `disabled?: boolean` | false | Additional restriction, combined with field/source availability |
| `autoLoad?: boolean` | true | Load on mount, source replacement or enabling autoLoad |
| `orientation?: 'horizontal' \| 'vertical'` | horizontal | Joined segments along the specified axis |
| `zOrder?: UiZOrder` | — | Shared outward stacking specification |

Raw field input is `string | undefined`; a codec may translate it to typed business data. An empty string is a legitimate key. Undefined means no selection. Re-activating the selected segment does not clear it. No model/value props, slots or public emitted events compete with the field owner. Entries supply key, label, optional description and disabled state; nested structures and entry-owned selection scopes are rejected. Rich entry content uses its text fallback.

A template ref exposes `focus(): Promise<boolean | null>`. Focus goes to the selected enabled option, otherwise the first enabled option, otherwise the named group/status container. Disabled views cannot be focused through this handle. Attributes and listeners target the group rather than every option.

Tab enters/leaves the group; arrow keys move focus and select with wrapping and disabled skipping; Space selects. Horizontal arrows follow text direction. Selection changes call field.set and validation. Only leaving the whole group triggers blur validation. Required annotations do not install business validation.

The [choice-group rules](../../guides/choice-groups.md) govern source ownership, validation, retained missing/disabled choices, explicit recovery, codecs and reset. Loading/failure never clears the selection or establishes field invalidity. No built-in clear/retry action is supplied. A deliberate business operation can set undefined. Consumers dispose entry controls and their owning form session. The enclosing field must not use `group`; grouped placement is rejected. The backend owns the internal radio-group name, option names and feedback associations.

The joined selection surface fills the allocated control width by default. Segments share available space subject to readable label widths; vertical orientation fills the width without claiming extra height. Segment boundaries and selected-state treatment follow the backend’s design language; individual borders and persistent selected fill are not required. Backends own native sizing, theme, disabled/selected/focus states and concrete markup. Choices stay visible without a popup; if their combined width exceeds the allocation, the local strip scrolls horizontally and focused options remain reachable. A vertical arrangement is also supported. Prefer short labels and a genuinely small set; use UiRadioGroup for extended descriptions or UiSelect for larger sets. No automatic component replacement or fixed option-count cutoff is implied.

Core uses the shared choice view binding and independent static backend `UiSegmentedSelect.vue` import. Requires `input.segmented-select.v1` and `control.focus.v1`. Backends adapt compatible native choice controls or supply their own joined radio presentation. Native visuals may differ; no common sliding animation is required.

Observable verification: codec round trips; empty/undefined keys; selected reactivation; disabled/source guards; retained selections; validation/focus/reset; separate mounted radio names; native sizing and query barriers; dark mode and RTL; and narrow allocations without page overflow. Automated DOM tests establish wiring and state, while actual keyboard, focus paint and scrolling geometry require browser verification.

An integrated label must stay clear of visible choices even without a selection. Field focus follows the radios; UiField retains validation feedback ownership. Coordinate label and control height budgets. Descriptions, larger text, vertical choices and local scrollbars may require more height. Concrete integrated-label support belongs in backend documentation.


## Ordinary field presentation

UiSegmentedSelect is one composite selection editor, like UiSelect, rather than a UiField group. Its overall label follows ordinary field-label strategies, including beside on supporting backends and above on mobile when requested. It is not subject to the checkable-control beside-label invariant; segment captions are options inside the surface. Backend radio-group semantics do not require an outer fieldset, legend or author-declared group.

Clicking the field label focuses the selected enabled segment, then the first enabled segment, then the named composite fallback when no candidate is available. It must not select a value or bypass disabled state. Hidden preserves the composite's accessible name. Preserve requiredness on the internal radiogroup, per-option names, help/error associations, arrow-key selection, draft and focus across label and responsive changes. Backend views provide the actual label/focus integration; consumers supply only the ordinary field and entry control.

Wrap UiSegmentedSelect in an ordinary UiField without `group`. UiRadioGroup and UiCheckboxGroup still require it. Verify omission works, explicit group is rejected, and changing label strategies retains editor identity and selection. See the [usage guide](../../guides/segmented-selection.md).

