# createUiStrategy

Import from `@uninterface/uninterface`. Defines one reusable custom strategy family. Create/export it once, then call the returned factory to declare scoped presentation preferences.

```ts
createUiStrategy<T>(definition: {
  name: string
  answers: (value: T) => readonly UiStrategyAnswer[]
}): UiStrategyFactory<T>
```

The name is diagnostic; the returned callable's unique symbol key is identity. `answers` runs synchronously at declaration creation, validates custom arguments and returns typed `query.answer(value)` records. Unexpected errors propagate. Each call accepts `(value, { scope? }?)`, copies/freezes the scope arrays and answer list, and returns an immutable declaration. A declaration's answer values are not deep-cloned: authors must keep structured answer values immutable. Negative/fractional/nonfinite depth throws.

Common and custom factories share the same mechanism. Backends understand query contracts rather than custom family names. Independent answers are not an atomic presentation bundle. See [custom strategy examples](../../guides/strategies.md#common-and-custom-declarations) and the [strategy contract](../../contracts/strategy.md).

Implementation responsibility: preserve unique identity and immutable declaration structure; never transfer business state ownership to the strategy. Verify argument checking, distinct same-name families, scope capture, blocking by family and use of common/custom queries.
