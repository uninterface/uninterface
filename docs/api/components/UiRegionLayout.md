# UiRegionLayout

Arrange one main region with optional supporting regions along an axis. The regions have stable names, so adding or removing supporting content does not shift the meaning of allocation settings. Business compositions can give them roles such as header/content/footer or navigation/content/inspector.

Import `UiRegionLayout` from `@uninterface/uninterface`. It works without a UI context wrapper. Ordinary arrangements share [UiLayout](UiLayout.md) allocation logic with adjoining region boundaries, while grouped scrolling uses a dedicated backend region view. Backends realize the geometry and fulfill the spacing contract below. By default it adds no border, heading, drawer behavior or page landmark. Optional framing separates its allocations without wrapping their content in cards.

```vue
<UiRegionLayout direction="vertical" height="full">
  <template #start>
    <CustomerSummary />
  </template>
  <template #main>
    <UiLayout height="full" scroll="vertical" aria-label="Customer details">
      <CustomerEditor />
    </UiLayout>
  </template>
  <template #end>
    <CustomerActions />
  </template>
</UiRegionLayout>
```

The host must supply a bounded height for this example. Supporting regions size to their content; main receives the remainder and its nested layout scrolls. The supporting content stays outside that scrollport. Full height means the parent's allocated height, never an implicit viewport height.

## Slots

| Slot | Requirement | Meaning |
|---|---|---|
| `start` | Optional | Before main on the arrangement axis |
| `main` | Required | Primary content; its allocation remains even when its slot output is temporarily empty |
| `end` | Optional | After main on the arrangement axis |

Use the explicitly named main slot; there is no default-slot alias. Missing main or an unknown slot name throws. Render order is always start/main/end, independent of the order of slot declarations. A horizontal arrangement places start on the left in LTR and right in RTL; vertical places start above main. Main is a local layout role and does not create an HTML main landmark.

Each slot is one allocation, even when it contains multiple root nodes, text, a fragment, or several business components. Internal content flow belongs to that content or a nested layout. Any region can contain another UiRegionLayout to express different spanning relationships.

Omitted supporting slots, empty fragments, whitespace-only text, and comment-only output (including a direct false `v-if`) consume no allocation. Child component internals are opaque: a supplied component is participating content even if its own render later returns nothing. Put a condition on the slot content when allocation must be removed. `v-show` retains participation.

Existing regions are keyed by their names. Removing start or end and changing direction preserves the other regions' content instances. Removing a region unmounts its content; control lifetime remains business-owned. If removal affects focused content, the owning composition must move focus to an appropriate destination.

## Props and defaults

The public type is [UiRegionLayoutProps](../types/UiRegionLayoutProps.md). Ordinary Vue expressions, computed objects, or control-produced bindings can supply props through `v-bind`; there are no detector, token, or control dependencies.

| Prop | Values | Default and meaning |
|---|---|---|
| `navigationRegion` | `start`, `end` | Omitted; designate the whole supporting allocation as navigation, coordinate its adjoining boundary and orient UiNavbar to its side or top/bottom placement; ordinary arrangements only |
| `direction` | `vertical`, `horizontal` | `vertical` |
| `align` | `start`, `center`, `end`, `stretch` | `stretch`; cross-axis alignment of region allocations, following UiLayout |
| `division` | [UiRegionLayoutDivision](../types/UiRegionLayoutDivision.md) | Named allocation overrides; outer regions use content size, main uses the remainder when the arrangement axis is full, otherwise content size |
| `width` | `full`, `content` | `full`, within the parent's offer |
| `height` | `full`, `content` | `content` |
| `scroll-policy` | [UiRegionScrollPolicy](../types/UiRegionScrollPolicy.md) | Omitted; one named vertical scroll group within a bounded host |
| `scroll` | `none`, `horizontal`, `vertical`, `both` | `none`; when enabled, scrolls the entire arrangement |
| `aria-label` | string | Required nonempty name when whole-arrangement scrolling is enabled |

Optional `resizeBoundaries` and `zParts` configure adjustable splits and relative sibling drawing order in ordinary arrangements. See [layout framing](../../guides/layout-framing.md) for strategy presentation, examples, reset rules and limitations.

There is no wrapping behavior. Each region occupies one consecutive allocation along the axis. Grid alignment, collapse/drawer state and fixed/sticky positioning remain separate capabilities, not implied by a region name.

