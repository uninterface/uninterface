# UiRadioGroupValue

Import from `@uninterface/uninterface`.

`string | undefined` is the radio group editing representation. Undefined means no selection; the empty string is a valid key. The field codec maps the whole representation to business data. See [UiRadioGroup](../components/UiRadioGroup.md).

Core enforces the editing contract; backends must not coerce incompatible values or own business translation. Verify the documented value cases through field validation and the associated editor.
