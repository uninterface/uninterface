# List sessions and sources

A list session coordinates a collection of business records: its accepted results, requested query, selection, pagination and item operations. Business code supplies identity, query meaning, persistence and permissions. The session owns UI state; a borrowing presentation must not own another copy of that state.

The control, source helper, column bindings and UiList/UiTable/UiTableColumn/UiPaginator/UiPaginatorSizeSelect/UiPaginatorJumper are implemented with a supporting backend. Shared DOM checks cover query/selection/action synchronization and retained editors. Presentation acceptance also requires browser geometry, focus and assistive-technology checks; controller and DOM passes alone do not establish these. The [child-collection/form bridge](editable-collections.md) is implemented. See the [presentation contract](../contracts/list-view-decisions.md) for selected behavior and limits.

## Own one session

Create the control inside the business composition that owns its lifetime. Initial loading is explicit; creating or borrowing a binding never invokes the source. Call `dispose()` when the owning session ends, independently of any borrowing view.

```ts
import { onMounted, onScopeDispose } from 'vue'
import { createUiListControl } from '@uninterface/uninterface'

interface Order { id: string; amount: number }
interface Filters { minimum: number }

const orders = createUiListControl<Order, Filters, 'amount'>({
  itemKey: order => order.id,
  sorting: { mode: 'multiple', keys: ['amount'] },
  query: { filters: { minimum: 0 }, sort: [] },
  async source(query, { signal }) {
    const response = await fetch('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
      signal,
    })
    if (!response.ok) throw new Error('Orders unavailable')
    const items: Order[] = await response.json()
    return { items, complete: true }
  },
})
onMounted(() => orders.refresh())
onScopeDispose(() => orders.dispose())
```

The endpoint in this example returns all matches. Applications must validate external response data at their service boundary. The controller validates identity and pagination metadata; it does not validate the domain fields of each record.

A source returning a result directly settles in the same turn; it does not leave a loading frame between local projection updates. A promised source retains pending/loading behavior until it settles. This distinction keeps synchronous editable projections from interrupting native focus or invoking blur formatting. Both forms retain the same result validation, failure and supersession rules.

`refresh()` resolves to whether its result was accepted. Source exceptions become `state.error`; they do not replace retained results with an empty list. Superseded or disposed requests resolve `false` even if the source ignores cancellation. Unsupported owner operations and invalid query/configuration arguments reject or throw. See [UiListControl](../api/types/UiListControl.md).

Accepted membership arrays and query snapshots are immutable. Business item objects retain their identity and are not deep-cloned or frozen. Do not change their keys or mutate them through a view. Supply canonical replacements through `applyConfirmed`, or update the model and refresh deliberately.

## Translate the query once

`setQuery({ filters, sort })` makes one request, restarting pagination at its initial position. Sort descriptors are ordered and use a business vocabulary. A source is responsible for their meaning. Backend widgets must not filter, sort or slice the returned records again. The business integration must expose only sorting supported by its source. See [sorting capabilities](collection-sorting.md) for allowed keys, single/multiple levels and enforcement of initial, programmatic and header requests.

Queries snapshot plain objects, arrays, finite numbers, strings, booleans, null and undefined. Encode dates as strings and identifiers as ordinary data. Functions, class instances, cyclic objects and nonfinite numbers are rejected. This prevents a caller changing a nested filter after dispatch from silently changing the meaning of the accepted result.

For complete local data, use [createUiLocalListSource](../api/functions/createUiLocalListSource.md):

```ts
import { createUiLocalListSource } from '@uninterface/uninterface'

const source = createUiLocalListSource<Order, Filters, 'amount'>({
  items: () => savedOrders.value,
  matches: (order, filters) => order.amount >= filters.minimum,
  compare: { amount: (left, right) => left.amount - right.amount },
})
```

The helper observes the model only when called. It filters, stably sorts, then optionally pages a copied membership array, preserving item identity. It does not watch the model, grant editing rights, synchronize a parent form or automatically refresh after a write. The owner chooses when to refresh. Local numbered pagination clamps an out-of-range requested page after deletion; remote sources must supply their own authoritative correction.

## Choose pagination from actual source capabilities

