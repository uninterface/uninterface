# UiStrategyDeclaration

Import type from `@uninterface/uninterface`.

```ts
interface UiStrategyDeclaration {
  readonly identity: UiStrategyIdentity
  readonly scope: Readonly<UiStrategyScope>
  readonly answers: readonly UiStrategyAnswer[]
}
```

One immutable presentation declaration produced by a family factory. Pass it to use, not block. Multiple occurrences contribute separately. Independent query answers are independently optional, not an atomic bundle.

See the [strategy contract](../../contracts/strategy.md) for ownership, support fallback, scope, agreement and observable acceptance. The [usage guide](../../guides/strategies.md) shows common/custom declarations. Implementations must preserve typed identities, control state and accessibility; a supported type vocabulary does not imply every backend implements every value. Verify this type through the corresponding factory/query, scope and blocking scenarios rather than assuming toolkit behavior.