Attributes and listeners target the underlying layout root. The backend applies aria-label to the actual scrollable region when scrolling is enabled. No custom events or exposed instance methods are defined.

## Named allocation

```vue
<UiRegionLayout
  direction="horizontal"
  :division="{ start: 1, main: 3, end: 1 }"
>
  <template #start><Navigation /></template>
  <template #main><Editor /></template>
  <template #end><Inspector v-if="showInspector" /></template>
</UiRegionLayout>
```

Numbers are positive finite proportional shares of the available allocation space. A share can also be `content`. With all regions present, this example divides space 1:3:1. When end is absent, start/main divide 1:3; no blank end region remains. Entries for omitted regions remain declared for later use, and invalid entries fail even while those regions are absent.

Unspecified supporting shares are content-sized. An unspecified main share is 1 when the arrangement axis has full extent, otherwise content-sized. Thus the default vertical layout grows with content; `height="full"` gives main the remaining height. The default horizontal layout gives main the remaining width; `width="content"` instead sizes all regions to content. This rule is independent of device context and slot contents.

Explicit numeric allocations require full extent on the arrangement axis while participating. Positive shares do not guarantee that intrinsic child content fits. Ordinary allocation follows UiLayout’s overflow rules without implicit clipping or a universal minimum usable size. Vertical resizing adds the direct-UiContent minimum integration described below. If supporting content exhausts the available area, it can overflow to an ancestor; a bounded composition should choose a reachable scrolling policy. Ordinary arrangements do not invent a minimum main size or silently shrink content. Grouped scrolling has its explicit reachability rule described below.

## Vertical resize minimums

For vertical resizable arrangements, a sole direct UiContent root contributes its natural content height, or (for full-height scrolling content) its insets/borders plus one line of viewport height. Backends measure; core intersects these minima with pair constraints for pointer, keyboard and ARIA limits. Initial/content/container changes may redistribute all numeric allocations to fit. If they cannot fit, the arrangement becomes a named, keyboard-focusable scrollport rather than covering content. Its name uses `aria-label`, falling back to the joined boundary labels. Content stays mounted.