UiPaginator uses native toolkit pagination for known page bounds with supported jumps. Backends choose compatible native pagination components or supply their own presentation. Business consumers keep the same binding and do not select toolkit widgets. Cursor/unknown-total/non-jump sources retain capability-appropriate navigation. Native widgets do not own data fetching or silently correct a retained page after deletion; the session/source owns reconciliation.

Numbered pagination requires a page size and explicit `canJump`. The source returns a known matching `total`, or an explicit `hasNext` when the total is unknown. Full pages alone do not establish another page. Optional `pageSizes` belong to the session, so multiple borrowers cannot introduce conflicting size choices.

Cursor pagination returns opaque `next` and optional `previous` continuations. `next: null` declares the end; omitted `previous` means no previous route. `previous: null` explicitly routes to the initial null cursor. A known total does not confer random access. No cursor history is synthesized. See [UiListPaginationOptions](../api/types/UiListPaginationOptions.md) and [UiPaginatorBinding](../api/types/UiPaginatorBinding.md).

`state.query` describes the requested position. `state.result.query` and `pagination.accepted` describe the retained records. On failure they remain different until retry, restart or another successful destination. Label retained records using accepted metadata. A successful zero-result numbered source has page count zero; a presentation must avoid “page 1 of 0.”

## Accumulate continuation results

Set cursor `mode: 'accumulate'` to retain accepted chunks. The owner still performs the first `refresh()`. Subsequent `bindings.list.loadMore()` requests append through the controller; duplicate triggers while pending return `false`. Matching keys replace their values at their existing positions; new keys append in response order.

Append failure preserves all records and the failed cursor. Automatic `loadMore()` stops; explicit `retry()` retries that cursor. Repeated continuations or nonterminal chunks with no new identities produce a retryable error instead of an automatic loop. An empty terminal chunk can complete a collection. Refresh, filter, sort and page-size changes restart accumulation; late old chunks cannot join the new results.

Completion of traversal is distinct from claiming a complete matching collection. A non-null initial cursor may start partway through a source. The result is marked complete at the terminal chunk only when its accumulated length equals a known total, or traversal began at the null initial cursor with an unknown total. There is no automatic item eviction or virtualization.

Set the boolean `infinite` prop on UiCollectionView, UiList or UiTable in a bounded vertical scroll allocation. Its backend reports actual near-end/visibility observations; core allows at most three successful automatic chunks per near-end episode. Genuine scroll gestures (including keyboard scrolling), resize or threshold reentry renew the budget, while visibility changes and remounting do not. Infinite views have no Load more action. Their named scrollport is keyboard-operable; End, Page Down and equivalent scrolling gestures can request continuation even at an underfilled boundary. Failures still require explicit Retry. No UiPaginator is needed. Verify actual scrolling geometry, retained reading position and keyboard continuation in the consuming application.

## Keep selection and item actions separate

Selection is optional and stores string or finite numeric keys. It survives paging, filtering and same-key replacement. `selectPage` changes only eligible accepted keys and requires multiple selection. Unloaded keys cannot be newly selected; existing retained keys can be deselected. Confirmed removal clears that key. Business eligibility and item/session restrictions are live callbacks.

`bindings.list.context(key)` supplies the current accepted item, selected state, permissions, pending/error observations and optional `UiButtonBinding` actions. Its remove button invokes the configured operation and owns duplicate guards, loading and error state. Retrying an item operation means invoking its action again; list `retry()` retries a read. Activation, selection and removal are separate; none makes the whole row implicitly interactive. Item restrictions govern controller interactions, not arbitrary links or content inside a business item.

```ts
const saved = await saveOrder(draft)
orders.applyConfirmed({
  kind: 'upsert',
  item: saved,
  reconciliation: {}, // Explicit assertion: existing membership/order unchanged.
})
```

Use that assertion only when the business integration knows membership and order remain correct. Known insertion requires an index; exclusion is explicit. A membership change to a result with a known total requires an authoritative new total. Page overflow is rejected; use unknown reconciliation and refresh when a complete replacement window is needed. [UiListChange](../api/types/UiListChange.md) defines these cases.

With `reconciliation: 'unknown'`, an existing canonical record can replace its old value, but a new record is not inserted at a guessed position. Confirmed removal hides the known key. The result becomes stale, totals/offset knowledge is cleared, and the owner decides when to refresh. Neither route silently refetches. Confirmed updates invalidate older reads even when those reads ignore cancellation.

