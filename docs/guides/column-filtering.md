# Column filtering and separate query controls

A column filter is a business-defined restriction associated with that column. A compact header icon opens its editor; the business translates the result into the list query. This supports text, choices, ranges and domain-specific editors without a mandatory filter schema. It does not generate predicates from rendered cells.

## Ownership

- The business supplies value semantics, validation requirements, apply/clear policy and `filterActive`, choosing a built-in or custom editor. A reusable business component should encapsulate those details, accepting current criteria and an apply operation.
- Core supplies the typed filter slot, shared-query operation, popover lifetime and presentation observations. `filterBy` is an association only; it does not infer active state, automatically patch one property or generate an editor.
- Backends supply the compact filter trigger, active/focus treatment and native popover integration. They include the indicator in header measurement and isolate its events from sorting.

The `filter` slot receives `{ filters, setFilters, close }`. `setFilters` replaces the **whole** filter object: merge the current object when changing only one condition. It returns the list query operation's success boolean. `close()` completes the popup without changing criteria. Editors choose when to apply and close. Opening, Escape, outside and trigger dismissal do not implicitly apply drafts or roll back live changes. Popup content mounts on opening and unmounts on closing; retain editing state outside that lifetime only when the business workflow requires it.

`filterActive` describes an applied condition, independently of popup expansion. It defaults to false; arbitrary filter objects cannot reliably reveal whether a restriction exists. Clearing a restriction is distinct from filtering for empty values. Header and external editors must derive their applied values/state from the same query. Table loading blocks data-body interaction while retaining header anchors, so live filters remain open across delayed requests. The header's select-all action remains disabled while loading. Source processing happens once, including remote paging; never filter just the returned page as if it were the full dataset.

## Example: amount range

```vue
<!-- @vue-generic {Order, OrderFilters, OrderSort} -->
<UiCollectionField
  field-key="amount"
  label="Amount"
  sort-by="amount"
  filter-by="amountRange"
  :filter-active="amount.binding.active"
>
  <template #default="{ item }">{{ formatAmount(item.amount) }}</template>
  <template #filter="{ close }">
    <UiCollectionFilter :binding="amount.binding" @applied="close" />
  </template>
</UiCollectionField>
```

The business-owned amount control is created by createUiRangeFilterControl; its codec/definition owns amount meaning and its built-in view owns editing/completion. A supported convention is inclusive minimum/maximum bounds with either endpoint optional; this is a **business choice**, not an inferred universal range policy. In the demo, values use integer USD cents, reversed ranges cannot apply, both blank endpoints clear the restriction, and the same component is reused in the separate section. Status follows the same placement rule using the common choice-filter editor: a live checkbox list for Open and Complete in a column popup, and UiMultiSelect in the external row/panel. Both are initially checked (no status restriction); neither checked matches no rows. Each toggle immediately updates the shared query while the popup stays open; checking both clears only the status restriction. Dismissal does not undo already applied choices. The amount range validates its bounds together, using Apply or Enter in column and badge popups, and Enter/whole-editor focus exit in inline rows and panels. Both header icons reflect the shared query, and both editors move to the separate section when column filtering is unavailable. Search remains in the separate section in every presentation. Accepted criteria and owner-held drafts survive table/card changes in the shared-filter demo; explicit user popup dismissal discards uncommitted drafts.

The status popup shows only its choices: the column supplies visible context, and a scoped `uiFieldLabels('hidden')` retains the group's accessible name without repeating its heading. The external filter area keeps the visible Status field label on its multiple-selection control. Sharing filter logic does not require identical presentation in these two contexts.

Column-filter popups size to their business contents within the available viewport. A short checkbox list should not reserve the width of a larger editor. Backends own this sizing and native padding; business editors need no width CSS.

The compact range adaptation uses one `UiInputFrame` with two independently named `UiTextInput` bounds, separated by `~`. Only table-column popups show the Apply icon. The Clear icon clears both bounds and removes only the amount restriction. Apply is the form's native submit action, also available through Enter; other contexts use Enter or whole-editor focus exit. Mobile panels retain the compact range frame, omit Apply and use the completion behavior described below. Icon actions retain accessible labels and native browser title hints. Empty bounds remain open-ended; malformed or reversed bounds stay editable and do not query. One compound field owns parsing and validation. The popup hides the redundant group heading; the separate section retains it. This compact presentation does not require a typed range-expression syntax.

Clear is disabled when both draft bounds are empty and no amount restriction is applied. It remains available for unfinished text or an applied range, including when the user has manually emptied both bounds without applying that change.

## Separate section and controller observations

The order demo creates its keyword control with createUiSearchFilterControl and renders the built-in search presentation. An ordinary row shows its label. In the Orders header it is visible only for desktop Cards with Desktop filters: Fields; Table, Badges and compact mode use header-search, which hides it while retaining the accessible name “Order search”; a placeholder and trailing magnifier submit button present the search inside `UiInputFrame`, using ordinary `UiTextInput type="search"`. Enter or the magnifier applies the keyword once while preserving other filters. Typing alone does not query. Unfinished text survives unrelated filter changes and presentation/page hiding. The header reset icon clears search, filters and sorting together, including unfinished drafts. This is an adaptation of the existing collection UI; new frame verification scenarios remain on the Shared input frame demo page.

