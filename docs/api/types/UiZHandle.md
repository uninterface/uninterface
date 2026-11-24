# UiZHandle

Opaque, application-owned participant identity. Exported from `@uninterface/uninterface`.

## API

Readonly `id: symbol`, `domain: symbol`, `label: string`. Obtain a handle from `useUiZOrder`; never construct one or treat its resolved CSS value as identity. Released handles remain unavailable and are never reassigned.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
