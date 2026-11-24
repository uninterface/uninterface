# UiGridLayout

Arrange peer items in equal-width columns that align across rows. Items fill each row in source order and continue onto the next row after the specified column count. Import from `@uninterface/uninterface`.

```vue
<UiGridLayout :columns="4">
  <RecordSummary
    v-for="record in records"
    :key="record.id"
    :record="record"
  />
</UiGridLayout>
```

Use [UiFlowLayout](UiFlowLayout.md) for independently wrapped, content-sized items. A grid establishes shared column tracks; it is not a table, selectable list or ARIA `grid` widget. It adds no borders, backgrounds or item actions.

## Props and slots

| Prop | Values | Meaning |
|---|---|---|
| `columns` | Required positive safe integer | Exact number of equal-width tracks. Use `:columns="4"`, not a string attribute. |
| `height` | `content` (default), `full` | Grow with rows, or use a definite height supplied by the parent. |
| `scroll` | `none` (default), `horizontal`, `vertical`, `both` | Whole-grid overflow policy; scrolling requires a nonempty `aria-label`. |
| `aria-label` | string | Accessible name for the actual scrollport, when scrolling is enabled. |

The grid fills the offered width. It does not expose `width`, `direction`, `division`, `wrap` or `align`; those linear-layout properties fail loudly rather than falling through as HTML attributes. Named slots are unsupported. There are no custom events or instance methods. Other attributes and listeners target the grid root.

Each participating default-slot child occupies one cell. Fragments and `v-for` are transparent. Comments, whitespace-only text and false `v-if` branches take no cell. A child component with multiple roots still receives one allocation; its internals are not flattened. `v-show` retains its cell. Empty content produces no placeholder or rows.

## Placement, sizing and identity

- Horizontal order follows inherited LTR/RTL direction; rows proceed downward. Reading and keyboard order follow source order. There is no dense packing or visual reordering.
- Every column has the same allocated width after backend-owned gaps. An incomplete final row keeps those widths and starts at the logical row start; remaining items do not expand across unused columns. Even fewer items than `columns` retain the requested tracks.
- Each row sizes to its tallest content. Cell allocations stretch across that row; different rows can have different heights. Child controls retain their own sizing behavior—an intrinsically sized button is not forced to fill its allocation.
- The parent owns available space. A grid introduces no outer inset. Use UiContent for an inset content area; nested layouts keep their own local spacing.
- `columns` is reactive. Changing it rearranges the same keyed cells without recreating their children, drafts or controls. Stable unique Vue keys are required for reliable identity when inserting/reordering items. Removing a focused child requires the owning composition to choose the next focus destination.

`columns="auto"`, automatic breakpoint detection, minimum item widths, unequal columns, spanning and explicit cell placement are not supported. A business layout control or computed value can supply `columns`, independently using [useUiResponsive](../functions/useUiResponsive.md) if needed. Four means four at every viewport width until that value changes.

## Overflow and hosting

Rows grow naturally with `height="content"`. `height="full"` requires a definite parent allocation; it does not mean viewport height or distribute extra height equally across rows. Rows remain content-sized at the start of the grid.

Vertical/both scrolling requires `height="full"`. The scrollport has `role="region"`, its supplied name and `tabindex="0"`. If the other axis also overflows, it remains scrollable rather than clipped. With `scroll="none"`, overflow remains visible for an ancestor to handle. Oversized content is not silently shrunk or clipped; children must support wrapping or an appropriate scrolling ancestor must keep them reachable. `aria-label` is consumed only for a scrolling region.

Like other allocation containers, the grid masks the enclosing application's height offer for descendants; it does not claim general propagation of measured local allocations to nested application hosts.

## Implementation and acceptance

Core supplies `layout.grid.v1`: validation, child allocation, keyed identity, CSS Grid geometry and scroll semantics. No backend `UiGridLayout.vue` is required. Backends supply `layout.spacing.v1` and their static `./layout` module's [UiLayoutPresentation](../backend/layout.md#uilayoutpresentation). That policy supplies peer gaps through native spacing classes or CSS gap expressions. It must not add decoration, reorder children or override core geometry. Business components never import this module or choose pixel spacing.

Declare both capabilities when requiring this component. Missing modules fail during assembly; missing capabilities and invalid props fail visibly. The component does not require the backend linear-layout view, toolkit initialization, a responsive detector or a form control.

Acceptance covers incomplete rows, shared columns, source order/RTL, empty and multi-root content, retained keyed input/focus through column changes, validation and named scrolling. The icon gallery is a real four-column consumer. Browser geometry tests measure column alignment and backend spacing at wide and narrow viewport sizes; DOM simulation alone does not establish geometry or visual conformance.

## Content and focus clearance

Grid scrolling remains an allocation-only surface; it adds no outer content insets. Use a non-scrolling grid inside a [scrolling UiContent](UiContent.md) when an inset area is intended; use grid scrolling for aligned content without another gutter. Backends contain supported focus treatments within the unpadded allocation. The grid scroll host uses the backend's inward focus treatment so its own indicator remains within tight allocations. See [scrolling content](../../guides/scrolling-content.md).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

`zParts?: UiZParts` orders owned allocations using zero-based participating source-order indices or direct child refs/handles. Shorthand maps and entry lists normalize identically. Keyed identities survive moves; indices follow current source order. Wrapper and child declarations remain distinct.

## Layout density

[uiLayoutDensity](../../strategies/uiLayoutDensity.md) requests numeric peer spacing (-1 compact, 0 backend default, 1 spacious). It changes separation, including documented backend removal of surplus direct-item row whitespace, while preserving native control surfaces/hit targets, typography and content insets. No strategy or conflict retains the original backend default. Scope and query barriers apply to nested layouts; see the [usage guide](../../guides/layout-density.md) for local grouping and observable checks.
