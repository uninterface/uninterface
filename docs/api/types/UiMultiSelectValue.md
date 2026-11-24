# UiMultiSelectValue

`type UiMultiSelectValue = string[]`

Import from `@uninterface/uninterface`. This is the raw editing representation of UiMultiSelect: unique entry keys, with `[]` meaning no choices and `''` permitted as a real key. The field codec may translate it to another business type. A missing candidate does not remove its selected key.

Core validates strings and uniqueness; business validation supplies cardinality and eligibility rules. Use an unordered `inputEquals` comparator when dirty state should ignore ordering. Verify full codec round trips and retained values; see [multiple selection](../../guides/multiple-selection.md).
