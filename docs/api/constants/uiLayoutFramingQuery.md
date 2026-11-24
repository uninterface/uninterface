# uiLayoutFramingQuery

Typed `UiStrategyQuery<UiLayoutFraming>` exported from `@uninterface/uninterface`. Queries presentation of allocated layout parts. UiRegionLayout consumes it with the `region-layout` target; backends receive the agreed result.

Applications normally use [uiLayoutFraming](../../strategies/uiLayoutFraming.md). Custom strategies can answer this query; ordinary scope and query blocking apply. Supported answers agree only when their complete normalized profiles match. Conflicts restore the default presentation, with no priority or partial merging. See [layout framing](../../guides/layout-framing.md) for responsibility and verification.
