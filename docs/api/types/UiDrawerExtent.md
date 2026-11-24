# UiDrawerExtent

Import from `@uninterface/uninterface`:

```ts
type UiDrawerExtent = number | `${number}px` | `${number}rem` | `${number}em` | `${number}%`
```

Numbers are pixels. Values must be finite and positive; percentages cannot exceed 100. Arbitrary CSS expressions, zero and negative values are rejected at runtime.

Used by [UiDrawerSizingProps](UiDrawerSizingProps.md) for outer width at start/end or outer height at top/bottom. Percentages resolve against the usable viewport axis, or the docked host axis after reserving minMainExtent. rem uses root font size; em uses the surface font size. Core resolves constraints; backend measurements provide available space and font metrics. Available space is a hard upper bound even if an authored minimum is larger. Verify units, invalid values and clamping without losing the user's remembered preference.
