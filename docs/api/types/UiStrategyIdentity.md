# UiStrategyIdentity

Import type from `@uninterface/uninterface`.

```ts
interface UiStrategyIdentity { readonly kind: 'strategy'; readonly key: symbol; readonly name: string }
```

Unique reusable family identity. Callable factories implement this interface and can be passed directly to block. The name is diagnostic; key equality determines identity.

See the [strategy contract](../../contracts/strategy.md) for ownership, support fallback, scope, agreement and observable acceptance. The [usage guide](../../guides/strategies.md) shows common/custom declarations. Implementations must preserve typed identities, control state and accessibility; a supported type vocabulary does not imply every backend implements every value. Verify this type through the corresponding factory/query, scope and blocking scenarios rather than assuming toolkit behavior.