## Verify ownership and outcomes

Verify one source call per query transition, unchanged item identity through local projection, separate requested/accepted positions after failure, retained selection, one operation per action activation and no late publication after disposal. Race tests should control promise resolution rather than sleep. Presentation acceptance additionally needs real keyboard, naming, focus, scrolling, localization and status-announcement checks; it cannot be inferred from these control guarantees.

Nested child editing needs an explicit bridge for full-draft validation, raw input, baseline/reset, locks, key reconciliation and editor lifetime. Use [createUiListValueControl](../api/functions/createUiListValueControl.md) and the [editable-collections guide](editable-collections.md). Do not substitute projected-array writes or per-view child forms for that integration.


## Borrowing views

```vue
<UiTable :binding="orders.bindings.list" aria-label="Orders">
  <UiTableColumn :binding="amountColumn">
    <template #default="{ item }">{{ item.amount }}</template>
  </UiTableColumn>
</UiTable>
<UiList :binding="orders.bindings.list" aria-label="Order summaries" column-width="18rem">
  <template #default="{ item }">{{ item.amount }}</template>
</UiList>
<UiPaginator :binding="orders.bindings.paginator!" aria-label="Order pages" />
```

Create amountColumn with `createUiTableColumnBinding(orders.bindings.list, () => ({ columnKey: 'amount', label: 'Amount', sortBy: 'amount' }))`, using the source's declared `amount` sort key above. A sort key need not be a record property. A direct UiTableColumn declaration instead uses an explicit Vue generic annotation. The business owns labels, filter editors and cell content; it supplies no backend-specific CSS or toolkit definitions.

Use `height="full" scroll="vertical"` only inside a definite parent height. `columns` requests an exact count; `column-width` requests a preferred minimum and collapses to the available width. Column declarations must be synchronous and remain inside their table host. Reusable business components are supported without inspecting their internals.

Verify simultaneous table/list/paginators share one load/query/selection authority, nested actions invoke once, source processing occurs once, arbitrary editor drafts survive column reorder, and removing a view does not dispose the owner. Visual/scroll/focus and assistive-technology checks remain separate from DOM evidence.

## Application examples and observable workflows

The demo's Collections destination supplies an asynchronous order browser. `OrderBrowser` encapsulates the list session and receives typed service operations. `OrderCollection` declares one set of UiCollectionField values and UiCollectionButton actions for a table, full-width cards or a responsive card grid. Automatic presentation uses the independent responsive context. Selection lives inside card headers and selected cards have a theme-owned indication; status/protection badges occupy the header's trailing edge. Independent paginator, size select and jumper controls borrow the same pagination facet. `OrderEditorDialog` hosts New and Edit in a modal, closing after successful saves and confirming dirty dismissal. `OrderEditorForm` retains codecs, validation, locks and baseline handling outside presentation changes; ordinary callers supply typed initial data and save. The service owns records and performs filtering/sorting/paging once. See [collection views](collection-views.md) for the authoring contract.

Confirmed updates use known reconciliation only when the service can describe the current window. A same-key edit or an insertion into a partially filled last page can update without refetching. A change that would require unseen replacement rows uses unknown reconciliation and exposes Refresh. Known deletion can leave a shorter accepted page; refresh obtains its replacement records. Selection retains stable keys through refreshed objects and view changes.

Collections offers Pages and Infinite scrolling over the same Orders source and UiCollectionView definitions. Infinite mode uses cursor accumulation and the boolean `infinite` prop in both tables and cards. Its bounded viewport requests continuation near the end through pointer, touch or keyboard scrolling, without a Load more action, paginator or invented total. Failed append retains accepted rows and needs explicit Retry; terminal metadata ends loading. Filtering/refresh replaces the query generation. Confirmed writes invalidate cursor positions and the owner refreshes the current query before continuing. Hiding/deactivating the view pauses automatic observation without discarding the owner. Switching Browsing deliberately starts a new query/selection session while preserving service records; presentation changes retain the session.

The Invoices destination starts with 56 saved invoices. UiCollectionHeader
contains reference search and New invoice; UiCollectionView shares reference,
line-count, total and Edit definitions between a desktop table and mobile cards.
UiCollectionFooter arranges the range/total, page size, paginator and jumper.
The default is ten invoices per page, with 5/10/20/50 choices. The collection
body scrolls while the page title, query header and footers remain visible.

