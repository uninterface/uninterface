# UiCheckboxGroupValue

Import from `@uninterface/uninterface`.

`string[]` is the checkbox group editing representation. It contains unique stable choice keys; [] is empty and membership is unordered. Configure a field inputEquals comparator for set-style dirty equality. Missing selected keys survive source refresh. See [UiCheckboxGroup](../components/UiCheckboxGroup.md).

Core enforces the editing contract; backends must not coerce incompatible values or own business translation. Verify the documented value cases through field validation and the associated editor.
