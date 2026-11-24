# UiStrategyQuery

Import type from `@uninterface/uninterface`.

```ts
interface UiStrategyQuery<T, Context = void> {
  readonly kind: 'query'
  readonly key: symbol
  readonly name: string
  readonly agree: (values: readonly T[], context: Context) => T | undefined
  answer(value: T): UiStrategyAnswer
}
```

Typed query identity and explicit agreement. Undefined means no agreement. The query is created once and shared by authors/participants; answer enforces the value type. Custom agreements own combination semantics; common agreements require equal supported values.

See the [strategy contract](../../contracts/strategy.md) for ownership, support fallback, scope, agreement and observable acceptance. The [usage guide](../../guides/strategies.md) shows common/custom declarations. Implementations must preserve typed identities, control state and accessibility; a supported type vocabulary does not imply every backend implements every value. Verify this type through the corresponding factory/query, scope and blocking scenarios rather than assuming toolkit behavior.

Queries may declare a second generic context type. Participants then provide a context getter to useUiStrategy/node.query (or a render-time snapshot to node.resolve). Agreement receives that context synchronously; reactive reads remain tracked. Existing context-free queries default to void. Collection header selection uses this to evaluate selectors before agreeing on selected adaptation identity. Verify context changes, selector dependencies and unchanged scope/block semantics.
