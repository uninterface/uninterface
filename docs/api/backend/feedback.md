# Feedback and read-only details

[Backend reference](README.md) · [API reference](../README.md)

Notices, badges, panels, empty/loading states and managed feedback targets.

### UiCardViewProps

`level: UiHierarchyLevel` is the original resolved structural request. `color: UiThemeColor | null` is the effective color after the local prop overrides the profile. `treatment: Required<UiCardTreatment>` contains all resolved portable requests. Use `color` for rendering, not treatment.color, which is the profile's default role. Core resolves both queries at the existing card node; views do not rerun negotiation or add another depth. uiHierarchyLevelQuery is also exported from the backend entry for custom integrations.

Views fulfill the complete treatment, including custom distinctions between -2/-1. Solid/dashed/dotted boundary requests also set the pattern of existing header/footer separators; double outer borders use solid separators. For border pattern changes preserve separator visibility, native color/thickness and footer background/foreground; prefer native pattern inputs and otherwise adapt only border style. Independently, treatment.footer requests normal or muted typography. Muted uses theme-muted foreground and smaller text without whole-region opacity or a child control-size strategy; normal restores the native/reference footer text scale. Keep nested card typography independent. Do not let a parent card pattern leak into nested card regions. The default profile shares those levels, but unconditional backend clamping must not discard explicit customization. See [uiCardPresentation](../../strategies/uiCardPresentation.md) for options and defaults. Neutral colors must reset private surface tokens on each card so nested cards do not accidentally inherit a parent's role. Preserve child-control palettes and body text readability.

UiCard.vue receives header/title/description/default/footer/top-end slots. An absent header must allocate no header space or separator; retain the frame and body insets. The optional top-end slot is a concise action group anchored to the frame’s logical upper trailing corner, independent of media and without creating a header/footer. Views own its inset, positioning and focus containment. Core omits known-empty corner output; no host is needed in that case. Preserve child identity and standard action semantics. Core forwards the public layout body through the same default view slot with `bodyLayout?: boolean` set to true. In that mode omit only the card body's own inset; preserve the body container and child identity, header/footer spacing, explicit descendant insets and nested default cards. False/omitted retains ordinary card padding. This flag supplies no bounded height or scroll policy. Core omits known-empty supporting content and suppresses title/description when header output is nonempty. Views own their DOM and native composition. Title wrappers may style direct author-supplied heading elements; arbitrary header content remains opaque. Title size never implies semantic heading rank. Preserve root attributes/listeners, child identity/focus and explicit nested content insets. Use stable native surfaces when treatments change. No implicit landmark, selection, disclosure, scrollport or sticky region is allowed. Every default level retains an enclosing boundary. Native overflow must not clip focus/content. Declare card.v1, card.color.v1, strategy.hierarchy-level.v1 and strategy.card-presentation.v1. See [UiCard](../components/UiCard.md).


## Inline feedback and read-only details


### UiNoticeViewProps

Routed notices additionally require `notice.binding.v1`. Optional `message?: string` and `details?: readonly string[]` supply normalized default content. Render them as text and related list items when no authored default slot exists; a default slot replaces both. Do not render HTML from strings. Core supplies generated UiButton actions through the ordinary actions slot and owns delivery dismissal/visibility. Preserve actual native content markup, announcement attributes, action order and title-only behavior. Verify bound content, inactive rendering, slot replacement and direct layout allocation release alongside existing notice cases.

