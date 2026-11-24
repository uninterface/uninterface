# List control and presentation APIs

[List contract](list.md) · [Contracts](README.md)

The control/source subset is implemented: [createUiListControl](../api/functions/createUiListControl.md), [createUiLocalListSource](../api/functions/createUiLocalListSource.md), shared list/paginator bindings, selection and explicit confirmed changes. Their exact usable API is documented in the [list guide](../guides/lists.md) and per-export references.

UiList, UiTable, UiTableColumn and UiPaginator borrow the same session. See the [view/value contract](list-view-decisions.md) for behavior and the [editable-collection guide](../guides/editable-collections.md) for parent-value ownership.

## Composition model

One collection interaction can serve a table, a file list or a business-authored card list. It must also support a collection of sub-objects inside a parent editing session. Business code owns data, persistence, permissions and query meaning. The controller owns collection orchestration. Views borrow bindings and report intent.

Two cases illustrate the ownership boundaries: asynchronous orders with canonical confirmed saves, and local invoice lines whose raw child drafts participate in one parent form. Simple retained attachments provide an additional acceptance case without changing file acquisition or introducing another upload workflow.

## Supported surface

| Surface | Availability and responsibility |
|---|---|
| `createUiListControl`, control/source/query/result types | Implemented; see the [control API](../api/types/UiListControl.md) |
| `UiListBinding<T, F, S>` | Implemented producer contract; intended to drive both list and table |
| `UiPaginatorBinding` | Implemented optional navigation facet of that same session |
| `UiList` | Implemented keyed vertical/grid presentation with business item slots |
| `UiTable` / `UiTableColumn` | Implemented row presentation and declarative column meaning |
| `UiPaginator` | Implemented navigation-only borrowing view |
| Optional column-binding producer | Implemented `createUiTableColumnBinding` with typed identity/label/query associations; no separate table controller required |
| Child-collection/value bridge | Implemented; see the editable-collections guide, not a writable-array shortcut |

Selection and pagination remain optional. A direct `items`/`itemKey` view convenience is not implemented or selected; managed views preserve the shared binding boundary.

## Sources and operations

The implemented source is an ordinary `(query, { signal }) => result` function, synchronous or asynchronous. Results explicitly declare completeness and optional numbered/cursor metadata. Queries are immutable snapshots; accepted items retain business object identity. Read status and mutation status are separate. Initial load and owner disposal are explicit.

See [UiListOptions](../api/types/UiListOptions.md), [UiListResult](../api/types/UiListResult.md) and [UiListChange](../api/types/UiListChange.md) for exact requirements. Local processing happens once in the source helper; accepted source windows are never processed again by a view. Local reactive invalidation is explicit owner refresh, not an automatic watcher. The parent draft is a separate owner; see [editable collections](../guides/editable-collections.md).

## Async records: control and table

The implemented view syntax keeps direct column declarations and arbitrary cell slots:

```vue
<UiTable :binding="orders.bindings.list" :aria-label="t('orders.title')">
  <!-- @vue-generic {Order, OrderFilters, OrderSortKey} -->
  <UiTableColumn column-key="number" :label="t('order.number')">
    <template #default="{ item }">{{ item.number }}</template>
  </UiTableColumn>
  <!-- @vue-generic {Order, OrderFilters, OrderSortKey} -->
  <UiTableColumn column-key="total" :label="t('order.total')" sort-by="total">
    <template #default="{ item }">{{ formatMoney(item.total, item.currency) }}</template>
  </UiTableColumn>
  <!-- @vue-generic {Order, OrderFilters, OrderSortKey} -->
  <UiTableColumn column-key="actions" :label="t('order.actions')">
    <template #default="{ context }">
      <UiButton v-if="context.bindings.removeButton" :binding="context.bindings.removeButton">
        {{ t('order.remove') }}
      </UiButton>
    </template>
  </UiTableColumn>
</UiTable>
```

These public views are available. Direct columns use explicit Vue generic arguments; bound columns infer them from the implemented binding helper. A parent table's type does not automatically flow into an independently declared Vue child.

