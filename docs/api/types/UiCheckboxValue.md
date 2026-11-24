# UiCheckboxValue

Import from `@uninterface/uninterface`.

`boolean | 'indeterminate'` is the standalone checkbox editing representation. Binary mode accepts only booleans; tristate accepts the sentinel. Activation resolves indeterminate to true, then toggles booleans. Codecs may map it to a business value such as null. See [UiCheckbox](../components/UiCheckbox.md).

Core enforces the editing contract; backends must not coerce incompatible values or own business translation. Verify the documented value cases through field validation and the associated editor.
