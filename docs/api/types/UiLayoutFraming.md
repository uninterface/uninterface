# UiLayoutFraming

Readonly interface exported from `@uninterface/uninterface` describing presentation of layout allocations.

```ts
interface UiLayoutFraming {
  readonly separators?: 'none' | 'visible'
  readonly regions?: Readonly<Record<string, {
    readonly elevation?: 'flat' | 'raised'
  }>>
}
```

Pass to [uiLayoutFraming](../../strategies/uiLayoutFraming.md). Defaults are no separators and flat surfaces. Region names are logical allocation identities; the initial UiRegionLayout consumer supports start/main/end. This open name map does not imply support by other layouts. Backend owns colors, line dimensions and shadows. Raised treatment applies only at shared edges facing lower neighbours, in either arrangement direction; it is not header-specific. Main can have two raised edges, end a raised footer edge. No whole-perimeter shadow, outer border, content insets, resizing or stacking order is implied. See [layout framing](../../guides/layout-framing.md) for examples and observable verification.
