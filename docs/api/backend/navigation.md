# Navigation and menus

[Backend reference](README.md) · [API reference](../README.md)

Application navigation, entries, menus, breadcrumbs and context-menu hosting.

### UiNavbar implementation guidance

UiNavbar needs no binding type. It forwards the optional brand, default and actions slots in that order and standard attributes to its navigation landmark. Core supplies `data-navbar-orientation="horizontal" | "vertical"` and `data-navigation-boundary` on the view. Preserve both on the rendered root. See [UiNavbar](../components/UiNavbar.md) for the complete `navbar.v1` contract.

**Stack a vertical navbar vertically:** place branding above navigation, followed by actions, even when all three would fit in one row. Stack ordinary navigation links within their group as well. Keep groups at the start of the block axis; do not stretch the navigation group to distribute unused height or push actions to the far inline edge. Theme-owned spacing and wrapping within opaque branding/action content remain backend responsibilities. Horizontal navbars retain their always-visible wrapping row.

Core derives orientation from the nearest designated `UiRegionLayout` navigation allocation: horizontal region arrangement means a vertical side navbar; vertical region arrangement means a horizontal top/bottom navbar. Standalone and undesignated navbars default to horizontal. This is independent of viewport width, available space, elevation and separator visibility. No author CSS, width breakpoint or new public orientation prop is needed.

