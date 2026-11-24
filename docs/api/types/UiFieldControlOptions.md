# UiFieldControlOptions

Import from `@uninterface/uninterface`.

Configures a field created by createUiFieldControl through its optional fourth argument.

```ts
interface UiFieldControlOptions<D> {
  inputEquals?: (left: D, right: D) => boolean
  revalidateOn?: 'change' | 'validate'
}
```

The optional pure synchronous equivalence function compares the raw draft with the formatted accepted baseline for dirty tracking only. Omission uses [uiDefaultInputEquals](../functions/uiDefaultInputEquals.md): recursive comparison of arrays/plain records, Date timestamps, URL hrefs and File/Blob metadata. Array order matters; file bytes are not read. The comparator must not mutate either argument or depend on changing source availability. Ordered-array fields should retain ordered comparison; membership fields may compare sets. Draft trackers still contribute to dirty state. This option does not suppress revisions, codec normalization, validation, notifications or submission.

`revalidateOn` controls automatic feedback checks after a field has been checked. The default, `change`, reruns parsing/rules/checks on `set()` while preserving raw input. `validate` defers this work until explicit `field.validate()` or coordinated form validation/submission. Edits still invalidate prior results, clear obsolete feedback and update draft/dirty state immediately. Text editors request explicit validation on blur; discrete editors retain their own settled-change boundary. This option does not suppress explicit `read()` calls or another owner's automatic projection reads. Pair it with `projection: 'validate'` for an editable collection that must avoid row reads while typing. See [validation timing](../../guides/validation.md#validation-timing).

Core snapshots these options when creating the field. Business owners choose the equivalence appropriate to their value. Verify a reordered equivalent selection is clean, changed membership is dirty, reset/accept use the comparator, and ordered fields remain order-sensitive. See the [choice groups guide](../../guides/choice-groups.md).

Core enforces the editing contract; backends must not coerce incompatible values or own business translation. Verify the documented value cases through field validation and the associated editor.