Search trims surrounding whitespace and matches a case-insensitive reference
substring. Clearing and submitting restores the collection; a changed keyword
resets pagination to page one. The standard search-filter session owns unfinished
input independently of the view. New invoice and Edit open a dedicated modal
with all editable line items visible, without line search or pagination. Save
refreshes the current outer query so membership, counts and page contents reflect
the accepted invoice; a new invoice may appear on another page and a changed
reference may leave the current search. Failed save preserves the open draft,
and dirty dismissal offers Keep editing or Discard. Each modal run owns a fresh
editor session. Demo settings contains the one-shot failure simulation and
Things to try, outside the business collection. See [editable
collections](editable-collections.md) for full-draft ownership and validation.

The Files destination uses an unpaged list for already-saved attachments. The existing acquisition forms remain the only add workflow. Same-key saves upsert canonical descriptors; item-context removal updates the stand-in persistence and its projection. Upload drafts and preview URL ownership remain independent.

Verify these workflows through the actual compositions: one source call per accepted query action, no reads caused by mounting additional views, full selection/query retention, immediate known changes, explicit stale reconciliation, no automatic failure loop, and cleanup after navigation/disposal. Browser geometry, real focus/keyboard behavior, theme/zoom and assistive-technology acceptance remain separate.

## Column allocation

Use preferredWidth, minWidth, spring, resizable and align on direct or bound UiTableColumn definitions. See [table column sizing and alignment](table-columns.md) for responsive allocation, drag/keyboard interaction, explicit overflow and consumer obligations.

## Counts and table actions

A successful list/table does not display “N items loaded” by default. Use showSummary only when that generic visible summary serves the workflow; loading, empty/error/stale states and accessibility announcements remain independent. Paginators can already display the range and matching total. UiTable also supports #footer="{ count }" for business counts and actions, arranged with UiLayout. The invoice line footer puts the item count at start and Add line at end; it has no pagination or search. Its read-only line amount is quantity × unit amount using typed values, with the existing provisional-total warning when inputs are invalid. Only the mobile line table explicitly allows horizontal scrolling.

## Compose pagination controls independently

UiPaginator renders only first/previous/pages/next/last. UiPaginatorSizeSelect and UiPaginatorJumper borrow the same binding and work without a paginator ancestor. No showTotal/showRange/showPageSize flags or addition slots are provided. Each borrower stays independent of the session lifetime and never loads merely because it mounts.

```vue
<UiLayout>
  <span v-if="pages.range && pages.total !== undefined">
    {{ t('orders.range', { start: pages.range.start, end: pages.range.end, total: pages.total }) }}
  </span>
  <UiLayout direction="horizontal" wrap align="center">
    <UiPaginator :binding="pages" aria-label="Order pages" />
    <UiPaginatorSizeSelect :binding="pages" />
    <UiPaginatorJumper :binding="pages" />
  </UiLayout>
</UiLayout>
```

Here pages is orders.bindings.paginator!, and t is the application's localization function. Statistics are ordinary business text using readonly accepted metadata, not additional components. Layout owns arrangement. Backends keep control surfaces at the same or similar normal height, with inline jumper labels; no business CSS is required. Verify known/unknown totals, optional component omission, shared navigation/size state, local jump validation and no mount/remount requests.


## Height and scrolling

The parent owns height allocation; UiList/UiTable own their overflow policy. A content-height collection grows with its rows and leaves vertical scrolling to an ancestor. A full-height collection consumes an already bounded parent and automatically scrolls its rows internally. Setting full height alone does not bound an otherwise unbounded page. Use a full-height region/layout allocation when the collection should occupy the remaining viewport space; do not put it inside an unbounded content-height card and expect a viewport to be invented.

| Height | Scroll request | Result |
| --- | --- | --- |
| `content` (default) | omitted / `none` | No internal scrolling; parent owns vertical overflow |
| `content` | `horizontal` | Horizontal scrolling allowed; rows expand vertically |
| `full` | omitted / `none` / `vertical` | Internal vertical scrolling; no horizontal scrollbar |
| `full` | `horizontal` / `both` | Internal scrolling on both axes |

