# Layout contract

Use the component references for supported syntax, combinations and defaults.

| Available now | Reference |
|---|---|
| Linear direction, extent, division, wrapping and bounded scrolling | [UiLayout](../api/components/UiLayout.md) |
| Content-sized peer flow | [UiFlowLayout](../api/components/UiFlowLayout.md) |
| Start/main/end regions and one bounded vertical scroll group | [UiRegionLayout](../api/components/UiRegionLayout.md) |
| Equal-width columns with automatic source-order rows | [UiGridLayout](../api/components/UiGridLayout.md) |
| Responsive context separate from layout props | [Responsive layouts](../guides/responsive-layouts.md) |

Ordinary UiRegionLayout supports user-adjustable adjacent numeric-share splits; all drawer modes support constrained resizing. The broader design below also discusses generalized grid placement/spanning and compact visibility, which are not available options. Implemented drawer expansion follows its own component contract. [Spacing and rendering ownership](#spacing-and-rendering-ownership) applies to the implemented layouts.

## Content height in bounded layouts

Implemented vertical UiLayout content allocations retain their intrinsic height, including content entries in a mixed division. If they exceed a bounded host, requested scrolling or an ancestor keeps the excess reachable. Shrinking these content rows while their editors overflow into adjacent rows violates content sizing. Numeric allocations retain their separate semantics; this is not an automatic minimum for every child. Backends own the track-sizing mechanism and preserve native editor dimensions, focus and mounted state.

## Purpose and scope

Layout expresses how containers receive space, divide that space among their contents, and change their participation as conditions change. A business author describes spatial relationships and behavior: beside, below, aligned, filling an area, scrolling, or expanding when opened.

The contract covers:

- Horizontal and vertical arrangements.
- Occupying available width or height and dividing space by proportions or a defined allocation policy.
- Optional adjustment of a split by the person using the interface.
- Different arrangements for desktop and mobile contexts.
- Horizontal and vertical scrolling.
- Grids with alignment across both dimensions.
- Conditional visibility and compact/expanded states.
- Reusable named layout compositions with meaningful content slots.

Margins, padding, decorative borders, colors, and typography are outside this contract. Their concrete realization belongs to presentation. A container establishes a layout boundary whether or not it has a visible border. Theme hierarchy such as `main`, `sub`, and `minor` does not by itself specify a space ratio or grid position.

The [frame contract](frame.md) describes the outward boundary, presentation, attachment, and interaction with surrounding content. Layout operates within the usable space offered to it. Frame placement and interaction coordinate with layout allocation and visibility through a shared state and hosting contract.

## Business concepts

| Concept | What the author expresses | What the implementation supplies |
|---|---|---|
| Container | A region whose contents share an allocation and visibility policy | The region and its integration with its parent |
| Arrangement | Place children horizontally, vertically, or in a grid | The corresponding spatial relationships |
| Extent | Occupy the available width, height, or both; otherwise use a declared sizing policy | Resolve that intent within the space offered by the parent |
| Division | Give children proportional shares or use a defined allocation policy | Calculate and maintain the allocations |
| Adjustable split | Permit the end user to change an allocation | Accessible resizing interaction and constraint handling |
| Scrolling | Allow horizontal scrolling, vertical scrolling, both, or neither within a region | A usable scroll region when content exceeds its allocation |
| Responsive policy | Choose an arrangement using detected context | Shared detection supplies context; a consumer/control supplies reactive layout props |
| Visibility state | Participate fully, remain compact, or be hidden under a condition | Update visibility, allocated space, and interaction availability consistently |

A child can also be a container. A horizontal arrangement can contain a vertical arrangement or grid, each operating within the area assigned by its parent.

## Ordered peer flows

[UiFlowLayout](../api/components/UiFlowLayout.md) specializes UiLayout for an ordered, variable-length sequence of peer items. It fixes content allocation and supports horizontal continuation through wrapping. Source/keyboard order is preserved; no item is inherently main. Alignment places allocations across the flow axis while each child retains its sizing contract. Grid alignment across rows and list control state remain separate concerns. See the API reference for defaults and supported combinations.

## Named layout compositions

[UiRegionLayout](../api/components/UiRegionLayout.md) implements the initial three-region arrangement: required main plus optional start/end, configurable direction, named allocation, and reactive props. It composes UiLayout and can be nested in any region. Its reference specifies exact defaults, empty-slot handling and current limits, including one bounded vertical scroll group via scroll-policy. UiApp viewport hosting supplies the first implemented space offer; generalized nested/frame offers remain open. Business compositions can map these role-neutral regions to meaningful slots.

Business authors can wrap an arrangement in a reusable component that expresses a meaningful purpose. Consumers then work with that component's contract and content slots. The composition owns the internal arrangement, allocation, scrolling, and any context variants it promises.

This supports two levels of authoring: defining a reusable layout from the layout capabilities, and using that layout by supplying meaningful content. A consumer need not understand or repeat the underlying arrangement. A composition may itself use other named layouts, while continuing to rely on the shared contracts rather than backend-specific styling.

### Example: ModalBodyLayout

`ModalBodyLayout` is the reference example of a reusable **header/main/footer arrangement**. It is a conceptual composition, not an exported component or a required authoring wrapper. Its name does not limit the arrangement to modal dialogs: the same layout responsibilities apply inside a drawer or an interactive popover when those regions are supplied. This documentation does not introduce a new component name or slot API.

The composition supplies a complete inner arrangement. Creating header and footer elements alone does not fulfill that contract. Consumers rely on allocation, scrolling and any promised action arrangement without reconstructing them or knowing which regions a native toolkit provides.

| Region | Consumer-facing meaning | Arrangement responsibility |
|---|---|---|
| Main | Primary content | Hosts the content and makes overflow reachable within the host's bounds |
| Header, optional | Content before main, such as a title or summary | Takes its content height and stays outside the main scrollport |
| Footer, optional | Content after main, such as relevant actions | Takes its content height and stays outside the main scrollport |

#### Allocation and scrolling

The reference arrangement is vertical. Within a full-height host, header and footer take their content heights and main receives the remainder. Within a content-sized host, the composition grows with content until the host's usable-height limit is reached; main then scrolls. A popover should not fill the viewport merely because it uses this arrangement. The frame supplies its bounds according to its own placement and sizing contract.

Omitted optional regions reserve no band, spacing or separator. Supplied-but-empty regions follow the owning component's documented slot policy; the layout must not inspect opaque child internals to infer emptiness. For example, UiModal treats an explicitly supplied footer slot as a supplied region even when its child components render nothing.

Consumers do not calculate header/footer heights or add overflow styles. A bounded outer frame does not automatically offer a measurable remaining height to arbitrary nested full-height layouts. Current modal/overlay bodies own their scrolling; generalized frame-to-layout height offers remain open. If header and footer exhaust the usable height, the composition must document how all content and actions remain reachable. The general insufficient-space policy is still open; clipping main content to an unreachable region is not an acceptable fallback.

#### Footer content and action arrangement

A footer region and an action arrangement have separate responsibilities. The region participates in vertical allocation. An action arrangement positions its own button children, supplies theme-owned peer spacing, and handles alignment, direction and wrapping. A gap between header, main and footer does not establish spacing between buttons inside the footer.

The implemented frames expose `#actions` for ordinary button children and `#footer` for a fully authored footer composition; they are mutually exclusive. With `#actions`, the backend supplies arrangement without a consumer wrapper, CSS or action descriptors. Declaration/DOM/Tab order and child identity are preserved; placement direction and alignment follow the backend's documented presentation. With `#footer`, the consumer composes its internal relationships using ordinary layouts. A supplied business component remains one opaque layout item. Layout does not infer action importance, invoke operations or own submission.

The backend-private FooterActions composition is shared by these frames and the standard action regions of toast/notification targets. Business authors supply frame slots or feedback message actions; they do not import this implementation component. Inline notice recovery actions keep their distinct message-alignment contract.

This is the existing [UiModal footer contract](../api/components/UiModal.md#footer-authoring), also used by [UiDrawer](../api/components/UiDrawer.md) and [UiPopover](../api/components/UiPopover.md). It does not add an actions slot to an exported ModalBodyLayout, since no such export exists.

#### Frame and backend integration

The [frame](frame.md#composition-with-layouts) owns outward placement, attachment, interaction and lifetime. The inner composition owns arrangement and scrolling. Business content owns data and operations. Themes/backends supply concrete insets, separators, spacing and typography. A header is not automatically an accessible title; the frame's naming contract still applies. The layout adds neither modality nor focus trapping, dismissal or a run lifecycle.

Backend implementations should use compatible native region facilities where available and complete the remaining arrangement where the native surface supplies fewer regions. Native popover support, for example, does not imply a native header/body/footer or action layout. Missing theme slots must not silently remove required spacing or scrolling. Shared backend-private compositions may reuse these responsibilities across frames without imposing identical markup across backends or a new public wrapper. Nested content insets and local layout spacing retain their existing ownership; completing the frame arrangement must not suppress them.

#### Current use and verification

Business authors currently use the slots of UiModal, UiDrawer and UiPopover directly. For example, an editor supplies its form through the default slot and Save/Cancel through `#actions`; the frame integrates the arrangement. A persistent drawer can use the same internal regions without acquiring a modal run lifecycle. A content-only popover needs no synthetic header, footer or additional actions.

These are layout obligations, not a claim that every adapter has passed visual acceptance. A backend may compose native surface and region facilities to supply missing header/body/footer arrangement and action spacing. Concrete integration and browser acceptance belong in its documentation.

Observable checks include:

- Long main content scrolls while supplied header/footer remain outside its scrollport, within sufficient usable height.
- Supplied leading and trailing insets remain reachable at the corresponding scroll extremes, following [spacing ownership](#spacing-and-rendering-ownership), with both fitting and overflowing content after resizing.
- Omitted regions leave no reserved allocation; supplied-but-empty slots obey the component's declared policy.
- Two independent action buttons have the backend's intended separation; narrow widths and long localized labels wrap without losing actions or changing DOM/Tab order.
- A custom footer retains its own layout, and opaque business content is not inspected or rearranged internally.
- Reusing the arrangement in a nonmodal drawer or popover does not introduce background blocking or change its existing state owner.
- Theme changes and native surfaces without region slots preserve the same arrangement guarantees without consumer CSS.

DOM checks establish slot wiring and identity. Real-browser checks establish spacing, bounds, scrolling, wrapping and keyboard reachability; neither source reuse nor passing lifecycle tests proves those visual results.

### Composition obligations

Each named layout must document its purpose, slot meanings and optionality, allocation requirements from its host, behavior of omitted or empty slots, and the layout guarantees it supplies. It must also explain any configurable choices and applicable responsive behavior. Defaults internal to that composition can remove decisions from its consumers, provided they are documented.

Implementations must preserve those guarantees while realizing the underlying capabilities. Project-specific compositions and plugin-provided compositions use the same rules. Their documentation must allow a human or development agent to select and populate the layout without inspecting its implementation.

## Proposed allocation semantics

### Arrangement and extent are separate

Horizontal or vertical describes the direction in which children are arranged. It does not automatically mean full width, full height, equal shares, wrapping, or scrolling. Width and height occupancy must be independently expressible.

“Full” means the usable area assigned by the parent, not necessarily the screen. Filling height requires an established available height; an implementation must not interpret an unconstrained parent as an instruction to fill the viewport. If that allocation cannot be resolved, the contract needs an explicit fallback or a reported configuration problem.

A useful candidate alongside filling available space is content-based sizing: use the space needed by the contents within the applicable constraints. The exact sizing vocabulary and defaults remain open.

### Division by ratio

For a horizontal split of `1:2`, the first participating region receives one share of distributable width and the second receives two. For a vertical split, the ratio applies to height. Theme-owned spacing and any resizing affordance are accounted for before distributing that space, so authors do not calculate them.

The implemented vertical resize integration measures sole direct UiContent roots and combines their natural-content or minimum-scroll-viewport heights with pair percentage constraints. When these minima cannot fit the host, the arrangement scrolls without replacing its content. This is a bounded integration, not a general minimum-size protocol for opaque children; horizontal allocation is unchanged. See [vertical resizing and content height](../guides/layout-framing.md#vertical-resizing-and-content-height).

Ratios describe allocations, not guarantees that all content fits. Long content is handled by the declared overflow policy. A ratio applies while the allocation is feasible; constraints or an active user adjustment may require a different effective split under an explicitly defined policy.

Proposed input rules: each participating share must be positive and finite, and the shares must identify the relevant children unambiguously. Zero-sized or hidden states should be expressed through visibility rather than an ambiguous zero share. Ratios, constraints, and participation changes need one documented resolution rule; their exact precedence is still open.

### Division by algorithm

An allocation policy must have a documented meaning that can be understood without knowing CSS. Candidate examples include equal shares, content-based allocation, and giving one region its required space while another receives the remainder.

An algorithm contract must define its inputs, guarantees, response to insufficient space, and interaction with visibility and user adjustment. “Automatic” is not sufficient unless its observable behavior is specified. These examples are candidates, not an adopted set of algorithms or a requirement to accept arbitrary author code.

### Adjustable splits

The author specifies whether the end user may adjust a split. The implementation supplies the resizing affordance, pointer/touch interaction, and keyboard operation, with accessible naming and indication of the current allocation.

Ordinary UiRegionLayout accepts named `resizeBoundaries` for adjacent numeric-share allocations on a full arrangement axis. Each boundary has an accessible label and percentage limits; core coordinates constraints across multiple boundaries. The mounted layout retains effective user shares through ordinary rerenders, label and framing changes. Changes to direction, extent, participating regions, declared division or resize limits reset them; remount also starts from the authored values. See [layout framing](../guides/layout-framing.md#resize-a-split) for exact rules. Durable persistence and application-specific cross-layout retention are not supplied. Other layouts do not acquire resize support through this contract.

## Grids

The initial [UiGridLayout](../api/components/UiGridLayout.md) supports an explicit reactive column count, equal-width columns, source-order automatic row placement and backend-owned peer spacing. It preserves keyed children across column changes, retains column widths on incomplete rows, and adds no breakpoint detection. Core implements the shared geometry; backend `./layout` supplies spacing. Unequal tracks, spans and explicit placement remain proposals below.

A grid establishes shared rows and columns so that contents align in two dimensions. Independent rows of horizontally arranged children do not guarantee the same alignment.

The author should be able to express the required row/column structure and how regions occupy it, with division rules applying on each axis. Explicit placement, spanning, and automatic placement are options to settle before a grid API is specified. Any automatic placement policy must preserve a documented reading order.

The implementation owns track calculations and spacing. It must preserve declared alignment and meaningful reading/focus order; it must not silently rearrange business content to make it fit. Desktop and mobile can use different grid structures, or one can use a linear arrangement.

## Responsive context and reactive arrangements

The business definition may specify different layouts for named contexts without knowing how they are detected. [useUiResponsive](../api/functions/useUiResponsive.md) exposes the current shared context as a read-only Vue ref. The default detector supplies desktop/mobile tokens. Applications can declare additional or different tokens with [defineUiResponsiveProfile](../api/functions/defineUiResponsiveProfile.md) and supply their detector through createUiResponsive. Tokens stay between Uninterface and business consumers; backends receive resolved layout props. Multiple context dimensions and built-in local container detection remain open.

A template expression, computed binding, or reusable business control translates context into ordinary layout props. UiLayout validates and fulfills those props without knowing the detector or producer. Related decisions such as direction, division, and extent should change together. See [responsive layouts](../guides/responsive-layouts.md) for direct usage and target-named `bindings.layout` compositions.

Changing props preserves keyed content and business-owned editing state; focus remains meaningful. Control lifetime is a business decision, independent of responsive classification. Policies governing user-adjusted splits or visibility must separately document retention behavior when those capabilities are implemented.

The initial component applies defaults to omitted props and validates its current configuration. All capabilities needed by possible policies must be declared by the consumer/composition; arbitrary inactive code branches cannot be inspected by the component. Multiple layout context dimensions and layout-specific strategy queries remain open. General attachment, scope and query agreement follow the [strategy contract](strategy.md); they do not infer layout policy from Vue prop order.

## Scrolling and overflow

Horizontal and vertical scrolling are separate capabilities. Requesting vertical scrolling means overflow can be reached inside that region; it does not mean a scrollbar must always be drawn. System scrollbar appearance belongs to the implementation.

An internal scroll region requires a bounded allocation along the scrolling axis. “Scroll vertically” cannot create a meaningful limit when height is otherwise unlimited. The parent allocation and the scroll policy must therefore agree.

Proposed rule: disabling scrolling on an axis does not authorize silent clipping of essential content. The layout must use a documented alternative, such as growth, permitted reflow, or scrolling by an ancestor, or report that the constraints cannot be satisfied. The default overflow policy is still open.

Nested scroll regions must remain operable by keyboard and pointer/touch input. Focused controls and relevant validation feedback must be reachable. Defining a scroll region does not require virtualization or a custom scrollbar.

## Visibility, compact states, and drawers

Visibility governs both what can be perceived and how a region participates in layout. A condition must refer to supplied state or an established rule; the layout does not invent the business condition.

Proposed distinctions:

| State | Presentation and interaction | Space allocation |
|---|---|---|
| Expanded | Full content is available | Uses its agreed expanded allocation |
| Compact | A defined summary, handle, or reduced representation remains available | Uses its agreed compact allocation |
| Hidden | Content is not presented or available for interaction | Space is released or reserved according to an explicit policy |

Compacted and hidden are different states. A compact region requires a meaningful compact representation; shrinking full content until it is unreadable does not fulfill that role.

A drawer illustrates the combination: closing it hides its full content or presents a compact representation; opening it makes the full content available within an agreed region. “Expanded” does not necessarily mean full screen.

Opening also needs a space relationship: it might take a share from adjacent content or overlay an existing region. The name “drawer” alone does not settle this choice. Layout defines the allocation effect; an accompanying [frame](frame.md) supplies outward placement and overlay interaction where applicable. An overlay does not automatically imply a modal interaction; focus containment, dismissal, and restoration follow the selected frame's interaction contract.

The implementation must keep hidden content out of keyboard interaction and the accessibility tree, and handle focus meaningfully when its current region closes. Layout visibility alone must not reset business values or imply authorization. Whether a hidden region remains mounted is a separate lifecycle choice.

## Responsibility boundary

| Responsibility | Owner |
|---|---|
| Required spatial relationships, context variants, scroll axes, adjustment permission, and state conditions | Business definition |
| Purpose, slot contract, and encapsulated layout policies of a reusable composition | Named layout definition |
| Content for the composition's slots and any explicitly exposed choices | Consumer of the named layout |
| Desktop/mobile determination | Shared environment mechanism |
| Common meaning of allocation, variants, and visibility policies | Shared layout contract |
| Concrete geometry, resizing controls, scroll integration, focus handling, and fulfillment of declared behavior | Implementation/actuator, cooperating with relevant interaction mechanisms |
| Actual spacing and decorative treatment | Theme/presentation |
| Participation within assigned space and disclosure of sizing/capability constraints | Child controls, including plugins |

Implementations may use different technologies and presentation techniques. Required layout behavior must remain observable across backends. Unsupported combinations must be reported as such, rather than silently replaced with a different interaction. Theme changes may affect available measurements but must preserve the declared policy.

## Conceptual usage examples

**Two related regions:** arrange a record list and record details horizontally on desktop, filling the available width and dividing it `1:2`. Permit the end user to adjust the split. On mobile, arrange them vertically using content-based height. This example states an arrangement; it does not assume a navigation flow that hides either region.

**Scrollable work area:** inside an area with an assigned height, arrange a summary above an activity list. Use a policy that gives the summary its content height and the list the remaining height. Allow the list to scroll vertically. The author supplies no pixel heights or spacing values.

**Drawer:** on mobile, keep supplementary details hidden while closed, releasing their space. When opened, expand into an agreed overlay region, with vertical scrolling. The open state and region allocation must be supplied; the illustration does not define modality or dismissal rules.

**Comparison grid:** align named alternatives in columns and their attributes in shared rows. A mobile variant may change the arrangement, but must preserve which attribute belongs to which alternative. If the business requires simultaneous alignment on mobile too, preserve the grid and declare an appropriate overflow policy.

These examples guide high-level use. Select a layout from the required relationship, supply the relevant decisions, and rely on its contract for geometry. Missing business decisions—such as whether opening a region may obscure another—must be clarified rather than converted into arbitrary CSS choices.

## Proposed acceptance scenarios

| Scenario | Required observable result |
|---|---|
| A horizontal `1:2` split has sufficient space and no active override | The children receive one-third and two-thirds of distributable width, within rendering precision |
| A nested container requests full width | It fills its assigned parent region without assuming viewport width |
| The user adjusts an enabled split | Pointer/touch and keyboard interaction can change it within the declared constraints |
| The context changes from desktop to mobile during editing | The selected layout changes while business values are preserved and focus is handled meaningfully |
| Content exceeds a vertically scrollable bounded region | The overflow remains reachable inside that region |
| The ModalBodyLayout reference arrangement has sufficient bounded space | Main content scrolls independently while header and footer stay outside its scroll region |
| An optional region of the ModalBodyLayout reference arrangement is omitted | No empty band is reserved for that slot; the main allocation adjusts accordingly |
| A consumer supplies content to a named layout | Its documented arrangement is fulfilled without consumer-supplied sizing calculations or overflow styles |
| A grid uses shared column alignment | Items assigned to those columns align across rows |
| A focused expanded region becomes hidden | Its hidden controls are unavailable and focus moves to a meaningful visible destination |
| A drawer opens | Full content occupies the agreed area and follows the specified displacement or overlay policy |
| The theme changes | The allocation and visibility rules remain in force, without requiring author-specified margins or padding |
| Inputs conflict or a required capability is unsupported | The problem is reported rather than silently discarding intent |

## Current limits and unspecified behavior

Current linear, flow, region and equal-column grid defaults are specified in their component references. Region resize limits and reset behavior follow the region API; drawer extent limits follow the drawer API. Additional allocation algorithms, generalized adjustment/persistence policies, and general grid placement/spanning are not implemented. Their defaults must not be inferred from the existing layouts.

Visibility needs a default space-reservation policy, a way to define compact and expanded allocations, and coordination with interaction and lifecycle contracts. Responsive policies need multiple-dimension/local-scope contracts and rules for user-adjusted state. These remain explicit gaps in the draft rather than hidden implementation defaults.

## Spacing and rendering ownership

Logical components describe responsibilities and need not correspond one-to-one to HTML elements or backend views. Core can translate cooperating logical components into resolved backend bindings; backends own the concrete markup while preserving attributes, accessibility relationships, child identity and control state. Business components and third-party content remain opaque.

Distinguish region allocation, content insets, peer separation and frame interiors. UiRegionLayout allocations adjoin without layout-added separation, including across a retained-region/scrollport boundary. UiContent owns explicit content insets; when inside scrolling content, those insets move with it. UiLayout and UiFlowLayout own theme-sized separation between their peers. Frame/control interior spacing belongs to that frame/control. Implementation wrappers must not independently add another spacing contribution.

Exact theme distances and CSS mechanisms belong to presentation. Which area owns spacing and whether it travels with scrolling are observable contract requirements. Explicit nested content insets are not automatically cancelled, and region adjacency does not strip native or third-party content margins. Verify actual boundary positions and scrolling movement in a browser, rather than equating the presence of a CSS declaration with correct behavior.

When a frame or content region supplies insets, the leading inset must remain
visible before the first in-flow item at the start of scrolling, and the trailing
inset must remain reachable after the final in-flow item at the end. This applies
along each supported scrolling axis. Verify fitting and overflowing content,
including after the available space changes; explicit nested insets retain their
independent ownership. The owning frame/content integration supplies this
behavior without compensating business CSS. This requirement preserves supplied
insets; it does not introduce insets on regions that have none or standardize
their theme-owned distances.

## Implemented region framing

Ordinary UiRegionLayout supports shared separators, multiple adjustable adjacent numeric-share boundaries, and relative sibling layers with raised presentation. These coordinate allocation and outward framing without requiring UiCard wrappers. See [layout framing](../guides/layout-framing.md) for exact APIs, state lifetime, capabilities and acceptance. Framing of other layout kinds, grouped-scroll integration, bounded UiCard bodies and actual content overlays remain open.

## Scrolling content and clipping boundaries

Every clipping host must account for the normal presentation of its intended content. UiContent supports bounded, named scrolling and owns insets inside that boundary. Default insets serve ordinary content; inset none supports flush hosting such as navigation menus without changing scrolling or child identity. Only that host's padding is omitted, and its unpadded scrolling focus treatment follows the same containment rules as layouts. UiLayout/UiGridLayout scrolling preserves flush alignment; backends contain supported focus paint at those unpadded boundaries without creating an additional content gutter. UiModal owns its body clearance. Region allocations continue to adjoin and explicit nested insets are not suppressed. Focusable containers use inward indicators; child padding cannot protect the container's own outward outline. See [scrolling content and visible focus](../guides/scrolling-content.md) for the implemented composition, alignment preservation, ownership and browser acceptance limits.

## Dynamic stacking integration

The [dynamic z-order contract](dynamic-z-order.md) defines core-owned ordering across surfaces, layers, groups and local parts. Universal `zOrder`, layout `zParts` and adapter registration are implemented; real-browser acceptance remains separately reported. Ordering is distinct from inward layout, visual framing and presentation strategies. Ordering does not replace layout, framing or strategy ownership.

## Implemented optional density

UiLayout, UiFlowLayout and UiGridLayout accept scoped presentation intent through [uiLayoutDensity](../strategies/uiLayoutDensity.md): -1 compact, 0 backend default, 1 spacious. Exact gaps remain backend-owned; this is not a numeric CSS spacing API. Peer separation may include documented backend removal of surplus row whitespace around direct control items, without scaling native control surfaces or hit targets. UiRegionLayout's adjoining allocation contract, control sizing and content/frame insets are unaffected. See [layout density](../guides/layout-density.md) for ownership, examples and verification.


## Drawer and popover implementation

UiDrawer implements modal run and persistent panel modes; UiPopover implements anchored run interactions with optional modality. See [the public guide](../guides/drawers-and-popovers.md) for exact ownership and limits. Modal/panel modes overlay the viewport; docked mode reserves space through UiDrawerLayout with the same retained expansion owner as panel. UiFloating supplies an independently repositionable launcher, and all drawer modes support shared constrained resizing. See [floating panels](../guides/floating-panels.md). Compact rails remain draft. Anchored popovers follow a registered subject with viewport fallback; they do not adopt tooltip/menu semantics. Async run lifecycle is shared with UiModal and can be encapsulated as a business method. Browser geometry and assistive-technology acceptance remain distinct from DOM-only verification.

Drawer/docking presentation owns its border and depth relative to the content it overlays or pushes. UiDrawerLayout and enclosing layouts must permit that paint to remain visible while preserving allocation, scrolling and motion containment; the layout does not supply a second drawer border. This agreed division of responsibility differs from UiRegionLayout's ownership of ordinary shared region separators. The supporting backends provide this treatment by default; see the [drawer boundary guide](../guides/floating-panels.md#drawer-boundary-and-depth).

## Region boundary depth and emphasis

UiRegionLayout owns separation between its allocations across the complete shared boundary. A participating child's native separator can fulfill it only with guaranteed full extent and matching policy; otherwise the layout paints it and coordinates suppression of the child's corresponding edge. Ownership persists when ordinary separation is explicitly hidden. Unrelated nested borders remain local.

Depth (equal level or one neighbour raised) and emphasis are independent. Start–Main uses stronger line emphasis than Main–End, regardless of which region is raised, arrangement axis or RTL. Footer emphasis must remain perceptible and cannot lower its elevation grade or diminish its depth cue. Equal-level neighbours have no raised edge, but retain requested ordinary separators; ordinary non-raised borders can also differ in emphasis without implying depth. Exact theme values remain backend-owned. See the implemented [framing rules and checks](../guides/layout-framing.md#boundary-ownership-depth-and-emphasis).


## First-baseline peer alignment

Horizontal UiLayout and UiFlowLayout support explicit `align="baseline"`, with `layout.baseline.v1`. This aligns first text baselines within each row, including wrapped rows; it does not equalize control heights. Backends propagate editable/caption references through their own control, field, form and allocation wrappers. Native baseline synthesis applies when no text baseline is available. Above-labelled fields expose the label row; floating/hidden labels expose editable content. Layout does not inspect opaque business children or coordinate lower editor rows independently of labels. Vertical requests fail loudly; UiRegionLayout and UiGridLayout do not gain this option. Defaults and existing positional alignments remain unchanged. See [field alignment](../guides/field-alignment.md#selectable-peer-baseline-alignment) for author obligations and observable checks.
