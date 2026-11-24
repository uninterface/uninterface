# Collection filter and sort badges

Use `collectionFilterBadges` and `collectionSortBadges` when applied criteria should occupy compact, wrapping rows. These are built-in presentation objects with `view(context)` implementations, not standard components. Badge bodies never open an editor or toggle a direction. Filter badge bodies remain passive. Its cross removes the criterion. With multiple active sort rules, sort badge bodies accept direct dragging and keyboard priority changes without an extra menu button. Changing a filter value or sort direction still requires removing and adding it again.

See the [selection reference](collection-presentation.md) for all presentation layers and defaults, and [customization recipes](collection-customization.md) for conditional selection or replacement views.

## Ownership and authoring

Filter controls remain business-owned. Supply the eligible non-search filter bindings explicitly; a presentation cannot discover definitions by inspecting Vue slots. Each binding supplies its stable key, localized label, applied-value summary (without repeating the label), availability, editing policy and business-defined clear operation. One active filter definition produces one badge, including compound ranges and multiple-choice values. The displayed key is the human label, not the internal identifier. Repeated instances of a definition are not supported.

```vue
<UiCollectionHeader
  :filter-bindings="[status.binding, amount.binding]"
  :filter-panel="collectionFilterBadges"
  :sort-binding="sorting"
  :sort-panel="collectionSortBadges"
  :reset="resetQuery"
>
  <template #search><UiCollectionFilter :binding="search.binding" /></template>
  <template #actions><!-- collection actions --></template>
</UiCollectionHeader>
```

Import the two adaptations from `@uninterface/uninterface`. Create filters and the source-backed sorting binding in the owning business component; do not recreate them during render. `filterBindings` generates the filter content when no nonempty filters slot is supplied. An explicitly selected alternative filter adaptation receives those bindings in both long-row and narrow hosts. With the default filterPanel, long-row renders fields inline directly; narrow-expandable invokes the stacked filter panel. Custom opaque filter slots continue to work without enumeration; badge presentation specifically requires the binding list.

A standalone host can call `collectionSortBadges.view({ binding: sorting })` or `collectionFilterBadges.view({ bindings, render })`. The badge adaptation uses bindings to render its selected editor and does not call render; that callback remains part of the common panel context for other adaptations. Do not simultaneously mount another editor for the same filter. Summary badges themselves do not claim an editor.

The Orders demo uses sort badges on desktop cards, ordinary sort panels in narrow layouts, and no redundant table sort panel at any width; sorted table headers supply priority menus when multiple rules are active. The Display card's Desktop filters option selects fields or badges for non-column filters. Table-column filters and narrow panels retain their established presentations. The application can choose different combinations without changing query ownership.

## Adding and removing filters

Add filter opens a popup menu containing available inactive definitions. The menu owns keyboard entry, navigation and dismissal; it is not nested in another framed popover. Selecting one closes the menu and opens its existing editor in `filter-badge` / `popover` context. A visible popup title supplies the label. Choosing a type alone does not modify the query or create a badge. Only an accepted active criterion appears in the list. When accepting the last available criterion disables Add, keyboard completion returns to that badge’s enabled remove action. Outside dismissal preserves the chosen outside focus target.

Live choices update their badge immediately and keep the popup open so multiple choices remain possible. The editor initially anchors to Add filter, then to its corresponding badge as soon as that badge exists. This transfers positioning without closing/remounting the editor or changing focus. If the criterion becomes unrestricted and its badge disappears, positioning returns to Add filter; the badge body remains passive. The original Add trigger continues to own trigger dismissal and ordinary focus return, with the enabled badge-removal fallback when Add is unavailable. Small choice sets use the same checkbox/radio presentation as column popups. Explicit editors close after successful submission. The range editor supplies an Apply action in badge context; Enter from either bound uses the same completion route. Moving between bounds, Clear and outside focus does not submit. This makes committing explicit and keeps ordinary popup dismissal a cancellation route. Invalid drafts do not produce a badge or query; range errors use tooltip feedback to avoid widening the popup. Escape, outside dismissal and trigger cancellation discard unaccepted drafts; live changes already accepted remain. Responsive removal/disposal of the view preserves owner-held drafts. Applications supplying custom explicit editors must provide an operable submit route.