`vertical`/`both` with content height is rejected. Bounded tables automatically keep headers visible where supported. Pinning applies within the collection, not to the whole page. Horizontally scrolling headers move with their columns. Lists have no generated header to pin. Footer pinning is not part of this rule.

Backends set each overflow axis explicitly; a shorthand `overflow: auto` must not implicitly enable the other axis. Content-height horizontal scrollports suppress the vertical scrollbar while retaining full row height; bounded scrollports suppress the horizontal scrollbar unless permitted. Native toolkit scrollports are allowed, with accessible naming, focus and continuation observation attached to the actual scrolling element.

Observable checks: use enough rows to exceed the allocation; the bounded collection stays within its assigned height while rows move on vertical scroll and the table header stays visible. Removing full height restores natural height without a vertical scrollbar. Test horizontal permission independently in both modes, resize the allocation, and verify the last row, footer, focus, selection and editor state remain reachable/preserved. Browser tests cover the axis matrix, row/header movement, resize and last-row reachability; existing collection tests separately exercise focus/editor behavior. DOM tests verify mode normalization and native option wiring, not geometry.

## Read failures and recovery

UiTable, UiList and UiCollectionView supply an error UiNotice by default, with Retry in its actions slot. A source failure is not an empty result. No demo-specific markup or CSS is required.

| Failed operation | Presentation |
|---|---|
| Initial read, before any accepted result | Error notice in the data area; tables use the native empty area or a spanning body row. Do not show UiEmpty. |
| Replacement read: refresh, search, sorting or page change | Notice above retained results, outside the row scrollport. Explain that previous results remain and may not match the requested filters/page. |
| Append/load more | Notice after retained items at the continuation point. Existing items stay usable. |

For bounded collections, the replacement notice consumes supporting space within the allocation and the rows receive the remainder. The notice does not cover rows or scroll away with them. Backends preserve separate horizontal/vertical scroll policies and native fixed headers. Append recovery uses a native append area or equivalent region following retained rows.

Retry repeats the failed query and read mode; it does not infer a new query from current search-editor text. The control rejects duplicate requests synchronously and clears the previous failure when a new read begins. Initial/replacement retry uses the normal loading mask, while append retry uses continuation activity. Success removes the failure; another rejection presents it again. A failed replacement retains the accepted result and its pagination metadata. Custom binding producers should supply `state.failedRead` to distinguish append from replacement failures, including after view remount; unspecified failures fall back to initial/replacement based on accepted-result presence.

The default notice is not dismissible. Hiding it could make retained results appear current. Its message is localized and safe; raw service errors are not rendered or forwarded to DOM attributes. Collection announcements retain one elected owner, so the default notice has announcement=off. When a focused recovery control disappears for retry or refresh, backend mechanics move focus to the collection's semantic table/list target before removal; an unrelated focus destination is not disturbed. Loading can temporarily take focus within its region and restores a meaningful target afterward.

Use `#error="{ error, placement, retry, canRetry }"` only for business-specific wording or recovery. It replaces the notice content at the same operation-dependent location; `placement` is `'initial'`, `'replacement'` or `'append'`. Adapt private errors to safe messages, keep recovery actions within UiNotice's actions slot, honor canRetry, and avoid duplicating the collection announcement. Row-action failures are a separate item-level concern; they do not replace the collection read notice.

Observable checks: exercise initial, replacement and append failure, including remount after failure; confirm one notice with one Retry per view, retained row identity, exact failed-query retry and pending guards. Verify focused Retry removal, no focus stealing, custom error slots and no private error leakage. Check bounded scrolling, action wrapping, narrow/RTL layouts and native table placement in a browser; DOM tests alone do not establish geometry or assistive-technology acceptance.

### Declare user sorting

Pass `sorting: { mode: 'single' | 'multiple', keys: [...] }` to createUiListControl when the source accepts user sorting. Omission means none; a column sortBy alone cannot grant it. Initial/programmatic requests are checked before a read. Use createUiCollectionSortBinding with business field labels to reuse the built-in sort panel alongside table headers. See [source capability](collection-sorting.md) and [collection panels](collection-panels.md).

For per-view infinite-loading/completion wording and inline content, use the [shared infinity slots and message overrides](collection-views.md#infinite-continuation-content). They preserve continuation, indicators and the single elected announcement.
