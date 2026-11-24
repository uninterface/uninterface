# UiStrategyTarget

Import type from `@uninterface/uninterface`.

```ts
type UiStrategyTarget = string
```

A semantic registered logical role. The strategy contract explains depth counting and gives examples of built-in roles; it is not an exhaustive role registry. Custom participants can introduce application-owned roles. Targets are not CSS selectors or component constructor names.

See the [strategy contract](../../contracts/strategy.md) for ownership, support fallback, scope, agreement and observable acceptance. The [usage guide](../../guides/strategies.md) shows common/custom declarations. Implementations must preserve typed identities, control state and accessibility; a supported type vocabulary does not imply every backend implements every value. Verify this type through the corresponding factory/query, scope and blocking scenarios rather than assuming toolkit behavior.
