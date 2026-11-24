# Collection summaries

Use field/column summary slots to summarize a business collection. Uninterface supplies access to records and optional business data; your reusable business component owns the operation, formatting, source consistency and editing session. Ordinary consumers of that component still supply typed initial data and business operations.

```vue
<!-- @vue-generic {Order, Filters, Sort} -->
<UiCollectionView :binding="orders.bindings.list" summary-label="Total for loaded orders">
  <!-- @vue-generic {Order, Filters, Sort} -->
  <UiCollectionField field-key="amount" label="Amount" align="right">
    <template #default="{ item }">{{ money(item.amount) }}</template>
    <template #summary="{ records, status }">
      <UiLoadingIndicator v-if="status !== 'ready'">
        {{ money(sumAmounts(records())) }}
      </UiLoadingIndicator>
      <template v-else>{{ money(sumAmounts(records())) }}</template>
    </template>
  </UiCollectionField>
</UiCollectionView>
```

`sumAmounts` and `money` are application functions. Import `UiLoadingIndicator` from `@uninterface/uninterface` alongside the collection components. This example keeps the accepted total visible with a leading backend-owned indicator whenever status is not ready; ready values have no indicator. This is the composition's presentation policy, not automatic summary calculation or a change to status semantics: stale/unavailable can persist after a failed request, and the collection's error/retry presentation still explains that failure. Core supplies no automatic sum, count, currency rule or aggregation schema. Localize labels and state descriptions. Summary slots are optional; their presence activates the summary, independently of showSummary (the existing loaded-count text). Removing all summary declarations removes its presentation and computation.

## Record access and scope

Each slot receives [UiCollectionSummaryContext](../api/types/UiCollectionSummaryContext.md): records(), scope, coverage, status, label and provided. records() creates a fresh iterable iterator. Creation does not traverse records; requesting entries does. Default membership is the immutable accepted list window captured for that context; item objects retain their existing shallow ownership. Selected summaries also capture the selected-key set. Never share a consumed iterator across renders. Business computations used in rendering must be pure and synchronous; compute/cache several aggregates in the owner when repeated field traversal would be expensive.

summaryScope defaults to loaded: every currently accepted record, including accumulated chunks. Page uses the accepted replacement window and is rejected for accumulation. Selected iterates loaded selected records and reports partial coverage if retained selected keys are absent. None fetches other pages or treats a partial result as all matching records. Loaded/page coverage describes that declared window, not the remote collection.

Matching, all and custom scopes require an owner-provided summarySource. [UiCollectionSummarySource](../api/types/UiCollectionSummarySource.md) supplies explicit scope/coverage/status, optional label and an optional fresh-iterator factory. If summaryScope is also specified it must match. The owner must keep a supplied factory repeatable and snapshot-consistent; the view does not clone domain objects or validate remote claims. Traversal invokes the factory lazily. Closing iteration forwards iterator cleanup.

## Service assistance and editable drafts

Pass any typed business payload through summaryData; slots receive it unchanged as provided. A summarySource can describe a service-provided total without exposing records (coverage none). Calling records() on such a source rejects instead of suggesting that an empty dataset means zero. Query generation, failed requests, freshness and response acceptance remain owner responsibilities; presentation changes do not start a source request.

```vue
<!-- @vue-generic {Order, Filters, Sort, OrderStatistics} -->
<UiCollectionView :binding="orders.bindings.list" :summary-source="statisticsScope" :summary-data="statistics">
  <!-- @vue-generic {Order, Filters, Sort, OrderStatistics} -->
  <UiCollectionField field-key="amount" label="Amount">
    <template #default="{ item }">{{ money(item.amount) }}</template>
    <template #summary="{ provided, status }">
      {{ provided && status === 'ready' ? money(provided.total) : '—' }}
    </template>
  </UiCollectionField>
</UiCollectionView>
```

Typed field declarations require their own generic annotation; the parent generic does not flow implicitly into children. For an invoice, derive summaries from the full business editing session or its owner-provided source. Last-valid projections during raw editing are not validated submitted values. Supply their stale/unavailable status through the summary source; ordinary blur confirmation does not require a visible provisional hint. The business owner chooses any additional disclosure needed for its workflow. A supplied source is the authority for summary status. Without one, the view reports unavailable before a result, loading before first completion, stale for retained loading/error/stale results and ready after a successful read.

## Table and card presentation

Tables render one native footer summary row aligned to declared columns, including horizontal scrolling and column resizing. The label spans the leading business columns before the first column with a declared summary slot. That value column and later values retain their own aligned cells. Selection is separate from the label span. If the first business column itself declares a summary, its cell contains both the label and its value; neither is discarded. Placement uses declarations, so a temporarily empty summary slot keeps its allocation. Long labels wrap within their allocated span rather than forcing a single column wider. Selection/actions columns provide no record operations for the summary. Header relationships remain available. In full-height tables, the summary stays visible at the bottom of the bounded record viewport while rows scroll. Content-height tables follow document flow; they do not create a viewport-fixed summary. Existing custom count/action footers stay separate, outside the row scrollport and visible in full-height allocations.

Cards render one compact collection-wide summary surface outside the record grid. The summary label occupies a separate header above field-name/value pairs. Each pair keeps its name and value aligned; pairs share columns when space permits and stack on narrow widths. A header band and separator, subtle neutral tinted surface, solid boundary and flat elevation distinguish the supporting panel from ordinary record cards. It reuses the backend’s card presentation, with theme-owned colors and dimensions. Summary identity does not select a semantic color or a different card hierarchy level. No business styling or presentation choice is required. In full-height collections it remains below the record scrollport and visible while cards scroll; content-height collections place it after the records in normal flow. Participating summary fields use their labels as definition names; card title/media placement does not change this summary arrangement. Values wrap independently of card-grid column count. A summary is never a selectable card or ordinary record. Empty collections still render declared summaries; business code decides whether zero or unavailable is truthful.

## Observable checks

For infinite tables, loading/completion and append-retry feedback follow the last
data row before the summary. Scroll to the end and verify that continuation is
visible above the pinned summary, with one accessible announcement and retained
accepted rows. Infinite mode requires a bounded vertical scrollport; manual
content-height accumulation does not add automatic continuation feedback.

Verify fresh iterators, lazy traversal/cleanup, complete versus partial scope, provided data without iteration, query/data freshness and invalid-draft disclosure. Confirm summaries update after accepted changes, without extra reads or losing selection, drafts, focus or action identity. Check direct UiTable as well as table/full-width/grid collections, native column sizing, empty/error/loading states and independent count footers. Scroll full-height collections through the first, middle and final records and confirm the summary remains visible. Confirm the summary’s whole painted width, including blank selection/action cells, obscures rows scrolling beneath it; position and hit-testing alone do not establish opacity. Verify leading label spans, first-column summaries, multiple values, horizontal alignment, conditional declarations and empty records. Review table/card appearance separately at narrow/wide widths, light/dark and RTL. DOM checks do not establish browser geometry or assistive-technology acceptance.
