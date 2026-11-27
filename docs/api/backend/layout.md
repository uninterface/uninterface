# Layout and allocation

[Backend reference](README.md) · [API reference](../README.md)

Layout bindings, theme spacing, density and adjustable regions.

### UiContentViewProps

`UiContentViewProps` contains resolved `inset: 'default' | 'none'`, `height: 'content' | 'full'`, `scroll: 'none' | 'horizontal' | 'vertical' | 'both'`, and `label?: string`. The backend preserves root attributes/listeners and opaque slot content, fills the available width, includes padding in full-height sizing, and puts default content clearance inside the clipping boundary. With inset none, omit this host's padding and use contained focus paint when scrolling, without suppressing explicit descendant insets or cancelling ancestor padding. Non-scrolling content adds no role/tab stop; scrolling adds region/label/tabindex on the actual scroll root. Keep mounted children stable when options change. Backends provide an inward host focus indicator and preserve native focus scrolling. See [UiContent](../components/UiContent.md) and [scrolling content](../../guides/scrolling-content.md).


### UiLayoutViewBinding

Vertical content-sized tracks must retain intrinsic content height under a bounded host, including `content` entries in mixed division. The supplied views use `max-content` for those rows: CSS Grid `auto` can shrink toward the allocation wrappers' zero minimum height. Numeric tracks retain their allocation rules, and horizontal tracks retain their existing wrapping/sizing behavior. Let the requested scrollport expose excess content; do not clip overflowing native editors or reduce their dimensions to conceal undersized content rows.

Extends `UiResolvedLayout` with optional `density: UiLayoutDensity` (agreed -1/0/1 intent), `spacing: 'peers' | 'none'`, `'aria-label'?: string` and `items: readonly string[]`. Core selects `peers` for public UiLayout, UiFlowLayout and UiStartEndLayout and `none` for ordinary UiRegionLayout allocations. `peers` requests theme-owned separation between items; `none` requires adjoining allocations with no layout-added gap, outer margin or inset. This choice is local to this arrangement, never inherited by nested layouts. Each item string is a stable key and normally names a slot containing one participating child. Render the slots in supplied order, preserving their keyed allocation roots across option changes. The backend owns each wrapper, geometry, gap, and scroll behavior; do not inspect or recreate child component state. UiLayout requires one backend `UiLayout.vue` module with a required `binding: UiLayoutViewBinding` prop, dynamically named child slots, no emitted events, and no exposed handle. Fallthrough attributes belong to its root.

The [UiLayout contract](../components/UiLayout.md) defines division, wrapping, extent and scroll guarantees, failures, and known host-bound constraints. The backend consumes core-validated layout options, including reactive updates; it must not independently detect responsive context. `layout.reactive.v1` requires these updates to preserve keyed content instances, input state, and meaningful focus. Layout roots carry their own styles and work without a backend provider ancestor. Apply the binding's `aria-label` to the actual scrollable region, together with its region semantics, rather than an arbitrary wrapper. Named scrollports need keyboard focus and visible focus feedback; non-scroll layouts should not create gratuitous landmarks/tab stops. Exact peer-gap dimensions are backend choices, not business props; a binding requesting no separation must be honored. CSS grid and flex flow are possible implementations, not mandatory backend markup.


A flow with spacers supplies `spacers?: readonly string[]` in the binding. These
keys participate in item order and have no content slot. Render each as a
non-interactive, accessibility-hidden allocation using
`layout.flow-spacer.v1`. Ordinary peers retain their normal theme separation.
`flowSpacerLayoutStyle(binding)` and
`flowSpacerItemStyle(binding, key, gap)` are optional backend helpers. The
second helper takes the active peer gap on the flow axis as a CSS length
expression, including the appropriate density mapping. The helpers opt the
allocation into flex geometry and counteract the extra gap next to each empty
spacer. Supply the same gap that the view uses to lay out its peers. Leave the
existing keyed peer wrappers in place when the last spacer is removed.

