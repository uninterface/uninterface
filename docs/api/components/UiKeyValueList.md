# UiKeyValueList

Groups read-only business properties as a semantic definition list. Import from `@uninterface/uninterface`.

No props, events or exposed methods. The default slot contains UiKeyValueItem components, directly or through opaque components rendering those items. Root attributes including aria-label target the definition list. Do not put layout wrappers or unrelated content between the list and its items; put rich content inside each item's value.

Backend owns label/value arrangement and responsive stacking; authors supply no widths or spacing. Nested lists belong in a value. Core provides list membership context and strategy target key-value-list. Requires key-value.v1. Verify dl/dt/dd associations, rich values, source order, attribute preservation and readable narrow layouts. See [feedback and details](../../guides/feedback-and-details.md).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
