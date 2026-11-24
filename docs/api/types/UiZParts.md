# UiZParts

Ordering declarations for layout-owned allocations. Exported from `@uninterface/uninterface`.

## API

A readonly name/index record of `UiZPartOrder`, or a readonly list of `{ part: UiZPartSelector; order: UiZPartOrder }`. Region names and canonical zero-based indices follow the owning layout contract. Alias normalization precedes duplicate validation.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