This is Uninterface's presentation advice, implemented by supporting backends. Bootstrap's [vertical nav guidance](https://getbootstrap.com/docs/6.0/components/nav/#vertical) supplies a conventional precedent for explicit stacking; its [navbar responsive behavior](https://getbootstrap.com/docs/6.0/components/navbar/#responsive-behaviors) does not define automatic sidebar orientation.

Render only the acknowledged logical boundary, including inline-start/end for vertical navbars and none when the region owns it; remove the default horizontal border in vertical mode. Core coordinates same-axis descendant menu boundaries. Keep explicitly selected UiNavMenu presentations and arbitrary child components intact; do not rotate their internal layout or change their controls through descendant CSS. Preserve slot identity, keyboard order, focus, accessible naming and ordinary link activation when orientation changes. No route state, collapse controls or menu keyboard behavior is added.

Verify start/end navigation allocations in both layout directions, framed/unframed states, LTR/RTL, narrow and generously wide side regions, multiple links, optional branding/actions and retained state/focus. A wide side navbar must still stack, while a wide top bar remains a row. DOM checks establish orientation and ownership; browser geometry verifies actual stacking and containment.

UiApp receives UiAppViewProps: the backend owns its root presentation, and the default slot supplies content. It must work without a UI context wrapper, preserve descendant order and identity, and apply fallthrough attributes to its outer surface. It must not invent landmarks, ARIA application semantics, implicit viewport sizing in document mode, clipping, or control ownership. See [UiApp](../components/UiApp.md) for the complete `app.root.v1` contract. Backend wrappers must pass the full available width through to content without root padding, gutters, centering, or maximum-width constraints. Inner layout remains a separate concern.

All types below are exported from `@uninterface/uninterface/backend`. They are data contracts for backend authors, not visual decisions the business must make. Bindings are reactive snapshots supplied by core; treat them as read-only. All non-optional members are required. [UiBackendDescriptor](../types/UiBackendDescriptor.md) is exported only from this backend-authoring entry. Business code inspects the active assembly through [getUiRuntime](../functions/getUiRuntime.md) from core.


### UiEntryStatusViewBinding

`pending`, `failed`, localized `message`, and `retryLabel`. Render status distinctly from business entries. Menu and navigation views expose retry when failed; UiSelect receives the collection state (`idle`, `loading`, `refreshing`, `ready`, `error`), pending and message, and leaves recovery actions to business source controls. Never infer source state from localized text. Do not fetch or publish competing result state.


### UiEntryViewNode

`entry: UiEntryViewNode["entry"]` is a projection of UiEntry with string-valued label, description and shortcut metadata, plus resolved loaded descendants. Optional children, expanded, selected, selectionMode, current, containsCurrent, request(event?) and status describe the view tree. Submenu children in this projection are loaded arrays, never business loader functions; use node children/status for presentation. Core resolves structure, scopes and branch state. Backends apply appropriate menu/check/radio or navigation semantics, never infer selection or current destination from focus. Cached child nodes may be supplied while collapsed; expanded alone controls visibility.


### UiMenuViewBinding

`entries`, `status`, `label`, `mode: 'inline' | 'popup'`, `open`. UiMenu.vue receives `binding` and emits open(), close(), activate(key), expand(key, open), retry(parentKey?). Slots are entry({ entry }), icon({ entry, icon }) and host(UiMenuHostBindings). Backends forward the host slot without supplying its button/target. Generate buttonTrigger/contextTrigger DOM-event and ARIA bindings using the shared open state; the actual event currentTarget supplies anchor and focus return, and a contextual pointer event supplies its location. Keyboard context requests anchor to their own target. Concrete DOM, popup placement, keyboard focus and indicators belong to the backend. Supply contextTrigger focus presentation through its opaque class; match backend theme conventions, preserve forced-colors visibility, and scope styling to the bound element rather than its descendants. On KeepAlive deactivation, close any floating surface and release global listeners, invalidate pending opening work, and avoid restoring focus to the inactive page. Core resets popup open state; backends do not dispose entry controls. See the entry contract for all required interactions.


### UiNavMenuViewBinding

`entries`, `status`, `label`, `presentation`, optional `boundary`. UiNavMenu.vue receives binding and emits activate(key), expand(key, open) and retry(parentKey?). Slots are entry/icon. Render the selected navigation presentation with native toolkit keyboard/focus behavior. Invoke node.request(event) once when supplied; otherwise emit activate. Hrefs retain native modified-link operations. Current ancestry never forces a transient popup open. Persistent branches expand in flow. Drawer hosting is outside UiNavMenu. Routing remains application-owned. See the navigation presentation obligations below.

Register the actual navigation surface and its owned popups through `useUiMenuPopup`, directly or via `useUiNavigationPresentation`. Core uses this registration to implement `UiNavMenu.ownsTarget()` across teleports, including during responsive focus handoffs. Keep unrelated menus out of that scope and release targets as their views unmount.


### useUiMenuView

Optional backend-authoring composable for command-menu interaction. Call it once in a backend view's setup with a reactive `() => UiMenuViewBinding` getter and its typed `open`, `close`, `activate`, `expand(key, open)` and `retry(key?)` emitter.

It returns `host` and `surface` DOM refs, an `id`, reactive `anchor` and pointer `point`, `hostBindings`, and `first`, `close`, `activated`, `expanded` and `keyboard` operations. The view binds `host` to its host container and `surface` to its current command surface, applies `id` to the named menu, forwards `hostBindings` through the host slot, and routes item activation/expansion through the returned operations. The binding remains authoritative: these operations request changes rather than maintaining a second menu model.

The helper implements command-menu roving focus, directional navigation, Home/End, typeahead, Escape, host invocation and focus return. It listens only to events belonging to its registered surfaces and cleans up on deactivation/unmount. It does not render markup, position overlays, choose appearance or implement a navigation menubar. A backend with compatible native widget mechanics may implement these responsibilities itself instead of using the helper.

An optional third argument accepts `contextTriggerClass?: string`, an opaque backend-owned class forwarded on the contextual binding, and `nativeInteraction?: (event?: KeyboardEvent) => boolean`. The latter delegates keyboard handling and roving focus to the toolkit while that callback returns true. Keyboard dispatch supplies the event, allowing a backend to delegate supported keys while supplementing genuine gaps; the roving-focus check calls it without an event. Host bindings, outside dismissal, surface registration and explicit focus-return operations remain available. The native adapter must handle Escape/Tab closure and report activation, and register teleported surfaces with `useUiMenuPopup`. This lets a backend retain native interaction while supplementing unsupported keys. The callback must not allow both handlers to process the same key event.


### useUiMenuPopup

Optional companion for a backend popup. Call it in setup with the popup's `Ref<HTMLElement | undefined>`. It registers that surface and its logical descendant popup surfaces with the nearest menu view, independently of DOM containment or teleport destination. It returns `contains(target: Node | null): boolean`, useful when a toolkit's outside-dismissal callback must distinguish an actual outside target from a descendant overlay. Registrations are removed when the surface changes or its scope ends.

Backend views still own overlay placement, direction/theme propagation, available viewport bounds and toolkit lifecycle. Navigation views may use this registration with their appropriate native keyboard pattern. Verify nested teleported menus, sibling switching, outside dismissal, unmount/deactivation, lazy content, disabled commands and focus return; no particular popup element or native Popover API attribute is required.


### useUiMenuIconColumn

`useUiMenuIconColumn(entries: () => readonly UiEntryViewNode[], options?: { group?: () => boolean; enabled?: () => boolean; reserve?: () => boolean }): ComputedRef<boolean>` is an optional setup helper for backend menu views. It detects icons at the current level, descending through groups but not submenus. Set `group` for a transparent group to inherit the parent surface's reactive decision. Ordinary recursive submenu calls start a fresh scope. Set reserve to retain the column for vertical navigation roots and persistent tree descendants even when artwork is absent. Set `enabled` to false for horizontal root navigation; child popup scopes remain independent.

The helper only shares icon presence. Backends render native leading slots or equal-width empty, aria-hidden columns without invoking an icon slot for entries lacking an icon. Dimensions, label spacing, trailing carets, group decoration and RTL styling remain backend-owned. Unknown lazy children acquire a column when entries arrive; retained entries preserve their current column during refresh. Verify mixed siblings, icons occurring only inside a group, icon-free submenus under icon-bearing parents, horizontal roots, and lazy/update removal of the last icon.


### syncUiTargetAttributes

`syncUiTargetAttributes(target: Element, attributes: Record<string, unknown>): void` applies ordinary native attributes and Vue-style event listeners to a toolkit's actual focus target when the toolkit cannot forward them correctly. Call it after mount and updates. Pass only attributes that this helper owns, merging protected binding attributes after caller attributes. Class/style remain surface-owned; value/checked remain toolkit-model-owned and are ignored.

It removes previously managed attributes/listeners that are absent, preserves Vue `Once`/`Capture`/`Passive` suffix semantics, updates handler values without rearming fired once listeners, and respects `stopImmediatePropagation` for handler arrays. `syncUiTargetAttributes(target, {})` releases managed attributes/listeners when an adapter retains a target past its own lifetime. Storage is weakly keyed by target. Do not use it to override a toolkit's own model/events; prefer supported native-target props where they preserve the contract. Unit coverage verifies listener phase/options, updates and removal; integration must additionally verify the actual rendered target.


### UiLinkViewProps

Render a native destination with optional semantic color and current-page indication. Preserve standard target/download attributes and capture listeners. Disabled removes the active destination. Core routes binding requests.

```ts
export interface UiLinkViewProps {
 href?: string
 color?: UiThemeColor
 disabled: boolean
 current: boolean
}
```


### UiBreadcrumbsViewProps

Render a named navigation landmark and ordered trail. The default scoped slot receives item and supplies label content only. The backend owns each link/text target and its native breadcrumb treatment. Forward item.attributes (including capture listeners) to that target, use item.href for its destination, and expose exactly one current-page marker. Disabled and current items have no active destination. Separators are decorative. Do not infer application hierarchy.

```ts
export interface UiBreadcrumbsViewProps {
  status?: UiEntryStatusViewBinding
  retry?(): void
 label: string
 items: readonly {
   key: string
   current: boolean
   href?: string
   disabled: boolean
   attributes: Record<string, unknown>
 }[]
}
```


## Navigation menu presentations and hosting

`UiNavMenuViewBinding` supplies presentation (horizontal/vertical-tree/vertical-popup/icon-popup). Entry nodes include containsCurrent and an optional request(event) callback; use the callback once for ordinary native activation, synchronously passing the MouseEvent before browser navigation. Retain modified-link operations. Callback absence retains activate emission for manually constructed bindings. Core supplies navigation-only entries with shortcut and check selection removed; do not reserve a command-check column.

Render leading icons and forward entry/icon slots at every depth, including groups. Current ancestors use the toolkit's active treatment without receiving aria-current. Persistent branches use native in-flow disclosure/list behavior; transient branches use native floating behavior. Never infer a confirmed destination from a click.

`UiBreadcrumbsViewProps` adds optional status/retry and per-item actionable. Text-only ancestors stay text; key-only actionable ancestors need keyboard-operable buttons; hrefs remain links. Render localized status without a fabricated trail and retry for failed metadata. Root/nav landmark and live-region markup stay backend-owned.


### useUiNavigationPresentation

`useUiNavigationPresentation(binding: () => UiNavMenuViewBinding, surface: Ref<HTMLElement | undefined>)` is an optional backend helper for mode-switch mechanics. It measures the backend surface before/after a presentation change, animates changed width/height with reduced-motion support, cancels interrupted motion and retains focus on an available entry or ancestor. It returns hint, hintId and target event bindings for rail labels on hover/focus; the backend renders the themed tooltip in its overlay target (body when none), with the supplied position and identity. Escape/scroll/teardown dismisses it without consuming native menu interaction. An expanded rail root suppresses its hint, including a hint already visible before native expansion. Render only one hint mechanism per item; do not add a second native tooltip alongside it. Backends render their own surface and rows; data-entry-key identifies focus targets. This helper does not determine row dimensions or icon artwork.

UiNavMenuViewBinding.boundary is none or a logical inline-start/inline-end/block-start/block-end edge. Core coordinates ownership; backends render exactly that root edge (or the normal orientation edge for manually constructed bindings that omit it), removing duplicate native root borders while preserving active indicators. UiNavbar receives data-navigation-boundary on its target. Root vertical geometry must agree across tree/flyout/rail; floating submenu surfaces remain independently sized. Native rows and leading slots supply geometry; core does not prescribe a DOM tree. The default catalogue includes menu-item for missing rail artwork.


### Keyboard context-menu event ownership

When consuming ContextMenu or Shift+F10 for a UiMenu context trigger, cancel the shortcut and preserve its trigger as the keyboard anchor/focus-return target. A browser may dispatch a subsequent `contextmenu` after focus enters a teleported popup; the original host listener cannot catch that event. The optional useUiMenuView helper guards one pending context event within the trigger/registered popup family, including key-release dispatch, and resets on subsequent keydown, pointerdown, close or lifecycle cleanup. Do not globally disable native context menus, suppress unrelated targets, or reinterpret the follow-up as a new pointer invocation. Verify Escape return to the original trigger and ordinary later right-click behavior; DOM event wiring does not establish browser-native UI acceptance.


### Context-menu point and viewport resizing

`useUiMenuPoint(source, anchor)` is an optional backend helper. Both arguments are getters: `source` supplies the original readonly `{ x: number; y: number } | undefined` in client coordinates, and `anchor` supplies the invoking `HTMLElement | undefined`. It returns a computed effective point, clamped independently to the current document viewport width/height. The source point is never mutated; growing the viewport restores the original point where possible. Undefined leaves button/keyboard element anchoring intact.

The helper observes the anchor's owning window only while mounted/active with a point. It updates on resize, source/anchor replacement and KeepAlive reactivation, removing listeners on deactivation/unmount or switching to an element anchor. Before a client viewport is available it returns a copy of the source; no server DOM access is required. This helper constrains the document viewport for ordinary window resizing, not a separate pinch-zoom/virtual-keyboard policy.

Backend views consume this point through their native floating reference or backend positioning mechanism. The backend owns flipping, collision margins, final viewport constraints, sizing and descendant positioning. Do not overwrite the original click point, remount the menu, close it or move focus merely to accommodate resize. Validate root and nested menus through shrinking/expanding viewports; DOM/state tests do not prove painted containment.