`UiNotice.vue` receives `UiNoticeViewProps` (kind info/success/warning/error/custom, resolved optional color, optional variant filled/outline/soft, optional title, dismissible boolean, localized dismissLabel string, onDismissRequest callback), default/actions/icon slots, and resolved root role/aria-live/aria-atomic attributes. Fulfill notice.v1, notice.color.v1, notice.variant.v1 and notice.icon.v1 without inferring urgency from severity. Core resolves standard colors; absent color means neutral custom. A supplied icon slot is authoritative even when empty; otherwise use the standard kind icon or none for custom. Icons are decorative/noninteractive and hidden from assistive technology; message text carries meaning. Omitted variant uses the agreed less-solid default. Preserve supported theme extensions and use native variants or documented theme-token adaptations. Static notices must not retain a toolkit's implicit alert role. The body accepts rich block content and actions remain ordinary controls. Render a keyboard-operable, named, non-submit close button only when dismissible. Activation calls onDismissRequest; never remove/hide the notice or mutate native visibility independently. Native controlled models must remain open until the business owner removes the component. Core gates requests on current dismissibility. Preserve native close presentation and severity icons where supplied. Core supplies a text-button contextual default for ordinary UiButton actions through useUiButtonPresentation; backend notice views must not rewrite child props or force descendant CSS treatments. Actions keep source/tab order in a spaced, wrapping row below the message; rich action compositions own their interiors. For text-led ordinary action rows, align leading action content with the message where the notice inset permits; retain native target padding/height, peer spacing and focus treatment, and preserve containment when hanging space is insufficient. Non-text-led rows retain ordinary boundary alignment. Backend-owned selectors and size mappings must match actual rendered targets and respect RTL; no core DOM tree is prescribed. A title-only notice must not reserve an empty body. Adapt native markup only for concrete requirements such as valid rich-content HTML or keyboard operation.


### UiBadgeViewProps

`UiBadge.vue` receives `UiBadgeViewProps` (validated UiThemeColor), text content and root attributes. Fulfill badge.v1 with a passive label, not an interactive chip, live region or attached counter.


### UiKeyValueItemViewProps

`UiKeyValueList.vue` receives its default slot and root attributes, and renders a definition list. `UiKeyValueItem.vue` receives `UiKeyValueItemViewProps` (label string), a rich default value slot and group attributes. Fulfill key-value.v1 with dt/dd semantics and backend-owned responsive presentation. Never parse or normalize display values. No exposed handles or events are required by these four modules. Preserve child identity and native focus when props change.


## Tabs and collapsibles


### UiTabViewBinding

A declaration resolved by core: `key`, stable `tabId`/`panelId`, `selected`, `disabled`, and `attributes`. There is no text-label descriptor or mounted content. The scoped default slot receives `{ item }` and supplies that trigger's rich label. Preserve source order and stable key identity.


### UiTabsViewProps

UiTabs.vue receives readonly items, nonempty tablist `label`, and `orientation`. It renders only the tab bar. Emit `select(key)` for user requests; accepted selection comes back through items. Prefer native tab components, preserving native indicators, theme configuration and overflow. Supplement unsupported manual keyboard activation, controlled denial and separate-panel associations narrowly. UiTab is a logical core declaration and does not require a backend UiTab.vue module.

`useUiTabList(props)` supplies optional DOM focus mechanics: setElement, tabIndex, focus and keydown. It owns neither selection nor markup/styles. `useUiNativeTabList(props, select, { nativeAttributes? })` additionally binds a backend-owned root ref, synchronizes native trigger associations/tabindex and supplies captured keydown/focusin handlers. It uses native role targets when a toolkit does not expose trigger attributes. Set nativeAttributes=true when the toolkit already forwards trigger classes/styles/listeners, avoiding a second event route. Native adapters using post-mount synchronization must document initial SSR limitations rather than claim initial server-rendered associations. Capability tabs.v1.


### UiTabPanelViewProps

UiTabPanel.vue receives `tabId`, `panelId`, `activeTabId`, `selected`, sticky `mounted`, and `height: 'content' | 'full'`. Render a focusable named tabpanel, hidden and inert while inactive, with slot content only when mounted. Core owns retention; backends must not unmount content on deselection. Full height fills the owner's definite allocation; no decoration, insets, reserved inactive space or implicit scrolling is added.

`useUiTabPanel(props)` returns an element ref and recovers focus when selection hides the focused panel, while respecting a business operation that already moved focus elsewhere. Backend views supply focus presentation. Associated panels need not descend from the bar; never infer membership by DOM containment.


