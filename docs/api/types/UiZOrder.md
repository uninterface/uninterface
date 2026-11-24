# UiZOrder

Outward stacking declaration. Exported from `@uninterface/uninterface`.

## API

`{ band?: UiZBand; parent?: UiZReference; layer?: string }` combined with either `{ position?: number }` or `{ above?: readonly UiZReference[]; below?: readonly UiZReference[] }`. Position must be finite. Layer and parent are alternatives. Comparisons require the same band and parent; unresolved comparative refs remain pending.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
