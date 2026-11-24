# createUiChoiceFilterEditor

A reusable context-aware choice editor for a collection filter. Import from `@uninterface/uninterface`.

```ts
createEditor(context) {
  return createUiChoiceFilterEditor(context, {
    selection: 'multiple',
    options: [
      { key: 'open', label: () => messages.open },
      { key: 'complete', label: () => messages.complete },
    ],
  })
}
```

Overloads accept `UiFilterEditorContext<readonly K[]>` with selection=multiple, or `UiFilterEditorContext<K>` with selection=single (`K extends string`), and return the corresponding UiFilterEditorInstance. Multiple values must be duplicate-free string keys; single values are string keys. Options are a UiEntrySource (static or asynchronous), using the existing one-level grouped-entry contract. This helper creates and owns an entry control and field; the surrounding filter owner disposes both via the returned editor. It reuses createUiFilterFieldEditor and existing validation/selection behavior.

A table-column or filter-badge popover context presents a ready flat list of 1–6 choices as checkboxes (multiple) or radios (single), provided all selected keys occur in the options. Rows, panels, forms and unknown/custom usages use UiMultiSelect or UiSelect. Larger/grouped/unready sets and retained missing choices also use the picker. Six is an Uninterface default adaptation threshold, not an upstream standard. Empty single values follow UiSelect's existing placeholder convention; multiple membership supports empty keys. Unknown retained choices remain repairable through the picker. Search availability and native interaction are inherited from existing backend controls, not newly promised by this helper.

The view reads live presentation context, suppresses a redundant visible heading when labelProvided=true, retains accessible naming, and switches only its editor presentation. Query mapping, active semantics, summaries, clearing and explicit/live/debounced policy remain in the business filter definition. Switching contexts never queries or changes selection. A view switch can replace the actual input; no cross-presentation focus preservation is promised. Live choices need no Apply button. An explicit policy receives Apply/Clear actions from the shared choice surface. Submit uses the filter view context, retaining applied events and popup completion.

The adaptation reuses the backend’s compact multiple picker or bounded native multiple listbox; it does not add missing picker capabilities. Single selection uses the existing UiSelect. No new backend capability or filter predicate engine is added.

Verify single/multiple query semantics, context changes without reads, live updates, short-list popup presentation, grouped/large/missing-value fallback, labels, disabled/source state, and disposal. Browser geometry, keyboard/touch behavior and native menu placement need separate visual acceptance.

See [reusable collection filters](../../guides/collection-filters.md).

For ordinary business definitions, createUiChoiceFilterControl supplies this field/entry/session construction directly and exposes a typed binding. This lower-level helper remains available for custom createEditor implementations and uses the same choice adaptation strategy path. See [built-in filters](../../guides/filter-patterns.md).
