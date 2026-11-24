# UiStrategyBlock

Import type from `@uninterface/uninterface`.

```ts
type UiStrategyBlock = UiStrategyIdentity | UiStrategyQuery<any, any>
```

An incoming propagation barrier selector. Family identity removes matching declarations; query identity blocks all incoming answers to that concern while preserving other answers. Local/descendant declarations remain eligible. No declaration order precedence is introduced.

See the [strategy contract](../../contracts/strategy.md) for ownership, support fallback, scope, agreement and observable acceptance. The [usage guide](../../guides/strategies.md) shows common/custom declarations. Implementations must preserve typed identities, control state and accessibility; a supported type vocabulary does not imply every backend implements every value. Verify this type through the corresponding factory/query, scope and blocking scenarios rather than assuming toolkit behavior.
