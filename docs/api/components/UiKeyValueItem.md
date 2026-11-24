# UiKeyValueItem

One labeled property in UiKeyValueList. Import from `@uninterface/uninterface`.

`label: string` is required. The default slot supplies the value, including links, badges or other rich content. Root attributes target the backend's item group. No events or exposed methods. Used outside a list, the component reports an error.

Business code owns localized formatting, redaction and missing-value wording. No codec parsing, field control or automatic “empty” sentinel exists: zero, false, an absent value and hidden information have different meanings. Backend renders the term and definition and core registers strategy target key-value-item. Verify label/value association, preserved value component identity and readable long content. See [feedback and details](../../guides/feedback-and-details.md).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
