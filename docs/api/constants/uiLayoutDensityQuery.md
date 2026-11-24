# uiLayoutDensityQuery

A `UiStrategyQuery<UiLayoutDensity>`, exported from `@uninterface/uninterface`, for querying optional peer-spacing intent and blocking incoming density contributions. Its symbol identity is shared by the common [uiLayoutDensity](../../strategies/uiLayoutDensity.md) family and custom contributors.

```ts
uiLayoutDensityQuery.answer(-1)
```

Values are -1 (compact), 0 (backend default), and 1 (spacious). Supported contributions require unanimity. Conflict or no answer retains backend defaults; values are not summed or prioritized. Consumers may pass the query to `UiStrategy.block` and supply a local declaration to reset a subtree.

Core owns scope/support filtering and agreement. Backends declare optional nonzero mappings in UiLayoutPresentation and render the agreed intent. See the [backend contract](../backend/layout.md#uilayoutpresentation) and [layout density guide](../../guides/layout-density.md).

Verify custom answers, family versus query blocking, conflicts, scoped application and default restoration. Runtime common-factory validation rejects invalid levels.