Cell slots receive `{ item, context }`, matching UiList. There is no separate accessor-derived `value`. Column identity, display content and sort/filter association are independent. An action column does not need a data accessor. Optional column bindings may encapsulate any business column, not a fixed catalogue, and must remain compatible with the collection session. Bound declarations cannot add competing identity/query props.

Registration/normalization must preserve declaration order through conditional columns, keyed loops and reusable business column components, including SSR and reactive localized labels. Opaque component internals must not be inspected. Source-correct header sorting must update the same ordered query as external controls, preserve unrelated sort clauses in multiple mode, replace the selected clause in single mode, and supply accessible sort meaning. The selected cycle and synchronous registration/order protocol are defined in [view/value decisions](list-view-decisions.md); verify SSR/hydration and reactive composition against the selected backend’s documented envelope.

### Confirmed saves

Canonical save reconciliation is implemented independently of views. The integration explicitly asserts known membership/placement/total effects, or marks them unknown. Known same-key updates need no refetch; unknown new records are not blindly appended. Earlier reads cannot erase a confirmed update. See [UiListChange](../api/types/UiListChange.md); optimistic rollback and eventual-consistency version policies remain separate.

## The same records as a list

UiList owns keyed iteration and list-item semantics; its default slot supplies `{ item, context }`. Business content can be a summary, card or `UiFilePreview` thumbnail row. No mandatory card, heading, upload workflow, clickable row or separate item controller is introduced.