`layout.separator.v1` adds optional `separators` to UiLayoutViewBinding.
Each record names two consecutive peer allocations with `first` and `second`.
Draw a decorative line inside their existing gap. The line is perpendicular to
the arrangement direction and visible only while the peers share a line in a
wrapping flow. Keep allocation keys, gap, wrap threshold and focus order
independent of the decoration.

The optional [UiLayoutSeparators](#uilayoutseparators) helper can paint the lines.
Keep the containing blocks and hit targets of existing descendants the same
when separators are added or removed.

`startEnd: true` identifies a full-width, horizontal, wrapping allocation with
content division and centered cross-axis alignment. The only possible item keys
are `start` and `end` in that order. Each named slot can have multiple roots.
An omitted item consumes no space. `layout.start-end.v1` requires each group to
retain its logical edge on whichever line contains it, even when it is the only
group on that line. Keep the theme gap and keyed group wrappers across wraps.
The optional `startEndLayoutItemStyle(binding, key)` helper attaches the edge
alignment to a group's allocation wrapper in a wrapping flex view.

#### UiLayoutSeparators

Import this optional Vue component from `@uninterface/uninterface/backend`.
Render it inside the layout root when the view binding supplies separator pairs.
It measures allocation wrappers and paints the lines in its own out-of-flow
element, tracking scrolling and clipping its own decoration.

| Prop | Type | Purpose |
|---|---|---|
| `root` | `HTMLElement \| undefined` | The layout root. Pass the view's element ref, which can be undefined until mount. |
| `binding` | `UiLayoutViewBinding` | Required. Supplies allocation keys, separator pairs, and the arrangement direction. |
| `itemId` | `(key: string) => string` | Required. Returns the allocation wrapper's DOM ID. Each wrapper with that ID must be a direct child of `root`. |
| `color` | `string` | Required. The backend's CSS color for the line. |
| `thickness` | `string` | Required. The backend's CSS border width for the line. |
| `length` | `string` | CSS length for the short vertical line, capped at the peers' combined cross-axis span. Defaults to `1rem`. |

### UiAppViewProps

`hosting: UiAppHosting` selects document or viewport hosting. UiApp.vue reports `availableHeight` with the measured usable height for viewport hosting, or undefined for document flow, initially on mount and whenever the offer changes. Disconnect observers/listeners on unmount. The core publishes the offer through its internal logical context; no backend consumer reads viewport tokens or global route state. Viewport hosting requires hosting.viewport.v1 and must not mutate body overflow. The application root integration owns document margins. No scroll policy is implied by hosting alone. Core layout/content boundaries mask the outer offer where no local allocation is defined, so nested consumers cannot mistake the whole application height for their own available space.


### UiRegionLayoutViewBinding

`height: number`, `regions: readonly ('start' | 'main' | 'end')[]`, `group: UiRegionScrollPolicy['groups'][number]`, and `'aria-label': string`. The number is an implementation-facing measured space offer, not a business spacing parameter. Regions are named slots, rendered in order. Keep the declared grouped content in one named, keyboard-focusable scrollport; supporting regions outside it reserve natural space. The root fills the supplied height; group content grows naturally and scrolls within the remainder. Allocation boundaries adjoin: no root/group gap, outer margin or padding may insert spacing between retained regions and the scrollport or between grouped regions. Insets supplied by content remain inside that content and scroll with it. Preserve intentional descendant spacing. The initial capability supports one vertical group with stable membership. Optional regions can appear/disappear without replacing remaining content. Zero height may occur during initial measurement.

Provide a named, keyboard-accessible outer overflow escape when retained content exhausts the allocation. The reference implementations reserve a 3rem minimum group height; exact usable minimum belongs to backend presentation. In that insufficient-space condition the outer layout can scroll and retention is relaxed to preserve reachability. Both axes remain reachable on overflow. Resize and accessible-name updates preserve descendants, input/focus and the existing scrollport. Do not generate CSS fixed positioning or global document locks as a required behavior. Shared browser acceptance must measure actual scroll ownership; DOM simulation cannot establish geometry.


### UiLayoutPresentation

Exported from `@uninterface/uninterface/backend`. A backend supporting `layout.spacing.v1` exports `uiLayoutPresentation: UiLayoutPresentation` from `@uninterface/backend/layout` (package subpath `./layout`). This is a static, side-effect-free presentation policy; it must not import or initialize a toolkit or a component registry.

```ts
interface UiLayoutPresentation {
  scrollFocus: UiFocusPresentationBinding
  peerSpacing: {
    class?: string
    gap?: string
  }
  peerSpacingLevels?: Partial<Record<-1 | 1, UiLayoutPresentation['peerSpacing']>>
}
```

Supply `scrollFocus` as an inward, visibly focused host treatment; shared grid scrolling applies this binding without prescribing toolkit colors or outline dimensions. It changes presentation only.

Supply a nonempty native spacing class, a valid CSS gap expression, or both. Classes supply peer gap styling and may identify a local backend accommodation for surplus whitespace around a direct control item. Such an accommodation must preserve the native control surface, hit target, typography, feedback and explicit content insets. It must not affect opaque descendants or cross nested allocation boundaries. Do not add a wrapper, decoration, negative margins, positioning or control scaling. Gap expressions can reference native theme variables and may use the two-value CSS shorthand for row/column gaps. Zero spacing must be explicit (`gap: '0'`). The supplied stylesheet must define any referenced classes/variables. Native classes using `!important` take precedence over inline gap values; avoid conflicting declarations.

Core's shared UiGridLayout consumes this policy directly. Linear backend views can reuse the same policy so their ordinary peer separation agrees with grids; region allocation still suppresses gaps. There is no business-facing gap property, global style class or arbitrary CSS registry implied by this interface. Backend authors own the values and must verify actual computed spacing with the assembled stylesheet. Core owns the shared grid geometry; no backend UiGridLayout view is required.


### UiLayoutResizeViewBinding

Optional UiLayoutViewBinding.resizeBoundaries entries contain stable key, first/second allocation keys, accessible label, min/max/value percentages and resize(value). Core clamps finite requests and ignores stale callbacks after an allocation-policy change or unmount. Values describe the first allocation's fraction of the pair. Backends supply an interactive separator with label, orientation, current value, bounds and aria-controls referencing that allocation.

UiLayoutViewBinding.framing optionally supplies `separators`, a `regions` map (`raised` and `raisedEdges`), and `boundaries`: one record per adjacent allocation pair with `first`, `second`, `role: 'start' | 'end'`, `separator: boolean`, and optional `raised` allocation key. Use the boundary records to compose one treatment per shared edge. The role determines line emphasis (Start–Main stronger, Main–End quieter but visible); `raised` determines the higher side independently. Do not infer emphasis from the casting region, physical side or before/after. At equal depth, retain requested ordinary separators. Explicit none suppresses ordinary lines, not requested elevation.

The layout owns full cross-axis coverage and retains ownership when decoration is disabled. Participating navigation relinquishes its local shared edge; native child painting is valid only with guaranteed full coverage and matching policy. Never stretch business content just to lengthen its border or suppress unrelated nested borders. Map edges to block start/end vertically and inline start/end horizontally, including RTL. Orient the backend's same elevation recipe toward the lower neighbour on every side; header/footer emphasis changes line color/contrast, not shadow depth or paint order. Clip decoration, never content or focus. Suppress the ordinary decorative separator where a raised edge supplies the boundary. A resize track supplies its own line and remains operable above depth decoration; do not add a second line there.

Use stable allocation wrappers, native surface/shadow tokens, and one track per visible ordinary separator or resize boundary. Deduct tracks before distributing shares; never add card padding. Raised decoration adds no allocation space. The local layout isolates layering; content scrollports cannot clip sibling shadows. Optional resizeIdentity identifies the current allocation policy and cancels obsolete drags. supporting backends currently orient a native shadow plane inside an absolute size-contained decoration, using container query units to swap dimensions for horizontal edges. This does not size-contain business content. Forced-colors keeps system-color boundary lines and may suppress depth cues.

`useUiLayoutResizeView(getBinding)` is an optional backend helper returning resizeRoot, itemId(key), boundaryAfter(key), onKeydown(event, boundary) and onPointerdown(event, boundary). It provides local SSR-compatible Vue IDs, physical RTL-aware keys, measured pair movement, and document listener cleanup on pointer end/cancel, blur, window resize, policy changes, KeepAlive deactivation and unmount. Backend views own actual DOM, dimensions, touch-action, focus presentation and toolkit integration. This helper does not render a universal DOM tree or own split state.

For the vertical UiContent minimum integration, attach `resizeRoot` to the actual layout host. The shared helper observes its size, direct content roots, content mutations, font loading and viewport resizing, and cleans up on policy change, deactivation and unmount. UiContent views mark their actual sizing root with backend-internal `data-ui-content-height="content|full"`; scrolling roots also carry `data-scroll`. These are geometry protocol markers, not business authoring inputs. A sole direct marked root contributes natural content height, or padding/borders plus one computed line for a full-height scrollport. Backend edge decorations are excluded. Opaque/multiple roots and non-scrolling full-height content are not recursively measured.

`UiLayoutViewBinding.measureResize(available, minimum)` reports numeric-allocation space after tracks/content-sized allocations, and named minima, in CSS pixels. Core validates finite nonnegative geometry, ignores obsolete callbacks and resolves effective shares/limits. Optional `resizeSizes` supplies the resulting pixel tracks; use those instead of fractional tracks only when provided. `resizeOverflow` requests a whole-layout scrollport with the supplied accessible name and keyboard/focus support. Content and focus identity must be retained. Core supplies no measurements in SSR or horizontal arrangements. A backend may implement its own measurements through the same binding instead of using the shared helper; it must preserve the observable guarantees in the [vertical resize guide](../../guides/layout-framing.md#vertical-resizing-and-content-height).

Declare layout.framing.v1 and layout.resize.v1 only when fulfilling these guarantees. The first core consumer is ordinary UiRegionLayout; grouped scrolling and other layout specializations do not support framing yet. Test behavior through shared roles and named allocations; keep native details in backend tests.

For multiple resize boundaries, core supplies current effective min/max values after intersecting the pair constraints. Render and update every enabled handle; do not interpret the array as a single selection. Each callback rechecks current shares and all constraints before applying the request. Neighbouring effective limits can change during a drag and must not cancel it; resizeIdentity still cancels on a changed authoring policy.

Supplied views report effective minimum, maximum and current percentages with the same two-decimal precision, keeping the announced current value within its announced interval. Core calculations retain full precision.


### Layout density mappings

UiLayoutPresentation additionally accepts `peerSpacingLevels?: Partial<Record<-1 | 1, UiLayoutPresentation['peerSpacing']>>`. Supply complete spacing descriptors for supported compact/spacious levels; zero always selects peerSpacing. Missing levels are unsupported and filtered before query agreement. The module remains static and side-effect-free. Concrete spacing belongs to the backend, and each supported nonzero mapping must supply a valid gap or spacing class, just like peerSpacing.

Core UiLayout resolves uiLayoutDensityQuery at the existing `layout` node and sends the optional agreed density in UiLayoutViewBinding. UiFlowLayout and UiStartEndLayout delegate to that same node. UiGridLayout resolves at `grid-layout` and consumes the same backend descriptors. Backends select the matching nonzero descriptor or the default descriptor, replacing previous classes/gaps reactively. Never scale control sizes or inherit a CSS density variable across query barriers. `spacing: 'none'` always suppresses peer gap/classes regardless of density. Region allocation helpers do not create extra density-query nodes. Scope, conflict and omission must restore the backend's original default.

Verify reactive replacement, keyed input and focus retention, default restoration, target/depth/stopAt and query barriers, and zero gaps on region allocations. Use a browser to measure the resulting layout.


Backend popup presentation follows the [native arrow principle](../../guides/design-principles.md#native-arrows-on-anchored-surfaces), including native popovers embedded inside editors. Audit the matching native control before interpreting an arrow flag on a lower-level primitive; a native arrowless submenu is not a missing-arrow defect.

