# UiStrategyAnswer

Import type from `@uninterface/uninterface`.

```ts
interface UiStrategyAnswer {
  readonly query: UiStrategyQuery<any, any>
  readonly value: unknown
}
```

An erased contribution record stored by declarations. Construct with query.answer(value) for type checking; participants recover the type through shared query identity. Authors keep structured values immutable.

See the [strategy contract](../../contracts/strategy.md) for ownership, support fallback, scope, agreement and observable acceptance. The [usage guide](../../guides/strategies.md) shows common/custom declarations. Implementations must preserve typed identities, control state and accessibility; a supported type vocabulary does not imply every backend implements every value. Verify this type through the corresponding factory/query, scope and blocking scenarios rather than assuming toolkit behavior.
