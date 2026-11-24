# UiTable

`UiTable` presents a [UiListBinding](../types/UiListBinding.md) through business-declared columns. Import from `@uninterface/uninterface`. It uses the same session as UiList; there is no second table controller or toolkit data authority.

Required props: `binding: UiListBinding<T, F, S>` and `aria-label: string`. `height`, `scroll`, `infinite`, `empty` and `error` follow [UiList](UiList.md). Table naming targets the table; scroll-region naming targets its actual scrollport. Arbitrary cells remain ordinary table content, including forms and actions; spreadsheet/grid keyboard behavior is not implied.

The default slot contains synchronous [UiTableColumn](UiTableColumn.md) declarations, directly or through reusable business components. Conditional/keyed declarations and reactive labels are intended to preserve keyed cell/editor identity. Native reorder limitations remain in some adapters; consult backend table documentation before relying on editor retention during reorder (see the sizing guide). Column registration is local to this view and cleaned up on removal. Async/Suspense and teleported declarations are unsupported. Changing binding identity requires keyed remount.

```vue
<UiTable :binding="orders.bindings.list" aria-label="Orders">
  <UiTableColumn :binding="nameColumn">
    <template #default="{ item }">{{ item.name }}</template>
  </UiTableColumn>
</UiTable>
```

Core owns registration, ordered sort intent and binding guards. Backends own real tables and header controls; source-returned rows are never filtered/sorted/paged again. Dedicated selection controls do not activate rows.

Sortable headers retain ordinary header typography and use native toolkit interaction where compatible. Adapted headers retain shared sort synchronization; composed controls use header typography and semantic sorting artwork. Native directional carets can request a specific direction. Single mode replaces a different column's clause; multiple mode preserves other clauses.

Verify a header cycles ascending, descending, absent with exactly one query each, respecting the declared single/multiple mode. Verify editor identity/drafts/focus after column reorder, selection shared with UiList, and child action isolation. [Presentation details](../../contracts/list-view-decisions.md) specify status, focus and continuation acceptance.

[Column sizing and alignment](../../guides/table-columns.md) describes preferred/minimum widths, mandatory spring participation, pointer/keyboard boundary resizing and header/cell alignment. Horizontal scrolling requires explicit permission. If fixed widths plus spring minima cannot fit, the mounted table is temporarily hidden behind a recoverable localized status; it retains drafts until space returns. Authors must supply usable responsive widths for their content.

## Height, scrolling and headers

`height="content"` (default) expands with the rows; an ancestor owns vertical scrolling. `height="full"` fills a bounded parent allocation and automatically scrolls overflowing rows vertically. It also enables a fixed/sticky header where the backend supports it. Horizontal scrolling remains opt-in through `scroll="horizontal"` or `scroll="both"`. Headers stay aligned with columns when scrolling horizontally.

```vue
<!-- The surrounding layout must already allocate bounded height. -->
<UiTable :binding="orders.bindings.list" aria-label="Orders" height="full">
  <!-- column declarations -->
</UiTable>
```

