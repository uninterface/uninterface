# Modals, drawers and floating panels

[Backend reference](README.md) · [API reference](../README.md)

Overlay views, lifecycle, motion, positioning and drawer allocation.

### UiModalViewProps

Modal render inputs are title, localized closeLabel, closeOn (a readonly UiModalCloseTrigger array), pendingClose, width (auto/available), preferredWidth, minWidth and maxWidth. Width props use the shared [modal width contract](../../contracts/modal-sizing.md); modal.width.v1 declares support. Views show their native close button only for `close-button` and emit cancel with `escape`/`backdrop`/`close-button` for enabled routes. While pendingClose, disable the close affordance and suppress repeated dismissal requests. Core rechecks live policy before accepting view events. Default `bodyScroll: 'body'` retains content-sized body scrolling. Optional `bodyScroll: 'content'` supplies a shrinking bounded body allocation for full-height content layouts while short content remains naturally sized. Declare `modal.content-scroll.v1`. Keep the actual body and any required native intermediate wrappers shrinkable; preserve the viewport cap and retain named overflow fallback for fixed content that cannot fit. Nested collections/layouts own ordinary row scrolling. Do not force all modals to full viewport height or alter defaults. Make the actual scrollport a focusable region named by the dialog title so noninteractive long content is reachable by keyboard; use backend focus presentation. `header-extra`/default/actions/footer slots are available; actions and footer are mutually exclusive. Render actions through a backend-owned arrangement, preserving component identity and DOM/declaration order. The backend chooses inline or reverse-inline placement without changing text direction, adding toolbar behavior, sorting, inferring importance or invoking session actions. A custom footer retains author arrangement; supplementary header content follows the required title without replacing it or the close affordance. Required semantics and callbacks must override consumer attributes. Native close operations must route through core policy, never directly complete a business operation.

Owned popup infrastructure must not change modal geometry or region presentation merely by mounting, opening, closing or unmounting. Backend authors own the DOM and CSS isolation: divider/spacing/child-position selectors must apply to their intended regions, including when toolkit portals insert hidden placeholders. A private inner themed surface is one solution, not a required shared DOM tree. Keep popup targets in the modal's native interaction scope and preserve registered z-order ownership. When animation moves to an inner surface, motion hooks must await that element before releasing modality. Consumers supply business content and must not compensate with wrappers or styles. Verify unchanged modal rectangles and separators throughout tooltip/select transitions with a closed selector present, both with and without a footer, at narrow/wide widths and in LTR/RTL. Also verify long-content scrolling, nested modality and focus restoration; DOM wiring alone does not establish geometry.


### UiModalViewHandle

The view exposes `open(): Promise<void>` after establishing modality and `close(): Promise<void>` after releasing its interaction resources and restoring focus. Calls may occur during partial startup or teardown. The view must clean up on unmount too. Core owns exactly-once result settlement and run hooks.

`useUiModalView` is optional shared native-dialog mechanics: backend-owned dialog/body/title refs, native showModal/close, cancellation events, Tab/Shift+Tab boundary wrapping, outside-mask pointer handling, document-scoped scroll-lock reference counting, cleanup. Boundary wrapping leaves native traversal inside the dialog and already-handled child events intact. Return-focus targets must remain connected and enabled during cleanup. It renders no markup. It additionally returns computed widthStyle for the actual dialog surface, implementing the shared width policy. Each backend owns its concrete surface, slots and native presentation. Apply widthStyle to the outer dialog, and define --uninterface-modal-edge-clearance using the backend viewport margin. This style resolves the hard limit from layout/visual viewport width, CSS safe-area insets and clearance; it overrides native default widths/max widths and horizontally centers in the usable area. Its measurement listeners/observers are disposed with the view. An adapter not using this helper must fulfill equivalent allocation, reactivity and cleanup. Native padding, typography, vertical placement and scrolling remain backend-owned.

`useUiOverlayTarget()` returns the nearest owned overlay portal target ref, or an undefined-valued ref without an enclosing overlay host. Backend popup adapters use their native append/attach/portal APIs to keep popups in the owning overlay's interaction scope. Modal and panel surfaces provide their own target; docked drawers forward the enclosing target instead of trapping popups within layout clipping/stacking boundaries. An enclosing modal therefore remains the host for a docked drawer's popups. This is a backend integration contract, not a business placement prop.