Special, cross-column and otherwise unrepresented filters belong in a separate section. Non-table presentations also place sorting there. This section remains an ordinary business composition, not a compulsory toolbar or query-builder component.

`createUiListControl` exposes read-only reactive booleans:

| Observation | True when |
| --- | --- |
| `control.hasColumnSort` | A mounted, active UiTable borrowing the binding declares at least one sortable column and the backend supports column sorting |
| `control.hasColumnFilter` | A mounted, active UiTable borrowing the binding declares at least one filter slot and the backend supports its header indicator/popup |

UiCollectionView's table mode uses UiTable and therefore reports these features. Cards and UiList do not. Before client mount, including SSR, these observations are false; after mount they settle reactively. They return to false when the last contributing view is deactivated/unmounted or the controller is disposed. Changing declarations updates them without a source request. Disabled controls retain their presentation capabilities.

Repeated reports with unchanged flags do not notify reactive consumers. This allows a business section to consume presentation observations without causing its own layout/slot updates to trigger a reporting loop.

With multiple views borrowing one binding, the flags aggregate **any** contributing table. They do not identify a specific view or detect CSS-only hiding/insufficient-width fallback. Unmount/deactivate views that should stop contributing. Do not hide the collection itself based on a flag it produces, or conditionally remove its filter declarations based on that flag.

```vue
<UiCollectionFilter
  v-if="!orders.hasColumnFilter"
  :binding="amount.binding"
/>
<OrderSortControls v-if="!orders.hasColumnSort" :control="orders" />
```

These flags are coarse presentation capabilities, not evidence that every criterion or sort key has a header equivalent. Omit only controls whose correspondence your business composition knows; keep unmatched filters/sorts available. Do not destructure the booleans into nonreactive snapshots. A single controller-selected presentation is the simplest use; more complex per-view/per-column availability is not exposed by these two flags.

## Native adaptation and acceptance

The column-filter contract requires a trigger plus business-editor popover. A native option-list filter alone cannot fulfill a slot accepting arbitrary business editors; adapt compatible popover and icon facilities while retaining shared query ownership. Concrete mappings belong in backend documentation. A dedicated native choice-filter definition is not introduced.

Verify that opening a filter does not sort or fetch; active state follows external query changes; applying/clearing changes only intended criteria and issues one read; invalid ranges issue none; Escape/outside dismissal preserves the query and returns focus appropriately; header indicators fit and are keyboard operable; switching table/cards moves equivalent controls without losing applied criteria or fetching; unmount/deactivation clears observations. Check narrow/RTL layouts and nested picker popups in a browser. DOM assertions do not establish painted geometry or assistive-technology acceptance.


## Shared filter definitions

The Orders demo creates its Status, Amount and Search sessions once through the built-in choice/range/search control factories and `createUiListFilterSource`. Column slots render `UiCollectionFilter` borrowing those bindings; the column host supplies table-column presentation context. The separate area borrows the same bindings with filter-row defaults. Editors use that context to omit a redundant heading in column popups. Active state comes from the shared definition, and updates transform the latest query instead of replacing stale snapshots.

The lower-level filter slot above remains supported, including its mount/unmount semantics. Owner-held filter sessions extend draft lifetime independently of that slot. Current hasColumnFilter observations remain coarse; the demo knows exactly which two filters have column counterparts. UiCollectionHeader arranges external query views and supplies row/panel context. [Badge/Add-filter presentation](collection-badges.md) uses explicit binding enumeration. Generic per-filter routing remains deferred. See [reusable collection filters](collection-filters.md) for the implemented API and lifecycle.


### Amount editor completion in a panel

The built-in range editor used by Orders uses its presentation context to expose explicit completion differently. Only table-column/popover context retains the Apply button. In every other context, including desktop rows, badge popovers and mobile panels, it omits the tick and submits on Enter from either bound, or when focus leaves the entire range editor. Moving between minimum, maximum and Clear never commits. This is the range view's completion route through the existing explicit filter binding, not a global blur policy or a switch to live filtering.

Both bounds validate together. Invalid/malformed/reversed drafts show existing field feedback without querying; focus-out errors do not steal focus. Enter can focus the invalid editor. IME composition Enter is ignored, and Enter followed by exit issues no duplicate request. The eraser retains its existing clear semantics without first applying unfinished bounds. The deferred focus-exit check allows internal focus restoration, Clear/reset and panel removal to settle; collapsing/removing the view cancels scheduled completion and preserves its owner-held draft. The search and status commit policies are unchanged.


### Amount errors in column popups

The built-in range view requests `uiValidationFailure('show-tooltip')` in any popover context, including table columns and badge editors. Supporting backends display an anchored error bubble, preserving invalid state and the accessible error description without letting the message determine the content-sized popup’s width. When the editor is in a popover above its owning modal’s header and footer, supporting backends show the error below the fields inside that popover. Invalid submission retains both drafts and keeps the popup open. Correction or Clear removes the error. Desktop filter rows and mobile panels retain ordinary below-field feedback. Presentation context changes feedback placement, not validation or query semantics.

See [built-in filters](filter-patterns.md) and [filter adaptations](filter-adaptations.md) for the reusable APIs behind the example.
