# UiZPartSelector

A layout-local allocation selector. Exported from `@uninterface/uninterface`.

## API

A string name/canonical index, zero-based numeric index, registered component reference, explicit handle, or pending null/undefined. A known live reference outside this layout fails. Instance selectors follow keyed moves; indices follow source positions.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
