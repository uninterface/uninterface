# UiLayout

Assigns space to its children and arranges them in meaningful source order. A business author requests horizontal/vertical flow, division, extent, wrapping, and scrolling through ordinary reactive props. The selected backend owns spacing and geometry. It adds no card border, heading, page semantics, or typography.

Import `UiLayout` from `@uninterface/uninterface`. It works without a UI context wrapper. The wider [layout contract](../../contracts/layout.md) also describes future features; those are not all implemented here.

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { UiLayout, useUiResponsive, type UiLayoutProps } from '@uninterface/uninterface'

const { context } = useUiResponsive()
const layout = computed<UiLayoutProps>(() =>
  context.value === 'mobile'
    ? { direction: 'vertical', division: 'content' }
    : { direction: 'horizontal', division: [2, 1] },
)
</script>

<template>
  <UiLayout v-bind="layout">
    <RecordEditorForm :initial-value="record" :save="save" />
    <SavedRecord :record="saved" />
  </UiLayout>
</template>
```

Independent form actions can use horizontal flow with wrapping. UiLayout preserves their source and keyboard order while the backend supplies spacing:

```vue
<UiLayout direction="horizontal" wrap>
  <UiButton
    :binding="form.bindings.submitButton"
    color="primary"
    variant="filled"
  >Save</UiButton>
  <UiButton
    :binding="form.bindings.resetButton"
    color="danger"
    variant="outline"
  >Reset</UiButton>