### UiCollapsibleViewProps

UiCollapsible.vue receives `UiCollapsibleViewProps`: expanded, disabled, mounted, triggerId, panelId and optional color (UiThemeColor). Its summary slot supplies noninteractive toggle content; the default slot supplies retained expandable content. Emit update:expanded(boolean) to request a new state, respecting current disabled state. The owner may decline: native local state must not commit independently. Use native toggles and indicators, preserve accessible expanded/content associations, and keep collapsed content inert even during exit motion. Use supplied IDs or consistently associated native IDs. Do not insert a document heading. Mounted controls whether the default slot is rendered; after first mount it must survive collapse. Root attributes must remain on the view root. Capability collapsible.v1. The core UiCollapsible consumes UiCollapsibleBinding and sends only resolved state to the backend; the backend never imports the expansion control. No implicit accordion registry, group layout or extra region landmark is required.


## Loading views and surface mechanics

`loading.indicator.v1` requires UiLoadingIndicator.vue with `UiLoadingIndicatorViewProps { label: string }`: optional default-slot text is visible; absent text uses the localized accessible label. Backend native artwork/animation/size strategy remain private. Do not give the indicator independent live announcements or interaction behavior.

`loading.region.v1` requires UiLoadingRegion.vue with `UiLoadingRegionViewProps { surface: UiLoadingSurface; loading: boolean; label: string; announce?: boolean; manageBusy?: boolean }`. The optional default slot replaces loading content. Collections pass announce=false because their elected status host already announces, and manageBusy=false because their real data element already receives aria-busy; ordinary regions announce politely. Use native loading masks/overlays when suitable, with independent keyboard blocking. 

`useUiLoadingSurface(target)` resolves a backend HTMLElement or native component `$el` ref into the three reactive surface references. It does not inspect descendant business components. `useUiLoadingRegion(props)` returns `visible`, `overlay` (bind to the mask root), viewport `style`, and `announcementHost`/`announcement` for a contained, visually hidden live message outside busy/inert ancestors. Insert the empty live host before publishing its first message. Backend views own markup, teleport placement and styling. Put data-ui-loading-overlay on mask roots and data-ui-loading-status on elected status announcements. Shared mechanics retain pre-existing inert/busy state, block content events, track scroll/resize, and recover focus without stealing it. The host remains responsible for its usable size and clipping shape. Masks inherit rounded corners and never set overflow:hidden on the ordinary content host.

UiCardViewProps adds loading and loadingLabel. UiCollectionViewProps adds loading (blocking initial/replacement read or external condition) and appending (nonblocking continuation); busy remains true for any activity. UiTable/UiList/UiCollectionView integrate the same region mechanics without replacing their native scrollports. Keep mask announcements outside inert content. Loading geometry attaches after client mounting; standalone indicators remain SSR-compatible. See the public loading guide for owner obligations and acceptance checks.


## Empty presentation

`empty.v1` requires the static UiEmpty.vue view and `UiEmptyViewProps { label: string }`. The label is the localized fallback; default, icon and actions slots supply optional business content. Empty direct default-slot output uses the fallback. Preserve attributes and ordinary interactive slot content. Do not add a mandatory illustration, heading, action, fixed height, frame or live announcement. Use compatible native empty components first; concrete markup and spacing remain backend-owned.

Collections require this capability. Successful-empty UiTable content belongs in its native empty area or a spanning tbody row; UiList and card collections host it in their collection region. Core supplies a default UiEmpty through the empty slot, so standalone and collection defaults share localization and strategy context. The custom empty slot replaces the whole presentation. Render it once and suppress it during loading/failure. Keep the existing elected collection announcement separate; the private CollectionStatus emptyInBody option suppresses its visible empty branch when the table owns that content.

Map message/icon/actions to compatible native slots or backend-owned markup, suppressing implicit artwork not requested by core. Verify optional slots, localized fallback, actions and table/list state transitions. Geometry, wrapping and assistive-technology acceptance require browser checks.