The cross calls the binding's clear operation, which defines the unrestricted criterion; it does not guess an empty value. It is disabled when clearing is unavailable. Removing an applied criterion also clears its unfinished draft through the existing binding semantics. This cross means removal from the badge list; the eraser within an editor retains its distinct clear-value meaning. Search and unrelated criteria remain untouched.

## Adding and removing sorting

Add sort offers only the source's allowed unused fields. Each field opens ascending/descending choices with direction icons. Selecting a direction appends one complete rule and causes one source query; merely choosing a field changes nothing. Badges show field label and direction icon, with a full accessible description including the direction.

Badge order is sort priority and follows the source query in both LTR and RTL. Removal preserves the relative order of remaining rules. Adding a removed field places it last. With multiple active rules, Tab focuses a badge body; Alt+Shift+Left/Right moves it one position in the visual inline direction. In RTL, Right moves earlier and Left moves later. At wrapped row boundaries, movement follows that same ordered sequence. Focus stays with the moved criterion. Keyboard reorder focus outlines the whole badge, including its removal area; tabbing to the cross instead shows that button’s independent focus treatment. Ordinary click and unmodified arrow keys do not reorder or change direction.

Drag a badge body to the leading/trailing side of another badge. An insertion marker previews the position, including across wrapped rows; only a valid drop updates the source, once. Escape, pointer cancellation, an outside drop, scrolling/resizing, disposal, disabled state or an external order change cancels the gesture without applying it. A short movement threshold separates dragging from clicking. The removal cross is independent. Touch uses a horizontal starting gesture for dragging; a vertical starting swipe retains page/parent scrolling. Dragging does not auto-scroll to offscreen targets; scroll first, then start a new drag.

The focusable body has a localized position/direction name, shortcut description and native hover hint; successful movement has a polite position announcement. Shortcut handling is local to the focused body and does not replace OS/browser shortcuts globally. Platform-reserved shortcuts can remain unavailable; validate the deployment's keyboard environment. Reordering preserves field identities and directions. Sorted Table headers retain their explicit Move earlier / Move later menus, and narrow sort panels retain their existing actions. No ellipsis menu remains inside sort badges.

Single-sort mode disables Add once a rule exists; removal makes it available again. A lone sort badge needs no reorder target. The source still owns sorting before pagination. The presentation never sorts remote page results or fetches all remote records. No additional business configuration is required for these built-in interactions.

## Native presentation and verification

The shared adaptation owns eligibility, lifecycle and source operations. Private backend views supply native tags/chips or badge surfaces with real, named remove buttons. Remove affordances retain criterion-specific naming, controlled activation and disabled state. Concrete mappings belong in backend documentation. UiBadge remains passive and unchanged. Filter badge groups request content width and wrap within the offered space, allowing search and Reset to share the header row; native dimensions and colors remain backend-owned.

Check that selecting an add option alone creates no read, only applied criteria appear, and filter badge bodies stay passive while sort bodies become focusable only when reordering is available. Neither body invokes editing. Verify direct pointer/touch and keyboard reordering, boundary no-ops, retained focus/direction, cancel/outside-drop behavior, wrapped rows, direction selection, source order, duplicate/single-mode restrictions, disabled/stale invocations, long localized labels, wrapping and RTL. Verify named crosses and focus returning to Add after removal, keyboard chooser/submenu navigation, popup dismissal, live versus explicit completion, invalid drafts, and no duplicate editor claims when switching presentations. DOM tests cannot establish painted geometry or real-browser keyboard acceptance.
