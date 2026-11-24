# UiZPartOrder

Ordering inside one allocation scope. Exported from `@uninterface/uninterface`.

## API

Optional `band: UiZBand` with finite `position`, OR `above`/`below` arrays of `UiZPartSelector`. It cannot change the allocation parent. A child component and its allocation have separate identities.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