### Collection read failures

UiCollectionViewProps supplies optional `failurePlacement: 'initial' | 'replacement' | 'append'` whenever failed=true. Core derives it from state.failedRead, with accepted-result fallback for older/custom producers. Core supplies default error-slot content using UiNotice and UiButton; the backend invokes the slot with error/retry/canRetry and owns its placement. Default content uses localized safe messages, announcement=off and no dismissal. Do not forward raw error objects as attributes.

Initial failures use the data area (native table empty slot or a spanning tbody row); replacement failures use a supporting region above and outside the row viewport; append failures follow retained items in the continuation area. Use a compatible native append slot where available. A stable outer allocation frame keeps a bounded collection within its assigned height, with the row viewport taking the remaining space. Set overflow-x and overflow-y independently and preserve native sticky/fixed headers. Never duplicate the error in the trailing CollectionStatus. That helper retains the elected announcement, empty/continuation feedback and opt-in summaries.

Attach useUiCollectionView's failure ref to the rendered recovery region. Before it disappears due to retry/loading, the helper moves focus from its controls to target (or root fallback) without stealing unrelated focus. Native adapters must keep target wired to a real programmatically focusable table/list. Core clears failures on new reads; loading mechanics remain independent. Custom error slots preserve the same location and focus treatment. Verify all modes, late view mounting, retry semantics, private error containment and bounded placement.


## Managed toast and notification targets

`feedback.floating.v1` requires internal `FeedbackViewport.vue` and `FeedbackItem.vue` exports. These are backend implementation components, not public business components or mandatory template hosts. The viewport receives placement (UiFeedbackPlacement) and kind, resolves useUiOverlayTarget, registers its actual root with useUiZPopup(scope=true), and bounds/scrolls naturally flowing content. Never register a process-global queue or compete with the shared z-order allocator.


### UiFeedbackItemViewProps

`UiFeedbackItemViewProps` supplies id, surface toast/notification, placement, timing, kind, resolved color/optional variant, localized title/message/details/closeLabel/viewportLabel, announcement, dismissible, controlled open, pauseOnHover/pauseOnFocus/pauseWhenHidden, and onPresented/onExited/onPause/onDismissRequest callbacks. Default slot overrides message/details; actions slot contains real UiButtons. The currently supplied views retain native surface variants; variant does not yet select a floating treatment. Native timers are disabled: core owns the duration and remaining-time pause clock. `timing` is a reactive snapshot of duration, remaining milliseconds and startedAt (epoch milliseconds or null when stopped). A backend may sample elapsed time for native progress; it must not own a second expiry timer. Native exit must call onExited exactly when the item can release its allocation. onPresented starts expiry only after the native surface is present. Forced target teardown is immediate.


### Toast and notification focus standard

This is an Uninterface backend requirement for both toast and notification deliveries, including rich content; it is not a claim that every upstream toolkit provides it natively.

- Provide one keyboard-reachable, accessibly named entry point representing each delivery: the existing native focusable surface, or a designated content region when the surface is not focusable. Do not add a second equivalent surface/body Tab stop. Use the resolved title when available and the localized viewport label as the fallback name.
- When that surface or designated content region has **direct keyboard-visible focus**, paint one focus indicator around the entire visible delivery surface. A content region's focus indicator is deliberately projected onto its containing surface; do not also draw an inner body outline.
- When a descendant input, link, button or other control has focus, remove the delivery-level indicator and retain that control's normal visible focus treatment. Merely containing focus (`:focus-within`, or an unrestricted descendant `:focus-visible` match) must not activate the outer ring. Arbitrary scroll regions supplied by rich content do not become delivery entry points.
- Use the backend's focus tokens/treatment, preserve surface border/elevation and independent decorative shadows, and provide a visible forced-colors indicator. Keep sufficient clearance so viewport clipping does not cut off the indicator. A fallback focusable viewport needs its own visible indicator; it does not identify a particular delivery.
- Keep actual focus on the designated target. If that target scrolls, retain keyboard scrolling. Arrival must not capture focus. Preserve logical Tab order, opaque child identity, scoped Escape, dismissal recovery and the configured focus-pause behavior. Focus anywhere within a delivery may pause its timer even when only the focused child's indicator is visible.

