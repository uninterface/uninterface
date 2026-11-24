# UiFilterRange

Import type from `@uninterface/uninterface`.

`UiFilterRange<T>` has readonly optional minimum?: T and maximum?: T. Undefined means an absent endpoint; empty/whitespace bound text parses to absence. Use business read/write mapping if a query uses null or different names. Both absent endpoints do not automatically mean inactive: isActive/clear/write define business semantics. Inclusive/exclusive interpretation, units and date arithmetic are not inferred. The range control validates ordering through compare and optional rules. Verify empty/open/bounded ranges, codec failures and reversed ordering.

See [built-in filters](../../guides/filter-patterns.md) and [filter adaptations](../../guides/filter-adaptations.md) for supported examples, ownership and observable checks.
