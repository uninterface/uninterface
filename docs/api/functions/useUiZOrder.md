# useUiZOrder

Give a reusable/native composition an outward stacking identity. Exported from `@uninterface/uninterface`.

## API

Call during Vue setup: `useUiZOrder(order?: MaybeRefOrGetter<UiZOrder | undefined>)`. Returns a stable `handle`, readonly computed `resolved` and `snapshot`, and `describe()` for logical/physical diagnostics. Registers before client mount, attaches rendered roots, retains v-show/KeepAlive identity and releases on unmount. It adds no DOM wrapper. Consume a prop with a getter to preserve reactivity; expose the handle for special integration.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
