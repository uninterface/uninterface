# useUiStacking

Access app-local stacking integration. Exported from `@uninterface/uninterface`.

## API

Call during setup. `resolve(reference)` returns a registered handle; `describe(reference)` returns logical/physical diagnostics and a pending-comparison count. `fromElement(element)` finds an existing physical ancestor registration. `registerLayer(name, {above?, below?})` installs an application-lifetime extension relative to known layer names. Duplicate/contradictory definitions fail. Readonly computed `snapshot` exposes diagnostics. It does not infer business relationships from arbitrary DOM or share domains across apps.

## Ownership and verification

Core owns identity, normalization, resolution and lifetime. Backend views attach actual rendering targets and preserve native interaction. Consumers supply relationships and preserve documented scope boundaries. Verify logical order and keyed identity through updates; use real-browser overlap and pointer checks for painting. See [dynamic stacking](../../guides/dynamic-z-order.md) and the [contract](../../contracts/dynamic-z-order.md) for examples, failures and browser projection limits.