</UiLayout>
```

This arrangement retains each button's ordinary interaction; it introduces no toolbar keyboard navigation or shared selection state. Declare `layout.linear.v1`, `layout.reactive.v1`, and `layout.wrap.v1` alongside the buttons' requirements.

## Props and defaults

The props are [UiLayoutProps](../types/UiLayoutProps.md). Defaults are provisional API choices for this initial implementation.

| Prop | Values | Default and meaning |
|---|---|---|
| `direction` | `horizontal`, `vertical` | `vertical`; source-order flow along that axis |
| `align` | `start`, `center`, `end`, `stretch`, `baseline` | `stretch`; align child allocations across the arrangement direction |
| `division` | `content`, `equal`, or an array of positive numbers / `content` | `content`; size each child by its content on the arrangement axis. `equal` divides available space equally; an array assigns one entry per participating child |
| `width` | `full`, `content` | `full`; fill the parent's offered width, or size by content within that offer |
| `height` | `full`, `content` | `content`; grow with content, or fill a definite parent height |
| `wrap` | boolean | `false`; when true, horizontal content-sized items continue on the next row |
| `scroll` | `none`, `horizontal`, `vertical`, `both` | `none`; content can overflow to ancestors. Other values create a keyboard-focusable, named scroll region |
| `aria-label` | string | Required nonempty accessible name when the layout scrolls |

`aria-label` supplies an accessible name, not visible text. The backend applies it to the actual scrollable region rather than an arbitrary outer wrapper. It is used when scrolling is enabled; non-scroll layouts do not acquire a region role or accessible name from this prop. The current scrolling contract requires a nonempty `aria-label`; `aria-labelledby` alone does not satisfy that requirement.

The default slot contains the participating children. There are no custom emitted events or exposed instance methods. Attributes/listeners target the layout root. Each child receives a stable backend-owned allocation wrapper; a component's multiple rendered roots share its one allocation. An empty slot yields an empty layout.

Fragments and `v-for` are transparent. Comments, empty text, and `v-if` false branches do not participate. Nonempty text is a child. Use explicit unique Vue keys for dynamic children to preserve their identity when inserted/reordered. An unkeyed child follows Vue's positional identity rules. `v-show` retains its allocation wrapper; use `v-if` to remove an allocation. Control lifetime remains business-owned.

## Space division and ordering

UiLayout supplies theme-owned separation between peer items without an outer content inset. Use scrolling UiLayout when content should align with neighboring surfaces without another inset. Backends contain supported focus treatments within this unpadded boundary. Choose [UiContent scrolling](UiContent.md) when an additional content inset is actually intended. UiFlowLayout retains that peer spacing. Use UiRegionLayout for adjoining region allocations: it shares the allocation machinery but requests no region separation. These rules are local to each arrangement; nesting one layout in another does not override the inner layout's spacing.


A `[2, 1]` horizontal division gives the first child twice the second child's width after backend spacing is deducted. Each number is positive and finite. The array must have exactly one entry per participating child; update it with dynamic child sets. `equal` adapts to the current count, including zero.

Mixed division, for example `['content', 1, 'content']`, keeps the first and last children content-sized and gives the middle child the remainder. This is useful inside a bounded host for header/content/footer compositions; it does not define a frame or modal itself. Numeric shares require `width="full"` horizontally or `height="full"` vertically. Content allocation can exceed available space; ancestors or explicitly requested scrolling keep it reachable. In a vertical layout, content-sized rows retain their intrinsic height even inside a bounded scrollport; they must not shrink below their content merely to fit the host. This applies both to `division="content"` and individual `content` entries in mixed division. Numeric rows retain their explicit allocation rules. No implicit clipping or minimum child size is introduced. A component with an intrinsic minimum size can overflow its assigned track.

Wrapping is supported only with `direction="horizontal"` and `division="content"`. It preserves DOM, reading, and keyboard order. There is no CSS-only reordering prop. Author the intended order through slots/child arrays; updating props changes geometry without replacing the child tree.

## Cross-axis alignment

`align` positions each child allocation across the arrangement direction: vertically for horizontal layouts and horizontally for vertical layouts. Default stretch fills that allocation's cross axis; start/center/end fit the allocation to its content under available-space constraints. Descendants retain their own sizing behavior; stretch does not force an intrinsically sized button to fill its wrapper. Horizontal edges follow inherited LTR/RTL direction. In a wrapped flow, alignment applies within each row, not across shared grid columns.

Content division packs items at the arrangement start instead of distributing unused space along that axis. This does not change ratio or mixed allocation. Concrete gaps remain backend-owned. Explicit align values require `layout.align.v1`.

`align="baseline"` selects first text-baseline alignment for horizontal layouts, both Grid-style allocation and wrapped flow. Each wrapped row aligns independently. It additionally requires `layout.baseline.v1`; vertical baseline requests fail loudly. UiRegionLayout and UiGridLayout do not accept this option.

```vue
<UiLayout direction="horizontal" align="baseline" wrap>
  <OrderSearch :value="keyword" :search="searchOrders" />
  <UiButton @click="clearFilters">Clear filters and sorting</UiButton>
</UiLayout>
```

The layout aligns the baselines exported by its peers. Supported compound editors expose their first editable row through their wrappers; buttons expose their visible caption. Above-labelled fields expose the first label row, while hidden/floating labels use the editor row. This does not align lower editors underneath labels of different heights or make control surfaces equally tall. Arbitrary opaque content retains its native baseline or synthesized fallback. See [field alignment](../../guides/field-alignment.md#selectable-peer-baseline-alignment) for component responsibilities and verification.

## Reactive props and responsive context

UiLayout receives ordinary Vue props directly or through `v-bind`. It has no detector and does not know the producer of those props. A template expression, computed object, or business layout control can supply them; see [responsive layouts](../../guides/responsive-layouts.md).

[useUiResponsive](../functions/useUiResponsive.md) independently exposes a read-only detected context ref. The consumer chooses its layout policy using that context. Application assembly may replace detection through [createUiResponsive](../functions/createUiResponsive.md); neither UiLayout nor its backend chooses breakpoints or device categories.

Coordinate dependent changes in one binding. For example, changing a horizontal ratio to an unbounded vertical flow also requires content-based allocation. UiLayout applies defaults to omitted props, validates current values on every render, and preserves keyed children during updates. It cannot inspect inactive computed branches. Declare the capabilities required by all possible policies in the application/composition requirements and test their transitions.

## Extent and scrolling

Full height and vertical scrolling require a definite height supplied by an ancestor layout/host. They do not mean viewport height, and this component does not invent a pixel height. The backend uses the parent's allocation; automatic detection of an unbounded external host is not implemented. In that unsupported integration the expected scrollport may not form, so the embedding application must establish and test the bound.

Each requested axis scrolls automatically on overflow, rather than forcing a permanent scrollbar. If content also overflows the other axis, it remains reachable through scrolling as a safety fallback; requesting one axis does not authorize clipping the other. With `scroll="none"`, overflow stays visible and may be handled by ancestors. Nested scroll regions receive `role="region"`, the supplied accessible name, and a keyboard focus target. Native scrollbar appearance belongs to the platform/backend.

A composed bounded body can use:

```vue
<UiLayout height="full" :division="['content', 1, 'content']">
  <header>Summary</header>
  <UiContent height="full" scroll="vertical" aria-label="Details">
    <Details />
  </UiContent>
  <footer>Actions</footer>
