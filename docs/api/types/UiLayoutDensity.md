# UiLayoutDensity

`type UiLayoutDensity = -1 | 0 | 1`, exported from `@uninterface/uninterface`.

Ordinal intent for layout peer spacing: -1 is compact, 0 is the backend default, and 1 is spacious. Values are not pixels, multipliers or control-size levels. The initial vocabulary is limited to these three integers.

Use with [uiLayoutDensity](../../strategies/uiLayoutDensity.md). Core validates declarations and resolves scoped agreement. Backends implement concrete spacing for UiLayout, UiFlowLayout, UiStartEndLayout and UiGridLayout. The [layout density guide](../../guides/layout-density.md) covers ownership and examples.

Verify invalid values are rejected, all three levels render, and changing density preserves controls and scoped resets. Geometry requires browser verification.