Native UiPopover views pass a getter for their mounted session to `useUiOverlayTarget`. The helper retains that session's portal target through dismissal. Changing the provided target during a drawer mode switch would move the native popover out of the browser's top layer. The next session resolves the current target.

### useUiOverlayEscape

`useUiOverlayEscape()` returns the enclosing shared overlay's Escape handler or
`undefined`. A backend adapter may call it with the original keyboard event
during capture from a closed picker whose toolkit would swallow Escape. The
handler consumes the event when it owns the active interaction. Dismissal
follows the owner's current policy, including disabled, denied, and pending
states. An already prevented event stays with the component that handled it.
When the picker is open, it handles Escape at its trigger or popup content
before the key reaches the overlay or native dialog dismissal. See the
[frame contract](../../contracts/frame.md#modal-run-contract) for the focus
and dismissal sequence.


### UiModalViewMotion

Optional third argument to useUiModalView, also accepted as the sixth argument to useUiOverlayView: backend-owned `beforeEnter(element): void`, `enter(element): Promise<void>` and `leave(element): Promise<void>` hooks. The modal element is the native HTMLDialogElement; nonmodal overlays supply their popover surface, so shared motion hooks should use HTMLElement facilities only. Modality and initial focus precede enter settlement; normal close awaits leave before releasing modality and restoring focus. Forced view removal releases resources independently. Hooks must terminate and cooperate with removal; they own presentation only. Persistent panels serialize physical motion and reconcile the latest expansion request; their stacking registration remains live until exit finishes.


### createUiModalCssMotion

Creates UiModalViewMotion using the backend's native Vue-style transition class prefix. Core coordinates `*-enter/leave-from/active/to` classes and settlement, supplying no visual values. Pass `includeBackdrop: true` in the optional second argument when the backend animates the native dialog backdrop. Reduced motion and missing Web Animations support skip motion. Backends must ensure the corresponding native styles are loaded.


### settleUiModalMotion

Awaits the element's current finite Web Animations/CSS motion with cancellation-safe settlement. The optional `{ includeBackdrop: true }` also waits for the element's own `::backdrop`. Animated descendants and infinite indicators are excluded. Detached elements or environments without `getAnimations` settle immediately.


### UiTooltipViewProps

Render host slot with trigger bindings and default noninteractive content in a native tooltip. useUiTooltipView supplies explicit host attachment, visibility requests, descriptions and dismissal. Forward modal hosting using useUiOverlayTarget. Native placement may adapt the preferred side. Register the actual stacking wrapper with `useUiZPopup`. Supply `tooltip: { anchor, visible, bubble? }` through callbacks that return the reference element, effective visibility and optional paint element. The paint element defaults to the registered wrapper. Supply it when a smaller descendant draws the actual bubble. Modal adapters attach `useUiModalView`’s header and footer directives to the actual themed surfaces and scope authored content with its renderless `ModalPart` component.

```ts
export interface UiTooltipViewProps {
 id: string
 visible: boolean
 disabled: boolean
 triggers: readonly import('../presentation/tooltip').UiTooltipTrigger[]
 placement: import('../presentation/tooltip').UiTooltipPlacement
 requestVisible(value: boolean): void
}
```


### UiOverlayViewProps

Resolved inputs for backend UiDrawer.vue and UiPopover.vue: id, title/name, active/mounted, panel/modal, edge, placement/align, closeOn, closeLabel, pendingClose and disabled. Forward named slots without interpreting opaque content. Expose open()/close() with UiModalViewHandle semantics for run presentations; panel presentations observe active and retain mounted content. Report cancel(reason), failure(error), and update:expanded(boolean) intent. Only a panel trigger directly requests expansion; run hosts leave initial invocation to the business handler.

useUiOverlayHost supplies forwarded buttonTrigger/anchor marker bindings and actual target refs, with current accessibility state and repeated-trigger routing. useUiOverlayView optionally supplies native dialog/manual-popover mechanics, focus/scroll cleanup, shared stacking registration, owner-aware Escape/outside handling and visual-viewport positioning. These helpers render no markup. Each backend owns actual surface, title, close affordance, body scrollport and footer. Modal roots establish a new Surface; nonmodal roots register Floating participants. Scope all child portals to their owning interaction and preserve default prevention by child controls. The backend must not enable vendor-controlled competing visibility or z-index ranks.

Preserve the [supplied content insets at both scroll extremes](../../contracts/layout.md#spacing-and-rendering-ownership).
Check how native flex/grid sizing interacts with the body scrollport and its
content: a child may shrink while its descendants overflow its box, extending
scrollable content beyond the trailing inset. Resolve that interaction at the
owning frame/layout boundary, preserving opaque child sizing, explicit nested
insets and deliberately bounded child scrollports. Choose the mechanism for the
actual integration; block flow, disabling flex shrink and removing minimum-size
constraints are not universal remedies. Verify the combined frame and content
with full native/theme styles in a real browser, using fitting and overflowing
content at both scroll extremes and after resizing. Correct isolated padding
declarations, layout tracks or lifecycle wiring do not establish correct combined
scrolling.

`useUiOverlayView` also returns an optional `arrow` element ref and reactive physical `placedSide` (`top`, `bottom`, `left`, `right`). An adapter can attach its native decorative arrow, using `placedSide` for native placement selectors. The helper updates its cross-axis `left`/`top` offset relative to the actual positioned parent after viewport clamping, respecting its border and rounded corners, and hides it when the pointer would fall outside the anchor or clamping moves the surface across that anchor. The backend owns the main-axis edge, native size/artwork/theme, `aria-hidden`, pointer exclusion and placement outside the body scrollport. Do not use the requested side as the final side after a flip. Verify moving/separate anchors, viewport shifts, RTL, size/theme changes and modal/nonmodal lifetimes; controlled DOM rectangles do not establish browser paint.

Use backend native surface tokens/slots; no application CSS or provider boundary is required. Title is optional only with an accessible name. Closed retained panels must be inert, unpainted and outside layout. Modal runs unmount content only after presentation cleanup. Verify owned controls, nested confirmation, partial setup failure, disabled/live owner changes and teardown. DOM shims cannot prove focus trapping, top-layer paint or geometry.

`useUiModalView` also accepts a fourth options argument `{ nativeSizing: true }` for other dialog-based frames. This leaves dimensions to backend-owned drawer/popover styles; UiModal keeps its existing shared width contract by default. Native sizing preserves the shared dialog lifecycle and focus behavior. Standard UiModal sections use the modal tooltip and header/footer allocations.


### UiFloatingViewProps

Backend UiFloating.vue receives edge, normalized position, draggable, active, requestPosition(position), moveLabel, positionLabel and doneLabel. Render the default slot as one viewport floating unit with no normal-flow allocation. Forward ordinary attributes to the actual root. Keep activation separate from movement and register the actual root through the shared z-order protocol. Do not elevate it into an unrelated native top layer.


### useUiFloatingView

Optional markup-free mechanics for independent views. Accepts reactive UiFloatingViewProps; returns root, ready, moving, style, attributes, editor, editing, movePanel, moveStyle, closeMove and move(percent). Bind root/style/attributes to the actual host; use ready to defer teleporting until mount, into useUiOverlayTarget or the document body. Render a named range while editing, bind editor to it, movePanel/moveStyle to its viewport-clamped containing surface and route input percentages through move. Stop pointerdown/contextmenu on that editor container so it cannot start another host movement. Supply a normal button for closeMove. Backend clearance comes from --ui-floating-clearance (unitless pixels); the helper accounts for safe areas, visual viewport and host size. It supplies drag threshold/cancellation/click suppression, Alt-arrow/context-menu/touch-hold alternatives, focus return, active-lifetime cleanup and actual CSS target registration. Backend owns all markup/theme treatment.


### UiDrawerLayoutViewProps

Backend UiDrawerLayout.vue receives height (content/full), resolved edge, active, pixel extent, measure(width, height) and optional core-resolved zItems for main/drawer allocations. Register these bindings through useUiZPart and retain their slot ancestry; core orders drawer above main without competing CSS ranks. Forward required main/drawer slots without interpreting business content. Measure the actual allocation and retain both child trees while changing tracks. Active reserves the extent at edge; inactive reserves no drawer track. Ordinary stacking remains core-owned.


### useUiDrawerLayoutView

Optional shared geometry mechanics, accepting reactive UiDrawerLayoutViewProps and returning root, style, mainStyle and drawerStyle. Attach root to the measured grid host, style to it and the corresponding style objects to independent main/drawer allocations. The helper observes actual host dimensions, projects all logical edges and registers the actual root. It creates no markup, scrolling policy, decorative insets or second split state. Full height needs a definite parent height; top/bottom docking needs that bounded axis.

Docking retains the same grid tracks while inactive extent is zero. The helper marks active-state transitions with `data-ui-drawer-motion`; backend CSS supplies grid transition timing and reduced-motion handling. Resizing otherwise updates immediately. Edge changes additionally mark `data-ui-drawer-reconfigure` while replacing incompatible track topology and settling native enter classes. Suppress allocation transitions and docked surface transforms/transitions for this short reconfiguration, then retain ordinary entry/exit motion. The backend docking frame clips moving content separately from its boundary/depth decoration, while the surface retains its resolved extent. The allocation itself must permit the decoration to paint toward main; do not clip the whole allocation or add another layout border. The supporting backends use private DrawerDock/DrawerDepth compositions, orienting the native shadow plane toward main for each edge/RTL. Its decoration stays out of hit testing and scrolling and uses native theme border/shadow treatment. `useUiOverlayView` exposes `visible` for physical entry/exit lifetime; a docked surface must remain rendered until both active and visible are false. Enter/leave hooks apply to docked surfaces too. Preserve retained children and native popup hosting.


### UiDrawerSizingBinding

Optional UiOverlayViewProps.drawerSizing carries resolved extent/min/max pixels, enabled, localized label, measure(available, font, root) and resize(value). measure reports visual-viewport space and current em/rem metrics. Core uses host bounds instead in docked mode. resize requests are constrained/availability-checked by core. UiOverlayViewProps.docked indicates an ordinary retained allocation: omit native popover, disable outward motion/modality, return the surface to its logical host and hide collapsed content. Preserve the same surface/component identity across panel/docked changes. Modal ownership stays fixed per mount. The view exposes its actual element along with open/close for ordinary docked target registration.


### useUiDrawerResize

Optional markup-free helper accepting a current-props getter and the actual surface ref. Returns attributes() for a named focusable separator and style() for current visible-viewport drawer bounds (omit those bounds when docked). Render the handle on the opposite edge from attachment, outside body scrolling, with touch-action:none, adequate hit area and visible focus. Apply style after resolved extent styling. It supplies physical/RTL-aware arrows (8px, Shift 40px), Home/End, current/min/max values, pointer cleanup and native gesture exclusion via data-vaul-no-drag. The helper neither closes nor expands a drawer. Backends must keep native drag dismissal independent, preserve header/footer access and avoid content remounts or competing size state.

The optional useUiZPopup option scopeActive() allows a retained surface that stops being a popup to forward its enclosing popup/Surface Floating scope to descendants. Omitting it preserves existing behavior. useUiOverlayView uses this for docking and serializes active/docked reconciliation; its native popover cleanup must tolerate attributes already removed by Vue. Retain meaningful focus during physical hosting changes. Verify nested popup opening after docking as well as native lifecycle and rendered target registration.


useUiOverlayView returns cssPanel for a retained mode change that would otherwise open a lower native surface above an already-live higher popup/modal. Bind it alongside docked when omitting the popover attribute; apply backend-owned ordinary overlay visibility/positioning while cssPanel is true and hide it when inactive. This keeps the same registered group and child content without reversing live native order or closing/reopening children. Docking reparents direct popup groups to the enclosing scope before releasing the parent popup group. Native styling/resize/close contracts remain unchanged. The fallback can remain ordinary for that overlay presentation; it does not promote itself over a modal. Verify the transition with an already-open nested popup, including focus and actual style visibility.
