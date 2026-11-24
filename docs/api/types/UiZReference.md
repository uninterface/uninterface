# UiZReference

Reference to a registered participant. Exported from `@uninterface/uninterface`.

## API

A registered component public instance, issued `UiZHandle`, Vue ref containing either, or null/undefined while pending. Core resolves identity through registration, never `$el` traversal. Unknown native objects do not automatically join stacking.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
