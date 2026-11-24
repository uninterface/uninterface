# UiRegionResizeBoundary

Readonly interface exported from `@uninterface/uninterface`, used by UiRegionLayout.resizeBoundaries.

```ts
interface UiRegionResizeBoundary {
  readonly between: readonly [UiRegionName, UiRegionName]
  readonly label: UiTextSource
  readonly min?: number
  readonly max?: number
}
```

Names identify two adjacent allocations in start/main/end order. Label must be meaningful and is the interactive separator's accessible name. Min/max limit the first region's percentage of the pair's combined allocation: defaults 10/90, with `0 < min < max < 100`. Both participating members require numeric division shares; initial values outside the limits throw. The arrangement must fill its axis and use stretch alignment. Missing members release the handle. Both adjacent boundaries can be enabled independently or together. Collapse and persistent/external split state are not supported.

Core owns adjustment and clamping. Backends own operable pointer/touch/keyboard handles and ARIA. Direction, extent, division, participation and limits changes reset adjustment; label/presentation changes preserve it. See [layout framing](../../guides/layout-framing.md) for complete ownership, examples and browser acceptance checks.

With multiple enabled boundaries, every adjustment preserves the selected pair's combined allocation and all other shares. All active pair limits are enforced together. Effective limits may narrow because of the neighbouring pair or the measured minima of direct UiContent roots in a vertical arrangement; ARIA and Home/End use those current effective limits. Disabling a boundary removes its constraint; absent pairs do not constrain surviving ones.

`label` accepts [UiTextSource](UiTextSource.md). Core resolves it reactively before presentation; changing text preserves identity and interaction state. Functions must return text synchronously without side effects. See [text-source usage and verification](../../guides/text-sources.md).

Vertical content/container reconciliation can redistribute allocations before a handle movement; insufficient height enables whole-arrangement scrolling. The [vertical resizing guide](../../guides/layout-framing.md#vertical-resizing-and-content-height) defines the supported content roots and observable guarantees. Horizontal behavior remains percentage-based.
