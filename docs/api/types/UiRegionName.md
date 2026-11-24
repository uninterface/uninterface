# UiRegionName

`'start' | 'main' | 'end'`, exported from `@uninterface/uninterface`. Identifies a stable UiRegionLayout allocation, independently of slot presence or array position. Main is a local role, not an HTML landmark.

Used by [UiRegionResizeBoundary](UiRegionResizeBoundary.md). Core validates names; backends render named allocations while preserving content identity. Verify that removing start does not turn main into a different logical region. See [UiRegionLayout](../components/UiRegionLayout.md).
