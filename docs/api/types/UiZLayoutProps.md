# UiZLayoutProps

Common stacking props for participating layouts. Exported from `@uninterface/uninterface`.

## API

Extends `UiZOrderProps` with `zParts?: UiZParts`. Implemented by UiLayout, UiFlowLayout, UiGridLayout and UiRegionLayout. It does not imply zParts support on other components.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
