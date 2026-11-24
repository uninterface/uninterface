# UiZOrderError

Structured ordering failure. Exported from `@uninterface/uninterface`.

## API

Extends `Error`, with `code` (`declaration`, `domain`, `parent`, `scope`, `cycle`, `budget`, `realization`, `disposed`) and readonly declaration `sources`. Invalid logical updates retain the previous valid allocation; actual removal still occurs. Diagnose the declaration instead of silently replacing it.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