Concrete markup, selectors, dimensions and colors remain backend-owned. Business authors supply no focus-ring classes or wrapper components. Ordinary scroll-host guidance uses an inward indicator; this delivery-specific standard intentionally projects the designated region's indicator onto the complete toast/notification surface.

Acceptance: traverse the entry point, rich input/link, close and footer actions with Tab and Shift+Tab; verify outer → control-only → outer transitions and clearing on departure. Test titled and untitled deliveries, identity through updates, pause/resume and Escape/dismissal, narrow LTR/RTL, light/dark and forced colors, and surface/viewport clearance. DOM assertions establish focusability and selector matching, not painted visibility or assistive-technology behavior; record browser and AT evidence separately.


### useUiFeedbackView

`useUiFeedbackView(props, root, { autoPresent?: boolean })` registers the actual popup/root and supplies events, summary and role. Default autoPresent runs after mount/nextTick; asynchronous native show integrations pass false and report actual presentation. Events coordinate pointer/focus pause and scoped Escape; hidden-document pause is attached to the actual ownerDocument. Focus recovery runs only when the closing item contains focus. Forward the supplied capture handlers as well as the bubbling handlers: pointer interaction recovers outside feedback (origin or viewport), while keyboard interaction retains continuation to another item. This prevents pointer dismissal from inadvertently focus-pausing a sibling. Render its delayed summary in a positioned, contained live region and keep rich content out of other native live regions. Exclude duplicate native announcement content. The root must be retained through native exit.

Managed feedback must isolate native document listeners, timers, live regions and stacking from independently authored services. Native lifecycle bridges must preserve rich slot identity, scoped keyboard close, resize/overflow, touch scrolling, summary-only announcements, modal/application scope, exit admission and theme customization. Concrete integrations and upstream feature limits belong in backend documentation. See the [public guide](../../guides/toasts-and-notifications.md) for ownership and acceptance.


## Reusing footer action arrangement

The supporting backends each own a private `FooterActions.vue` used by UiModal, OverlaySurface (drawer/popover) and FeedbackItem (toast/notification). It supplies a single arrangement implementation while forwarding ordinary slots/attributes and preserving DOM/Tab order, keys and opaque children. It does not invoke actions or add public authoring steps. Native containing regions supply spacing context where available; standalone feedback regions must supply the missing context rather than inheriting an unresolved gap. Custom footer/content compositions and inline UiNotice recovery actions retain their own ownership. Verify action placement, RTL, wrapping, focus order and keyed identity across all uses, not just one surface.



### UiProgressBarViewProps

Dedicated `UiProgressBar.vue` backend view for `progress.bar.v1`, shared by standalone and upload progress. Core supplies `value: number | null`, `max: number`, `fraction: number | null`, `label: string`, optional `valueText: string` and resolved `color: UiThemeColor` (primary when the consumer omits color). Numeric inputs are validated; preserve original value/minimum-zero/max semantics and exact fraction for paint. Null means unknown: render an indeterminate horizontal bar without a numeric current value or percentage text. Label names the actual semantic progress root; valueText supplies optional accessible value wording. There is no automatic live region, tab stop, completion event or operation ownership.

Fill the offered inline allocation with backend-owned block size and styling. Honor logical direction, light/dark, installed semantic colors and reduced motion. Unknown mode must remain distinguishable from a full measured bar without motion. Core resolves omitted color to primary; map the supplied semantic role through native/theme facilities. Native percentage widgets may need adaptation for original-range ARIA and precise fill. Native visual descendants hidden from AT must not create a second exposed progressbar. Standard root attributes and z-order registration target the semantic host. See [consumer progress guidance](../../guides/progress.md) for concrete five-backend mappings and observable checks.