Horizontal sizing, opaque component internals, multiple content roots and full-height non-scrolling content are not covered by this minimum integration. See [the supported composition, ownership and acceptance checks](../../guides/layout-framing.md#vertical-resizing-and-content-height). This qualifies the ordinary no-automatic-minimum rule; it is not a general content measurement contract.

## Spacing ownership

Region allocations adjoin without layout-added gaps, outer margins or content insets. Explicit framing inserts one backend-sized separator or resize-handle track between affected allocations, deducted before distributing shares. This applies in either direction, to nested region layouts, and to both ordinary and grouped scrolling. Allocation divides space; content or frame presentation supplies any intentional breathing room within that allocation.

Use [UiContent](UiContent.md) inside a region to inset its content. Those insets belong to the content and travel with it when it scrolls. A retained navbar keeps its own interior spacing, but the neighboring scrollport starts at the navbar region boundary. Regions inside a scroll group also adjoin; the group does not add another gap between main and footer. Explicit insets in both regions remain meaningful and are not automatically cancelled.

A nested UiLayout or UiFlowLayout retains its theme-owned peer separation. Region adjacency does not suppress spacing inside descendants or override margins supplied by native HTML or other components.

## Scrolling and responsive changes

Use the `scroll` prop for a scrollport around the whole arrangement when no scroll-policy is supplied. To scroll only main or a supporting region, place a suitably bounded UiLayout with its own `scroll` and `aria-label` in that slot. Outer scrolling does not imply main-only scrolling, and merely naming a region main creates no scrollport.

Coordinate direction, allocation and extent through ordinary reactive bindings. For example, a full-width horizontal ratio may become content-based vertical flow in another responsive context. See [responsive layouts](../../guides/responsive-layouts.md). UiRegionLayout knows neither the producer's type nor the responsive token vocabulary. Updating props on the same component retains existing keyed region content; replacing the whole component tree is a separate lifecycle decision.

## Grouped scrolling

A scroll-policy names regions sharing a scrollport without changing the start/main/end slot structure. The first capability supports one vertical, consecutive group containing main in a vertical layout. For a retained header with content and footer scrolling together, group ['main', 'end']; for retained header/footer, group ['main']. Supply a stable group id and accessible name, and an aria-label on the layout for its outer overflow escape.

The group fills the height remaining after retained regions, without an intervening layout gap. Grouped content grows in source order inside it. Host height comes from the available-space offer, currently supplied by UiApp hosting="viewport". Omit height, division and align overrides; width must be full, and scroll must be omitted or none. Invalid requests and missing bounded offers throw. Group membership/id and policy presence cannot change within one mounted instance; name changes, resize and optional region participation retain children. Removing a supporting slot releases its space without removing other regions. Multi-group, horizontal scroll groups and reactive regrouping remain unsupported.

For insufficient space, the backend reserves a minimum usable group area and permits the outer layout to scroll as a keyboard-focusable overflow escape. The header/footer retention guarantee is relaxed in that exceptional case rather than making main content unreachable. Neither root nor group clips overflowing content. See [the policy type](../types/UiRegionScrollPolicy.md) and [application layouts](../../guides/application-layouts.md).

## Implementation obligations and acceptance

Core supplies `layout.regions.v1`, checks slot names and named shares, detects empty supporting slot output, and resolves ordinary regions through the shared linear allocation rules and backend UiLayout view. A private grouping component keeps multiple slot roots in one allocation without prescribing concrete DOM. Ordinary arrangements use the UiLayout view contract with `spacing: 'none'`; public UiLayout and UiFlowLayout use `spacing: 'peers'`. This backend binding is not a business-facing prop. Grouped arrangements require backend UiRegionLayout.vue with UiRegionLayoutViewBinding and layout.region-scroll.v1; the view receives the offered height, participating region names, group policy and named content slots.

Baseline alignment is reserved for horizontal UiLayout/UiFlowLayout peer rows; UiRegionLayout rejects it in ordinary and grouped arrangements.

Declare `layout.regions.v1`, `layout.linear.v1`, `layout.reactive.v1`, and `layout.division.v1`, plus `layout.region-scroll.v1` for grouped policies, `hosting.viewport.v1` for viewport hosting, and `layout.scroll.v1` when whole-layout scrolling is used and `layout.align.v1` for explicit alignment. Unsupported underlying geometry combinations and unmet backend capabilities fail visibly. A composition declares every capability its possible policies need.

Acceptance covers adjoining boundaries in both directions, scrollports meeting retained regions, content insets moving with scrolling, optional and empty outer slots, stable named shares, multiple roots per region, nesting, retained main input/focus, required main, invalid shares, and accessible scroll naming. Compose start, main and end with a scrollable main, then switch the axis and remove and restore the supporting regions. In a browser, measure geometry and RTL placement and exercise keyboard scrolling.

## Framing, resizing and layers

[uiLayoutFraming](../../strategies/uiLayoutFraming.md) requests separators and named region elevation. The layout owns full-length shared boundaries even when a child navbar is shorter. Start–Main uses a stronger line than Main–End without changing depth; equal-level neighbours retain requested ordinary separators. See [boundary ownership, depth and emphasis](../../guides/layout-framing.md#boundary-ownership-depth-and-emphasis). `resizeBoundaries?: readonly UiRegionResizeBoundary[]` permits any selected adjacent numeric-share pairs to be resized; `zParts?: UiZParts` requests relative allocation order. Framing and resizing use layout.framing.v1 and layout.resize.v1 and are incompatible with scroll-policy; zParts also supports grouped scrolling. Unsupported framing/resizing attempts fail explicitly. Whole-arrangement scrolling remains supported and moves the complete framed arrangement. Nested scrolling keeps framing stationary.

The layout owns adjustment for its mount lifetime. Direction, extent, declared shares, region participation or limits changes reset it; translated labels and framing changes do not. Numeric minimum/maximum percentages bound the pair, with defaults 10/90; an invalid initial split throws. External control/persistence and actual content overlays remain unsupported. See the [guide](../../guides/layout-framing.md) and per-type references for behavior and acceptance.

Navigation regions request separators by default unless an agreed uiLayoutFraming profile specifies otherwise. A matching menu relinquishes its local boundary only when the adjoining separator, raised edge or resize boundary is present. Explicitly unframed regions retain menu-owned separation. Nested region layouts reset the ownership scope; missing supporting content releases its allocation and adjoining separator. See [navigation boundary ownership](../../guides/navigation-menus.md#navigation-boundaries-and-top-bars) for consumer obligations and examples.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

`zParts?: UiZParts` orders owned allocations using `start`, `main`, `end` names. Shorthand maps and entry lists normalize identically. Keyed identities survive moves; indices follow current source order. Wrapper and child declarations remain distinct.
