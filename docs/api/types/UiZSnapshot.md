# UiZSnapshot

One immutable domain allocation version. Exported from `@uninterface/uninterface`.

## API

Readonly `version`, `slots` (`band`, `depth`, `width`) and `entries: readonly UiZResolved[]`. All entries share the slot vector. Schema growth and numeric changes publish together; snapshots must not be mutated.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
