# UiRegionLayoutProps

Interface exported from `@uninterface/uninterface` for direct or computed [UiRegionLayout](../components/UiRegionLayout.md) bindings:

```ts
interface UiRegionLayoutProps extends Omit<UiLayoutProps, 'division' | 'wrap' | 'align'> {
  align?: Exclude<UiLayoutProps['align'], 'baseline'>
  navigationRegion?: 'start' | 'end'
  division?: UiRegionLayoutDivision
  scrollPolicy?: UiRegionScrollPolicy
  resizeBoundaries?: readonly UiRegionResizeBoundary[]
  zParts?: UiZParts
}
```

The shared props are direction, align, width, height, scroll, aria-label, zOrder and zParts. All are optional; defaults are documented by the component. [UiZLayoutProps](UiZLayoutProps.md) defines component and allocation stacking. The optional [UiRegionScrollPolicy](UiRegionScrollPolicy.md) selects grouped scrolling in a bounded host; its validation and fixed-membership restrictions apply. Division is a named region object instead of a positional child array. Wrapping and baseline alignment are not part of the region arrangement.

Business controls may expose these props through a target-named binding such as `bindings.regionLayout`; UiRegionLayout needs no knowledge of the producer. Supply content through its named slots. Backend styles, pixel sizes, responsive detection and business controls are not stored in this type.

The component reference defines implementation obligations, failures, and observable acceptance. Core validates the current configuration and keeps named region identity across reactive updates.

See [UiRegionResizeBoundary](UiRegionResizeBoundary.md) for the optional ordinary-layout interactions. Resizing cannot be combined with scrollPolicy; zParts can.

`navigationRegion` identifies an entire supporting allocation as navigation. It coordinates boundary ownership with matching menus and cannot be combined with scrollPolicy. It also gives UiNavbar its orientation: vertical in a side allocation of a horizontal layout, horizontal in a top/bottom allocation of a vertical layout. It expresses purpose, not border styling.
