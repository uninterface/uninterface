# UiChoiceFilterEditorOptions

Import this type from `@uninterface/uninterface`. Options for createUiChoiceFilterEditor:

- `selection: 'single' | 'multiple'`: matches the criterion's string or readonly string-array value.
- `options: UiEntrySource`: static or asynchronous business choices with stable string keys, localized text, optional disabled state and one level of groups.

The helper's overloads enforce matching context/value and selection mode. Candidate loading is independent of collection data reads. The helper owns its entry source control for the filter session lifetime; ordinary view changes do not dispose it. Selection is field-owned; no competing entry selection scope is created. Retained unknown keys remain visible/repairable through the existing select contract.

The common editor chooses radios/checkboxes for a small flat column popup and select/multi-select elsewhere. Query meaning, policy and summary/removal remain definition concerns. This is an optional reusable editor, not a closed schema of possible filters. Custom editors remain supported.

Verify candidate identity, multiple-value membership, source lifecycle and context adaptation. See [createUiChoiceFilterEditor](../functions/createUiChoiceFilterEditor.md).
