# UiZResolved

Readonly diagnostic result for one participant. Exported from `@uninterface/uninterface`.

## API

`band`, `parent`, normalized `order`, authored `sequence`, `handle`, `chain`, `digits`, numeric `value`, `elevation`, unresolved `pending` handles, `source`, and `materialized`. `elevation` is the constraint-derived presentation elevation before sequence tie-breaking; it is distinct from the packed CSS value. Read through `useUiZOrder().resolved`; undefined before client registration or after removal. Values are outputs, not authoring inputs.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
