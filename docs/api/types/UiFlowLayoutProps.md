# UiFlowLayoutProps

Type alias exported from `@uninterface/uninterface`:

```ts
type UiFlowLayoutProps = Omit<UiLayoutProps, 'division'>
```

Describes direction, cross-axis alignment, wrapping, extent, scrolling and accessible scroll naming for [UiFlowLayout](../components/UiFlowLayout.md). All members are optional. Content allocation is fixed; proportional division belongs to UiLayout.

Inherits [UiLayoutProps](UiLayoutProps.md), including `width`, `height`, `'aria-label'`, `zOrder` and `zParts`. The [stacking props](UiZLayoutProps.md) order the composition or its participating allocations independently of content division.

Use it to type a computed object or a business control's target-named binding passed through v-bind. Coordinate direction and wrapping together: vertical wrapping is unsupported. No responsive tokens, backend styles, control instances or child content are stored in this type; items use the component's default slot.

Core validates the current combination through UiLayout and backends fulfill the resulting geometry. The component reference defines exact defaults, child-sizing boundaries, errors and observable verification.
