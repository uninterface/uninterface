# UiStrategyFactory

Import type from `@uninterface/uninterface`.

```ts
interface UiStrategyFactory<T> extends UiStrategyIdentity {
  (value: T, options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
}
```

A callable family identity. Calling it creates a declaration; passing the function itself to block selects the whole family. Factory-specific arguments express policy; scope supplies optional limits.

See the [strategy contract](../../contracts/strategy.md) for ownership, support fallback, scope, agreement and observable acceptance. The [usage guide](../../guides/strategies.md) shows common/custom declarations. Implementations must preserve typed identities, control state and accessibility; a supported type vocabulary does not imply every backend implements every value. Verify this type through the corresponding factory/query, scope and blocking scenarios rather than assuming toolkit behavior.
