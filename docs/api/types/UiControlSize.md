# UiControlSize

Import type from `@uninterface/uninterface`.

```ts
type UiControlSize = -2 | -1 | 0 | 1 | 2
```

Discrete ordinal size levels. Zero requests ordinary size, -1 smaller and 1 larger; -2/2 are outer extensions. No arithmetic accumulation, proportional scaling, pixel geometry or uniform cross-component height is implied. Native size scales are backend-owned. Unsupported levels generalize toward zero; omission can preserve a configured native default different from explicit zero.

See the [strategy contract](../../contracts/strategy.md) for ownership, fulfillment, scope, agreement and observable acceptance. The [usage guide](../../guides/strategies.md) shows common/custom declarations. Implementations must preserve typed identities, control state and accessibility; a shared request vocabulary does not imply five distinct native sizes. Verify this type through the corresponding factory/query, scope and blocking scenarios rather than assuming toolkit behavior.