Full height does not prescribe a fixed number of pixels/rem. The layout owns the allocation; the table owns its overflowing rows. `scroll="none"` does not disable vertical scrolling on a full-height table. Content height has no internal vertical scrollbar. See [collection scrolling](../../guides/lists.md#height-and-scrolling) for the mode matrix and observable checks. A declared data summary stays visible at the bottom of the bounded table viewport; this is separate from custom supporting footer content.

## Footer and summaries

The optional `#footer="{ count }"` slot receives the number of accepted rows in this view (not the remote total). It renders outside the row scrollport below the table and remains visible in a bounded full-height allocation, including during horizontal scrolling. Use UiLayout to arrange a count and independent actions; this is ordinary content, not a toolbar or table data row. Footer content preserves its component identity during row updates.

Successful nonempty tables are quiet by default. `showSummary?: boolean` (default false) opts into the localized loaded-item summary when no custom footer is supplied. A custom footer replaces that visible summary. Loading, uninitialized, empty, stale and error feedback, explicit infinite-source completion, retry/continuation controls and the elected accessibility announcement remain independent; hiding the ready summary does not hide those states. A paginator or business footer can supply an appropriate count without duplicate text.

Verify footer count after add/remove, action availability during submission, no duplicate ready summary, retained error/retry feedback and live announcements, and footer reachability during horizontal scrolling. Footer support requires table.footer.v1; content sizing requires table.column-content.v1.

## Loading

`loading?: boolean` adds an external loading condition to the binding. Initial/replacement reads mask the visible data viewport; false never overrides binding loading. Appending shows a continuation indicator without blocking accepted rows. The mask blocks pointer/keyboard interaction and releases on completion. The owner remains responsible for ending external loading on failure or cancellation. See [loading](../../guides/loading.md) for surface ownership, native backend integration and verification.

With `infinite`, continuation loading, append failure/Retry and completion follow
accepted records inside the scrolling table body, before any creation row and
summary. They scroll with records; they are not pinned after the summary. Keep
the elected accessible announcement outside masked content. Verify this order
with and without a summary. Infinite mode requires a bounded vertical
scrollport; switching to manual content-height accumulation removes this
automatic continuation row.

Successful empty results default to [UiEmpty](UiEmpty.md); `#empty` replaces the whole presentation. See [empty-state guidance](../../guides/empty-states.md) for messages, actions and ownership.

Read failures default to UiNotice with Retry in its actions slot: initial failures in the data area, replacement failures above retained results outside row scrolling, and append failures at the continuation point. The existing `#error` slot replaces this content without changing placement. See [read failures and recovery](../../guides/lists.md#read-failures-and-recovery).

## Stacking

`zOrder?: UiZOrder` describes outward stacking. It establishes a stable outward context containing native local decoration; its view attaches the actual rendered roots without an additional wrapper. See [dynamic stacking](../../guides/dynamic-z-order.md) for scope, lifetime, pending refs and observable overlap checks. Core owns order; the backend owns rendering targets.

Sorting availability follows [UiListOptions.sorting](../types/UiListOptions.md): the source's allowed keys and `single`/`multiple` mode. Column `sortBy` offers an association; it does not grant source support. Omitted sorting configuration offers no user sorting. See [sorting capabilities](../../guides/collection-sorting.md).

## Business summaries

Optional summaryScope (default loaded), summaryLabel (localized Summary by default), summaryData: D and summarySource: UiCollectionSummarySource<T> configure field/column summary slots. Component generics are T, F, S, D. Summary declarations activate the presentation; showSummary remains the independent ready-count option. Core supplies lazy iteration and source metadata without calculating aggregates or fetching. See [collection summaries](../../guides/collection-summaries.md) and [slot context](../types/UiCollectionSummaryContext.md) for complete semantics, consumer obligations and checks.

Summary labels span leading table columns before the first declared summary value; a first-column value shares its cell with the label. Full-height table summaries stay visible at the bottom of the record viewport. Card summaries use a compact backend-owned surface outside the bounded record scrollport. Content-height summaries remain in normal flow. See the summary guide for placement and observable checks.

## Add row

Optional `addRow: UiButtonBinding` enables a specialized creation row after the data rows and before a declared summary. Supply a nonempty localized `addRowLabel: string` with it. Omitting both leaves ordinary tables unchanged; a label without its action rejects. The binding must be an ordinary `type: 'button'` action with `activate`, not a submit/reset binding. Requires `table.add-row.v1`.

```vue
<UiTable
  ref="lineTable"
  :binding="lines.bindings.list"
  aria-label="Invoice lines"
  :add-row="addLineBinding"
  add-row-label="New line"
>
  <!-- Existing column declarations -->
</UiTable>
```

The business-owned addLineBinding supplies `target: 'button'`, `type: 'button'`, reactive `disabled`/`loading` and an `activate` operation. It owns constructing/inserting the business draft, operation-specific restrictions and focusing its first editor after rendering. The table never creates a record, chooses default values, persists data or stages confirmation. A reusable business editor encapsulates this binding. See [editable collections](../../guides/editable-collections.md).

Backends tint each column’s content area inside the native cell insets, including selection allocation. The unshaded insets keep the column spaces distinct. A text-variant creation button is overlaid and centered within the visible allocation, including horizontal scrolling. No real editors, copied records, validation or source reads are mounted for the preview. It contributes no item count, summary values, selection or row activation. Column templates remain opaque: the preview conveys column space rather than inferring editor types, and has no per-column preview API. Backends own the tinted surface, native cell insets and text-button presentation through their theme.

The creation affordance is the final body row after all data rows, in normal vertical flow. It scrolls with the records; long tables require reaching the end to use it. It uses the ordinary data-row boundary treatment and is not a sticky footer. The declared summary remains independent, owns its top boundary and retains its visible bottom position in bounded tables. Short allocations may release header pinning so controls remain operable. Keyboard and pointer access must remain available without covering the final editor. See the backend's table documentation for native integration and rendering limits.

The action is unavailable while its binding is disabled/loading or the collection is disabled/busy. Ending one restriction cannot override another. Binding and live collection restrictions are rechecked at activation. The owner supplies loading state for an asynchronous creation operation; returning a promise does not create an independent pending-state owner. Existing feedback, scrolling and source error policies remain independent.

The instance method `focusAddRow(): Promise<boolean>` focuses the enabled creation action. It returns false when absent/unavailable or focus cannot be obtained; it never inserts a row. Use it after removing the final draft. Consumer refs may use the structural type `{ focusAddRow(): Promise<boolean> }`, because UiTable is a generic Vue component.

Verify that enabling the row adds one named action without adding editors/records or issuing reads; activation occurs once and respects independent locks. Check empty insertion, focus recovery, retained raw drafts, summary/count exclusion, column resizing/order, narrow horizontal scrolling, dark/RTL and short-window reachability. Native browser geometry and assistive-technology acceptance are distinct from DOM wiring.

## Infinite feedback customization

Optional `messages?: UiCollectionMessages` supplies per-view `listAppending`/`listComplete` string overrides; omitted keys retain application localization. Resolved text supplies visible defaults and the elected accessible announcement. Values are ordinary reactive string props; literal overrides remain literal on locale changes.

Slots `#infinity-loading` and `#infinity-complete` receive [UiCollectionInfinitySlotProps](../types/UiCollectionInfinitySlotProps.md): `{ message, loadedCount }`. They replace inline message content while retaining the backend indicator, spacing, continuation placement and independent observation sentinel. Loading applies only to infinite appends; completion requires an idle, nonempty, successful, non-stale infinite result with no more source records. Initial/refresh masks, empty results and errors retain their separate paths. Slots absent or returning empty Vue content use default wording; neither is used in manual mode. `showSummary` does not suppress infinite completion.

`#error` additionally receives `placement: 'initial' | 'replacement' | 'append'`; existing `error`, `retry` and `canRetry` retain their meanings. See [UiCollectionMessages](../types/UiCollectionMessages.md), [UiCollectionErrorSlotProps](../types/UiCollectionErrorSlotProps.md), and the [shared authoring example, ownership and verification](../../guides/collection-views.md#infinite-continuation-content). Slot content is not used to infer announcement text; do not add duplicate live regions or start reads during rendering.

For an immediate editable-child workflow, [collection editor coordination](../../guides/collection-editors.md) supplies the addRow binding, keyed Remove bindings and view-local focus registration. The business factory still owns new-record defaults and identity. The table's existing add-row presentation and focusAddRow API are unchanged.
