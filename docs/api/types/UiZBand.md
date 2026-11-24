# UiZBand

Global ordering significance. Exported from `@uninterface/uninterface`.

## API

`surface | layer | group | local`, in decreasing significance. A later-band descendant cannot restart an earlier band. A later surface dominates all suffix groups/layers of an earlier one.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