UiList supports vertical and grid arrangements by exact column count or preferred minimum width, fitting responsively to one column in narrow allocations. Props, bounded scrolling and automatic continuation follow [list/table allocation](list-view-decisions.md#listtable-allocation-and-continuation) and the [UiList reference](../api/components/UiList.md). Virtualization is separate.

Pending/empty/error/stale presentation must distinguish absent data from successful empty results and preserve retained-query meaning. Selected `#empty` and `#error` payloads and retry behavior are specified in [state/focus](list-view-decisions.md#state-slots-announcements-and-focus). Selection controls must preserve nested actions/editor focus; supplying selection or activation must not make arbitrary item content activate both operations.

A responsive composition may switch table/list or mount both over one binding. Borrowing never loads, resets or disposes. Backends own markup, toolkit integration, focus and styling. An ordinary table containing editors is not automatically an ARIA spreadsheet grid.

## Pagination: one control facet, optional views

The [implemented paginator binding](../api/types/UiPaginatorBinding.md) owns no independent page model. It exposes requested/accepted positions, source-supported navigation, known counts/range and allowed sizes from the list session. It can be borrowed multiple times or used without mounting any view.

### Infinite browsing without a paginator

Cursor accumulation is owned by the controller. UiList and UiTable report near-end intent through the binding, never call the source or maintain their own appended array/cursor. They supply keyboard continuation, an underfilled-viewport request budget and explicit retry without an automatic failure loop. See [continuation rules](list-view-decisions.md#listtable-allocation-and-continuation) for visibility, request-budget and cleanup obligations.

Appending must preserve reading position, keyed identity and focus. Hidden/retained views pause observers; unmount releases them without disposing the owner. Reactivation may resume observation without restarting the session. Completion stops further requests. Virtualization and automatic item eviction remain separate.

### Borrowing paginator views

UiPaginator, UiPaginatorSizeSelect and UiPaginatorJumper are independent implemented borrowers with no mounted-view lifecycle effects. Statistics belong to application text from readonly metadata. Controls guard actual capabilities without invented values; see [paginator presentation](list-view-decisions.md#paginator-optional-presentation).

### Modes and source metadata

Numbered and cursor source modes are implemented; see [pagination options](../api/types/UiListPaginationOptions.md) and [result metadata](../api/types/UiListPaginationResult.md). Known totals do not grant cursor jumps. Previous routes come from the source; no history is synthesized. Empty numbered results have zero result pages, although the initial request is page 1.

### Facet and binding

The producer facet is [UiPaginatorBinding](../api/types/UiPaginatorBinding.md). The navigation view implements localized first/previous/pages/next/last controls. Size selection and jumping have separate components. Native numbered widgets are appropriate only when their required counts and random access actually exist; otherwise backends must supply compatible native previous/next controls.

### Query transitions and failure

Implemented filter/sort/size transitions restart position in one read. Relative navigation is guarded while pending; supported absolute numbered intent can supersede it. Failed intent remains retryable with its accepted records labeled separately. Source-expired cursor errors require explicit retry/restart rather than reinterpretation.

Known remote mutations beyond a new last page mark reconciliation required; no unseen replacement row or total is invented. Local source refresh can recompute and clamp. These control choices do not determine focus movement or announcement policy.

### Control and view example

The intended composition is one UiTable or UiList using `orders.bindings.list` and an optional UiPaginator using `orders.bindings.paginator`, all with appropriate `aria-label` values. A cursor-backed infinite list omits UiPaginator entirely. Optional sibling UiPaginatorSizeSelect and UiPaginatorJumper share that binding. Applications render optional statistics as ordinary text; available knowledge and choices belong to the control.

Successful requests do not imply moving focus to the first item. Announcements must avoid duplication across simultaneous lists/tables/paginators. Native markup and exact button windows remain backend-owned; their naming/state/keyboard behavior requires rendered and browser acceptance.

## Nested invoice lines: the editing boundary

The reusable parent-value bridge is available as `createUiListValueControl`. The [parent-value contract](list-view-decisions.md#parent-value-bridge) defines staged membership, explicit conflicts and reveal-before-focus. It must connect a complete authoritative draft/baseline to keyed child editors, including unfinished invalid input. A source helper plus `getItems`/`setItems` watchers is insufficient.

Required guarantees:

- Insert/remove/replace/move and child edits participate in parent draft notifications, dirty state, validation invalidation, locks and baseline acceptance.
- Raw invalid input survives view changes and blocks parent Save even when a typed projection retains the last valid value.
- Validation covers hidden/filtered children; failure reveal restores their page/item before focusing a field.
- Reset restores membership, order, values and feedback, releases removed editors and invalidates obsolete async validation.
- Saved canonical results reconcile temporary identities/baselines with an explicit unsaved-edit conflict policy.
- Filtering/sorting/paging never changes the submitted full collection. Business reorder is a keyed operation, distinct from view sorting.
- Editors belong to the owning session, survive view removal, and participate once even with multiple simultaneous views. Removal/session disposal releases them exactly once.
- Parent Save does not independently persist every child. Business calculations, cross-line rules and permissions remain supplied by the composition.

The ordinary consumer of an encapsulated invoice editor supplies typed initial data and a save callback, not field/control reconstruction. A column heading alone does not establish an editor's accessible name. General schema editing and spreadsheet keyboard behavior remain outside this integration.

## Retained attachments as a small acceptance case

The Files demo borrows a list control, renders UiFilePreview thumbnail rows through UiList and routes removal through the item-context button. Existing acquisition/save callbacks remain the only add workflow; accepted canonical same-key descriptors replace retained values. The actual file workflow has DOM coverage, including preview cleanup.

Keep saved attachments separate from pending upload/form drafts and preserve File/object-URL cleanup. Reimplementing UiFileCollection or changing its API is not part of this contract.

## Observable acceptance and next decisions

Control tests establish scheduling, query snapshots, metadata, selection and confirmed-action behavior. Remaining component acceptance must establish identical item/context delivery in list/table, typed direct/reusable columns, SSR order, reactive declarations, shared external/header queries, multi-paginator synchronization, native toolkit fidelity, static imports/tree shaking and no duplicated processing.

The implemented business examples are known-page async orders, a distinct infinite-scroll list without a visible paginator, full-draft invoice lines and retained attachments. Shared DOM coverage exercises their representative workflows. They require actual keyboard, focus recovery, nested-action isolation, bounded/grid/table geometry, narrow/touch/zoom, localization/dark mode, status announcements and owner cleanup evidence across supporting backends. Controls alone do not close those requirements.
