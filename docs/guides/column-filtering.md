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

Use createUiRangeFilterControl to own an amount range and its codec. For example, store amounts in integer cents, make both inclusive bounds optional, reject a reversed range and clear the restriction when both bounds are blank. Use the same binding when the editor moves to the external section. A status filter can use live checkboxes for Open and Complete in a column popup and a UiMultiSelect in the external area. If both choices represent the entire domain, the application can map both checked to no restriction and neither checked to no matches. Dismissing the live editor leaves accepted choices in effect. Verify that the header indicators follow the accepted query, responsive view removal retains owner-held drafts, and explicit popup cancellation follows the host’s draft policy.

The status popup shows only its choices: the column supplies visible context, and a scoped `uiFieldLabels('hidden')` retains the group's accessible name without repeating its heading. The external filter area keeps the visible Status field label on its multiple-selection control. Sharing filter logic does not require identical presentation in these two contexts.

Column-filter popups size to their business contents within the available viewport. A short checkbox list should not reserve the width of a larger editor. Backends own this sizing and native padding; business editors need no width CSS.

The compact range adaptation uses one `UiInputFrame` with two independently named `UiTextInput` bounds, separated by `~`. The Clear icon clears both bounds and removes only the amount restriction. Icon actions retain accessible labels and native browser title hints. Empty bounds remain open-ended. Malformed or reversed bounds stay editable and issue no query. One compound field owns parsing and validation. The popup hides the redundant group heading, while the separate section retains it. See [amount editor completion](#amount-editor-completion-in-a-panel) for the apply behavior in each context.

Clear is disabled when both draft bounds are empty and no amount restriction is applied. It remains available for unfinished text or an applied range, including when the user has manually emptied both bounds without applying that change.

## Separate section and controller observations

Use createUiSearchFilterControl for keyword search and keep its view external across presentations. The normal row context shows the label. Where UiCollectionHeader supplies `header-search`, the built-in editor can hide the visual label while retaining its accessible name. Enter or the magnifier submits once and preserves other filters. Typing alone issues no query. Keep the search binding with its owner so unrelated query changes or view replacement preserve its draft. Use an explicit reset binding when clearing search, filters and sorting together.

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

Create the choice, range and search bindings once through their public control factories and createUiListFilterSource. Let column slots and the external area borrow the same bindings through UiCollectionFilter. Column hosts supply table-column context, and ordinary external rows supply filter-row context. Active state comes from the shared definition, and updates transform the latest query.

The lower-level filter slot above remains supported, including its mount/unmount semantics. Owner-held filter sessions extend draft lifetime independently of that slot. Use the coarse hasColumnFilter observation together with application knowledge of which specific filters have column counterparts. UiCollectionHeader arranges external query views and supplies row/panel context. [Badge/Add-filter presentation](collection-badges.md) uses explicit binding enumeration. Generic per-filter routing remains deferred. See [reusable collection filters](collection-filters.md) for the implemented API and lifecycle.


### Amount editor completion in a panel

The built-in range editor shows Apply in table-column and badge popovers, with Enter as an equivalent action. Inline rows and panels apply on Enter or when focus leaves the entire range editor. Moving between minimum, maximum and Clear does not commit. See [host context and individual behavior](collection-presentation.md#host-context-and-individual-behavior).

Both bounds validate together. Invalid/malformed/reversed drafts show existing field feedback without querying; focus-out errors do not steal focus. Enter can focus the invalid editor. IME composition Enter is ignored, and Enter followed by exit issues no duplicate request. The eraser retains its existing clear semantics without first applying unfinished bounds. The deferred focus-exit check allows internal focus restoration, Clear/reset and panel removal to settle; collapsing/removing the view cancels scheduled completion and preserves its owner-held draft. The search and status commit policies are unchanged.


### Amount errors in column popups

The built-in range view requests `uiValidationFailure('show-tooltip')` in any popover context, including table columns and badge editors. Supporting backends display an anchored error bubble, preserving invalid state and the accessible error description without letting the message determine the content-sized popup’s width. When the editor is in a popover above its owning modal’s header and footer, supporting backends show the error below the fields inside that popover. Invalid submission retains both drafts and keeps the popup open. Correction or Clear removes the error. Desktop filter rows and mobile panels retain ordinary below-field feedback. Presentation context changes feedback placement, not validation or query semantics.

See [built-in filters](filter-patterns.md) and [filter adaptations](filter-adaptations.md) for the reusable APIs behind the example.
