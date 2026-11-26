# Multiple selection

Use [UiMultiSelect](../api/components/UiMultiSelect.md) for a compact picker or native multiple listbox editing a set of choices. Use UiCheckboxGroup when the choices should be exposed as individually labelled checkboxes. Both use one field-owned `string[]` raw value and translate it with a codec; neither stores an independent selected-value model in an entry control.

```ts
const field = createUiFieldControl<number[], string[]>([1], {
  format: values => values.map(value => String(value)),
  parse: keys => keys.every(key => ['1', '2', '3'].includes(key))
    ? { ok: true, value: keys.map(Number) }
    : { ok: false, issue: 'Choose supported departments.' },
}, [], {
  inputEquals: (left, right) =>
    left.length === right.length && left.every(key => right.includes(key)),
})
const choices = createUiEntryControl([
  { key: '1', label: 'Operations' },
  { key: '2', label: 'Finance' },
  { key: '3', label: 'Administration', disabled: true },
])
```

The reusable business component owns these definitions, source recovery, validation rules and control lifetime. Its consumers supply typed business values and operations. Required annotation is semantic information, not a minimum-selection rule. Add a business rule for minimum/maximum membership; the view never silently truncates the value.

## Retention and repair

The selected identity and currently loaded candidates are different things. Refreshing or failing to load choices must not erase selected keys. The component retains descriptions and displays raw keys when a label is unknown. A ready result that omits a selected key marks it as unavailable in the current choices. Business validation decides whether that means the value is invalid.

Disabled loaded memberships stay selected and cannot be directly removed; clearing preserves them. Missing memberships can be deliberately removed through the picker or clear action. This distinction avoids both silent pruning and trapping obsolete values forever. When source status is idle/loading/refreshing/error, choices and clear cannot mutate membership. The business composition supplies retry through the entry control; opening a failed picker does not silently retry.

The source may group items one level deep. Groups provide labels, not select-all or cascading behavior. Nested groups and submenus are rejected. Use separate controls for searchable autocomplete, cascade selection or aggregate checkbox patterns; they are outside this component's initial contract.

## Backend presentation and testing

Multiple selection occupies one bounded field area. Clearing is integrated into that area, without a separate text-button row. Applications arrange the field normally; they do not supply backend-specific widths, clear buttons or selection presentation.

Concrete picker/listbox mappings and interaction differences are documented by the selected backend.

Native keyboard and touch conventions differ; shared semantics do not require identical DOM. A native multiple listbox follows platform modifier conventions and has no collapsed placeholder. Clear is offered only when editable selections exist and the source is ready. Native clear affordances may appear on focus or hover. Source status is announced without adding a separate row to the editor. Field help and validation feedback keep their normal placement.

Use the testing package's `multiSelect(...).setSelected(key, boolean)`, `expectSelected(key)` and `clear()` operations. Backend adapters identify actual triggers/popups/clear controls; scenarios do not branch on backend names. Candidate keys remain exact even with punctuation or empty keys.

Verify that the numeric codec above round-trips selected keys to business IDs through Save and Reset. Check that reordering an equivalent selection leaves the field clean. Exercise unknown and disabled choices, source refresh and failure, and clearing with locked values selected. In a browser, verify field focus, long labels and native picker keyboard behavior.
