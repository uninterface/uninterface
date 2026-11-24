# UiStrategyScope

Import type from `@uninterface/uninterface`.

```ts
interface UiStrategyScope {
  depth?: number
  targets?: readonly UiStrategyTarget[]
  stopAt?: readonly UiStrategyTarget[]
}
```

Per-declaration applicability. Depth is inclusive from attachment zero; omitted is unbounded. Targets filter receiving roles; omitted matches all, empty none. StopAt stops at a matching descendant and its subtree; it does not stop the introducing node. Core enforces scope; authors choose appropriate limits.

See the [strategy contract](../../contracts/strategy.md) for ownership, support fallback, scope, agreement and observable acceptance. The [usage guide](../../guides/strategies.md) shows common/custom declarations. Implementations must preserve typed identities, control state and accessibility; a supported type vocabulary does not imply every backend implements every value. Verify this type through the corresponding factory/query, scope and blocking scenarios rather than assuming toolkit behavior.
