# UiFlowLayout

Arrange an ordered sequence of peer items, optionally continuing onto new lines as space permits. Use it for actions, filters, tags, or repeated content without a privileged main region. Zero items is valid. Import from `@uninterface/uninterface`.

```vue
<UiFlowLayout direction="horizontal" align="center" wrap>
  <SearchControl />
  <CategoryFilter />
  <UiButton>Search</UiButton>
</UiFlowLayout>
```

The component specializes [UiLayout](UiLayout.md) with content allocation. It reuses the backend layout view and adds no markup, styling boundary, toolbar navigation, selection behavior, or automatic list semantics. Use [UiGridLayout](UiGridLayout.md) for equal-width columns aligned across rows. Use [UiRegionLayout](UiRegionLayout.md) for main/supporting regions and UiLayout for proportional division.

## Props

All properties of [UiFlowLayoutProps](../types/UiFlowLayoutProps.md) are optional.

| Prop | Values | Default and meaning |
|---|---|---|
| `direction` | `vertical`, `horizontal` | `vertical`; source-order sequence |
| `align` | `start`, `center`, `end`, `stretch`, `baseline` | `stretch`; alignment of item allocations across the flow direction |
| `wrap` | boolean | `false`; horizontal items may continue onto new rows when enabled |
| `width` | `full`, `content` | `full`; use the parent's offered width |
| `height` | `full`, `content` | `content`; grow with content |
| `scroll` | `none`, `horizontal`, `vertical`, `both` | `none`; optional whole-flow scrollport |
| `aria-label` | string | Required nonempty accessible name when scrolling is enabled |

Allocation is always content-based. Supplying `division` throws; choose UiLayout for equal shares or ratios. Vertical wrapping is unsupported and throws. Changing direction in a reactive binding must also disable wrapping when selecting vertical flow.

Props are ordinary Vue properties and may come from computed objects or a control's target-named binding. The component has no responsive token or detector dependency. Attributes and listeners target the underlying layout root; aria-label targets the actual scrollport. No custom events or instance methods are exposed.

## Items and order

Supply content through the default slot. Each participating direct child is one item. Fragments and v-for are transparent; a child component's multiple roots share one allocation. Empty text, comments and false v-if branches consume no allocation. No default content or placeholder is invented for an empty flow. Named slots are unsupported.

Source order determines reading and keyboard order. Horizontal flow follows the inherited LTR/RTL direction; wrapped rows continue downward. Vertical flow proceeds top to bottom. Wrapping never changes data order or splits an item into several outer allocations. Internal text wrapping belongs to the item.

Give dynamic children stable unique keys. Property changes and additions/removals preserve surviving keyed content, including editing state and meaningful focus. Removing a focused item needs an appropriate focus destination supplied by the owning composition. v-show retains allocation; v-if removes it.

## Sizing, alignment and continuation

Items use their content size along the flow direction and stay together at its starting edge; spare space is not divided into equal or proportional shares. Concrete gaps belong to the backend/theme. Wrapping distributes complete items into independently laid-out rows; it does not establish shared grid columns.

Alignment operates across the flow direction: vertically within a horizontal row, horizontally within a vertical sequence. Start/end follow the applicable logical edge, including RTL for vertical flow's horizontal alignment. Stretch gives the allocation the available cross-axis space (the row's height when wrapping); it does not force an intrinsically sized descendant such as a button to grow. Child components still honor their own sizing contracts. For example, a full-width control can use a stretched allocation, while an inline button can retain its natural width.

With non-stretch alignment, an allocation fits its contents subject to available space and the child's constraints. Explicit `align="baseline"` aligns first text baselines within each horizontal row and additionally requires `layout.baseline.v1`. Vertical baseline requests fail loudly. Other alignment values do not align text baselines. Alignment does not distribute free space between items or align columns across rows. See [field alignment](../../guides/field-alignment.md#selectable-peer-baseline-alignment) for compound controls and label-placement distinctions.

An oversized item can wrap internally if it supports that behavior, or overflow. Flow wrapping alone does not guarantee every child fits. The declared scrolling policy or a reachable ancestor must keep oversized content accessible; there is no implicit clipping or automatic shrinking of controls into unreadable sizes. Full extent and scrolling require the same bounded-host integration as UiLayout and never imply viewport dimensions.

## Implementation and acceptance

Core supplies `layout.flow.v1`; the composition fixes content allocation and forwards flow properties and keyed content to UiLayout. No backend UiFlowLayout module is required. Backends fulfill linear allocation, reactive updates, cross-axis alignment, wrapping and named scrolling through their UiLayout view. Alignment targets allocation wrappers; core does not prescribe concrete DOM or CSS.

Declare `layout.flow.v1`, `layout.linear.v1`, and `layout.reactive.v1`, plus `layout.wrap.v1`, `layout.align.v1` for explicit alignment, and `layout.scroll.v1` as used. Unsupported combinations and missing capabilities fail loudly. Ordinary default stretch is part of the shared linear behavior.

The interactive demo offers direction, wrapping, alignment and item-participation controls. Unit tests validate alignment vocabulary and combinations. Production DOM tests check item order, empty flows, stable focus/value, accessible scrolling, and failures. Shared browser acceptance measures actual wrapping and alignment using the same demo; DOM simulation is not proof of browser geometry or accessibility conformance.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

`zParts?: UiZParts` orders owned allocations using zero-based participating source-order indices or direct child refs/handles. Shorthand maps and entry lists normalize identically. Keyed identities survive moves; indices follow current source order. Wrapper and child declarations remain distinct.

## Layout density

[uiLayoutDensity](../../strategies/uiLayoutDensity.md) requests numeric peer spacing (-1 compact, 0 backend default, 1 spacious). It changes separation, including documented backend removal of surplus direct-item row whitespace, while preserving native control surfaces/hit targets, typography and content insets. No strategy or conflict retains the original backend default. Scope and query barriers apply to nested layouts; see the [usage guide](../../guides/layout-density.md) for local grouping and observable checks.