</UiLayout>
```

This three-child example assumes header and footer are present. If a business composition makes them optional, it must produce the corresponding division entries, or choose a composition contract that performs that mapping.

## Implementation and capability obligations

Core applies defaults, validates current options, flattens participating children, preserves their keys, and checks requirements. Backends receive [UiLayoutViewBinding](../backend/layout.md#uilayoutviewbinding), render child allocations, and own geometry, gaps, and scroll focus styling. Core does not generate CSS or prescribe backend DOM. Invalid options, nonpositive shares, mismatched counts, unnamed scrollports, and unsupported combinations throw. Build manifests must declare statically known requirements; runtime checking is not an arbitrary template scanner.

| Capability | Covered surface |
|---|---|
| `layout.linear.v1` | Horizontal/vertical source-order arrangement and content/full extent |
| `layout.division.v1` | Equal, proportional, and content-plus-remainder allocation |
| `layout.reactive.v1` | Reactive prop updates with retained keyed content, editing state, and meaningful focus |
| `layout.align.v1` | Explicit cross-axis alignment of child allocations |
| `layout.baseline.v1` | First-baseline alignment in horizontal allocations, including wrapped rows |
| `layout.wrap.v1` | Horizontal content flow across rows |
| `layout.scroll.v1` | Named, focusable overflow regions within supplied bounds |

Use [UiGridLayout](UiGridLayout.md) for equal-width shared columns and automatic rows, [UiRegionLayout](UiRegionLayout.md) for adjustable adjacent region splits, and [UiDrawer](UiDrawer.md) with [UiDrawerLayout](UiDrawerLayout.md) for retained drawer expansion and docking. UiLayout itself supplies no resize or drawer state. General grid spans/placement, reversed order, compact rails, allocation persistence, and general strategy negotiation are outside these APIs. Use ordinary Vue composition for conditional children. Card/header/footer presentation belongs to separate frame/composition contracts.

## Verification

The record editor uses this component for its desktop split/mobile stack. Control-level tests check option resolution, invalid configurations, fragments, and keys. Production-bundle DOM tests check context changes preserve input elements, values, and focus. Shared browser acceptance measures the ratio and vertical ordering against each selected backend. Scrolling and wrapping need browser geometry evidence; DOM simulation does not establish it. Browser execution remains required before claiming complete layout compatibility.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

`zParts?: UiZParts` orders owned allocations using zero-based participating source-order indices or direct child refs/handles. Shorthand maps and entry lists normalize identically. Keyed identities survive moves; indices follow current source order. Wrapper and child declarations remain distinct.

## Layout density

[uiLayoutDensity](../../strategies/uiLayoutDensity.md) requests numeric peer spacing (-1 compact, 0 backend default, 1 spacious). It changes separation, including documented backend removal of surplus direct-item row whitespace, while preserving native control surfaces/hit targets, typography and content insets. No strategy or conflict retains the original backend default. Scope and query barriers apply to nested layouts; see the [usage guide](../../guides/layout-density.md) for local grouping and observable checks.
