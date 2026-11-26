# Collection views

Use UiCollectionView when the same business records can be presented as a table, full-width cards or a responsive card grid. Declare fields and actions once, keeping business logic independent of concrete markup. UiList and UiTable remain lower-level primitives for bespoke compositions.

## Recommended business pattern

Prefer UiCollectionView for a conventional record browser whose fields and actions have the same business meaning in a table and in cards. Package repeated domain definitions as an application component such as OrderCollection; let its owner manage the query, selection, operations and editor lifetime. Its consumer supplies typed business data/operations or an existing typed list binding, not separate table and card schemas or backend classes.

| Decision | Business author supplies | Shared view/backend supplies |
|---|---|---|
| Record identity | Stable item keys and source/query behavior | Keyed rendering and shared selection |
| Information hierarchy | Fields, labels, value formatting and one title field | Table headings or labeled card details with a title |
| Important indicators | Status/access meaning, semantic color and card placement/order | Badge/icon rendering, wrapping and placement |
| Available actions | Short labels, icons, bindings, visibility and restrictions | Table action column or card action footer |
| Presentation | Table/full-width cards/grid; an optional responsive choice | Concrete markup, sizing, spacing and native selection controls |
| Editing | Inline controls or an owned editor session with persistence | Form mechanisms and, when chosen, the modal interaction boundary |

Choose table presentation for comparing values across records, full-width cards for a readable summary per record, and a grid for records that remain understandable in independent cards. These are recommendations, not automatic breakpoints or a requirement to expose a presentation selector. The application's automatic mode can use useUiResponsive. A single chosen presentation still benefits from centralized field/action definitions. Use UiTable or UiList directly when a genuinely different composition needs their lower-level contracts.

## Column and separate query controls

A field’s filter slot opens from its table-header icon; the business supplies the editor and explicit active state. For card views, use `control.hasColumnSort` / `control.hasColumnFilter` to show equivalent controls in a separate section. Special and cross-column filters remain there in every presentation. See [column filtering](column-filtering.md) for the implemented contract and example.

## Ownership and authoring

The business owner supplies one typed list binding and explicitly loads/disposes its control. Search, filters, paginator controls, optional statistics and editor sessions remain business compositions. A collection view borrows that state and does not fetch on mounting or on presentation changes. Declare reusable field/action compositions with Vue components, not a required object schema.

```vue
<UiCollectionView
  :binding="orders.bindings.list"
  aria-label="Orders"
  :presentation="presentation"
  action-presentation="text"
>
  <!-- @vue-generic {Order} -->
  <UiCollectionField field-key="reference" label="Order" role="title">
    <template #default="{ item }">{{ item.reference }}</template>
  </UiCollectionField>

  <!-- @vue-generic {Order} -->
  <UiCollectionField
    field-key="status"
    label="Status"
    card-placement="header-end"
    :card-placement-order="1"
  >
    <template #default="{ item }"><OrderStatus :value="item.status" /></template>
  </UiCollectionField>

  <template #actions="{ item, context }">
    <UiCollectionButton
      :binding="context.bindings.activateButton"
      :aria-label="`Edit ${item.reference}`"
    >
      Edit
      <template #icon><UiIcon name="edit" /></template>
    </UiCollectionButton>
    <UiCollectionButton
      :binding="context.bindings.removeButton"
      :aria-label="`Remove ${item.reference}`"
      color="danger"
    >
      Remove
      <template #icon><UiIcon name="delete" /></template>
    </UiCollectionButton>
  </template>
</UiCollectionView>
```

Use `presentation="table"`, `cards-full-width` or `cards-grid`. Use useUiResponsive for an application policy such as a table on desktop and full-width cards on mobile. No vertical-summary or simultaneous table/list mode is part of this abstraction. The table's sizing/alignment/sorting mechanisms remain UiTable's; at least one field must spring to fill remaining width. Actions use content sizing automatically. Pagination controls stay outside the view.

## Queries, sizing and loading

Keep search, filters, paginator navigation and optional statistics outside the record presentation. They borrow the same owned list session, so switching table/cards neither fetches again nor clears selected keys. Choose pagination from the data/workflow: a large searchable record browser may paginate, while an invoice's local editable lines may need neither search nor pagination. Do not add both mechanically to every collection.

UiPaginator supplies navigation. Add UiPaginatorSizeSelect and UiPaginatorJumper separately only when useful; statistics can be ordinary text derived from readonly pagination data. Loaded-item counts are not a required footer. See [list sessions](lists.md) and [UiPaginator](../api/components/UiPaginator.md).

Express table width intent through field preferred/minimum widths, spring behavior, resizing and alignment. Keep at least one spring field for remaining width; let the generated actions column account for its buttons. Use explicit left/center/right alignment where the values benefit from it. Prefer a readable card presentation on narrow screens when columns cannot reasonably fit, or explicitly allow horizontal scrolling when the task needs a table. The vertical scrolling decision is independent: content height yields to its parent, while `height="full"` needs a bounded allocation and scrolls internally with supported sticky headers.

Binding initial/replacement reads already mask the data view, retain accepted rows and block their interaction. An external `loading` condition can add to that state; do not duplicate the mask with business CSS. Append shows a continuation indicator while existing rows remain usable. Failed reads retain previous results and expose retry. See [loading](loading.md) for ownership and verification.

## Infinite loading in tables and cards

`infinite?: boolean` enables automatic continuation in every UiCollectionView presentation. It defaults to false. It is independent of `presentation`: a table can load infinitely, and cards can use numbered pages. Use the existing list control with cursor accumulation; no additional collection owner or continuation enum is needed.

```ts
const orders = createUiListControl<Order, OrderFilters, OrderSort>({
  itemKey: item => item.id,
  query: { filters: initialFilters, sort: [] },
  source: orderSource,
  pagination: { kind: 'cursor', mode: 'accumulate', pageSize: 20 },
})
void orders.refresh()
onScopeDispose(() => orders.dispose())
```

```vue
<!-- Inside a parent with a definite height; fields/actions are unchanged. -->
<UiCollectionView
  :binding="orders.bindings.list"
  :presentation="presentation"
  aria-label="Orders"
  height="full"
  infinite
>
  <!-- Reuse the same field and action declarations. -->
</UiCollectionView>
```

The owner supplies a bounded height and a source that returns opaque continuation metadata, including an explicit terminal marker. The view observes its own scrollport and automatically loads near the end and supplies Retry and completion feedback. It does not infer totals or completion from a short chunk. Keep numbered-page controls out of this composition. With `infinite` false, an accumulation binding can still be driven manually; the boolean requests automatic observation, not a new source pagination kind.

Table/card presentation changes retain accumulated records, query and selected keys. They replace the presentation tree, so arbitrary local editor state still needs ownership outside that tree. Changing the list session's pagination configuration requires a deliberate new session; resolve unfinished/pending work before offering such a switch. A keyed remount starts a fresh list session. Explain the query and selection reset to users if they can switch modes, and keep saved records with the service owner.

If a write can move records across cursor positions, the service must invalidate obsolete continuations. The owner can refresh the current query after unknown reconciliation. Keep accepted chunks and continuation cursors within the same source revision. Infinite views show no Load more button. Scrolling triggers continuation; pending requests show progress, including when scrolling by keyboard. Failed continuations retain accepted data and wait for explicit Retry. See [cursor accumulation](lists.md#accumulate-continuation-results) for lifecycle and automatic-loading limits.

In tables, continuation loading, append failure/Retry and completion feedback
follow the accepted data rows within the scrolling body, before any creation row
or summary. They do not occupy a separate footer after the summary or stay pinned
with it. In bounded tables the summary retains its own bottom position. The
backend keeps one accessibility announcement outside the masked data area.

Verify scroll-triggered loading, keyboard scrolling, retry without duplicate requests, terminal partial chunks and unchanged reading position in both table and card views. Check filtering/sorting starts a fresh generation, late responses cannot mix it, presentation switching retains selection, deactivation pauses automatic loading, and disposal releases observation. Test writes under active filters and confirm the restarted query reflects canonical source records.

## Card meaning and placement

A single `role="title"` field becomes the card heading without its redundant field label. Other fields default to labeled details. Selection is a dedicated native checkbox **inside** the card header; selection additionally outlines the card using backend theme values. Content/actions are not checkbox labels and do not implicitly select the record. Protected items remain visible with unavailable selection/actions according to the binding.

`card-placement` supports body, header-end, leading, media and overlay-end. Header indicators reserve space, while media overlays occupy the upper trailing corner. If there is no media, overlay values join a separate reserved group at the header's trailing edge, avoiding selection/title overlap. Multiple values form ordered groups, not overlapping individual absolute elements. Leading visuals, title, header indicators and overlays retain distinct regions. These are semantic placement hints; themes own sizes, spacing and wrapping.

`card-placement-order` sorts finite explicit values ascending within a placement. Unspecified values follow them; ties and unspecified values follow declaration order. Table order is independent. Empty direct slot output is omitted in cards; opaque child components are not opened to discover emptiness. Use `#card` to render a field differently, for example a named lock icon in cards while retaining a protection badge in its table cell. Applications can register a lock icon in their catalogue; core does not invent a required new icon name.

Keep lifecycle status and restrictions as distinct fields. For example, Open/Complete can be status badges, while Protected is a separate warning badge or named lock indicator. A completed order is not necessarily protected, and protection should not replace its status. Choose semantic roles such as info, success and warning; the backend owns the actual colors. Supply explicit placement order when both indicators share `header-end`.

## Actions and editing

UiCollectionButton reuses UiButton bindings, disabled/loading state, focus and activation. Its default slot is the label and icon slot is artwork. Collection-wide `action-presentation` chooses text, icon+text or icon; a button can explicitly override it. Missing icon output falls back to text. Keep a meaningful accessible label in icon mode. Visibility is a business `v-if` decision and is independent of disabled state. The view owns the action column and card action region, including spacing and content width. `card-action-placement="top-end"` moves card actions from the default footer into the frame’s logical upper trailing corner; table actions stay in their column. Use concise icon actions there and verify content/focus clearance at narrow widths. A card with no selection or header fields omits the header entirely; media-only cards need no artificial title. See [headerless cards and corner actions](cards.md#headerless-cards-and-corner-actions). Automatic action overflow menus and priority ordering are not implemented.

Use short visible verbs such as Edit and Remove. Record-specific accessible names, such as “Edit ORD-101”, can disambiguate repeated controls without making every visible button verbose. Keep icon-only actions meaningfully named. Use `v-if` when an action does not apply; keep it visible but disabled for temporary unavailability or restrictions the user needs to see. Let the binding supply pending/disabled behavior, and use local disabled only to tighten it. A decorative lock or protection badge does not itself enforce action availability.

For a focused New or Edit task, use the [form-integrated modal pattern](form-modals.md). Own the editor session outside the replaceable table or card presentation. Finish the list action once it opens the dialog so the item remains available for later updates. Reconcile accepted saves through the list owner, preserve the draft on failure, and confirm dismissal of a dirty draft. Keep editing on an explicit action when the card also contains selection, links or other controls.

Own local editor drafts outside presentation slots if they must survive a table/card switch. Reordering fields or switching card layouts retains keyed content, while changing placement can remount it.

## Observable acceptance

Check the same records, queries and selected keys in every presentation with no additional source reads. Check the checkbox is inside the card and selection changes its appearance without dimensions changing. Check pointer/keyboard toggling, disabled protected items, independent nested actions, content-sized table actions, all button modes and icon-only naming. Check multiple indicators, placement ordering/ties, empty fields, overrides, conditional declaration order, SSR and cleanup. At narrow widths and in RTL, indicators must wrap without covering title/selection; grid cards must fit the allocation. Check body/media/footer reachability under the independent scroll policies.

Also verify source errors/retry, replacement loading versus append, record-specific action availability, and a create/edit/cancel/save cycle in every offered presentation. Confirm a failed save retains the editor draft and a successful canonical save updates the correct record without an unnecessary second read when reconciliation is known. A change that can alter remote query membership or totals needs the source's reconciliation result or a refresh; the view cannot infer it.

supporting backends use their own markup and native controls. DOM/SSR tests establish wiring and structural behavior; geometry and assistive technology require real-browser checks. Browser scenarios alone do not establish visual acceptance; exercise them on the selected backend and report the verified behavior.

Successful empty results use [UiEmpty](../api/components/UiEmpty.md). Supply `#empty` for a business-specific message or useful action; see [empty-state guidance](empty-states.md).

Read failures use the shared [notice and recovery pattern](lists.md#read-failures-and-recovery), including placement outside row scrolling for failed replacement reads. The default needs no additional business markup; `#error` remains available for business-specific recovery.


## Collection footer

Use [UiCollectionFooter](../api/components/UiCollectionFooter.md) to arrange pagination and information without application-owned CSS. Its optional `info`, `size`, `paginator` and `jumper` slots identify purpose; the backend chooses their grouping and order. The footer works alongside any collection presentation, including cards, and does not require UiCollectionView as an ancestor.

```vue
<UiCollectionFooter>
  <template #info>{{ resultSummary }}</template>
  <template #size><UiPaginatorSizeSelect :binding="pagination" /></template>
  <template #paginator>
    <UiPaginator :binding="pagination" aria-label="Order pages" />
  </template>
  <template #jumper><UiPaginatorJumper :binding="pagination" /></template>
</UiCollectionFooter>
```

Supply the existing controller's paginator binding to the controls. The footer never loads, owns or disposes that session and does not generate statistics. `resultSummary` is localized business text derived from accepted metadata; it must not describe an unfulfilled requested page. Omit unknown totals or positions. A passive selected count can also occupy `info`, but selection retained across queries is not necessarily a subset of the current filtered total. Do not duplicate collection announcements.

Surrounding layout owns header/body/footer allocation. For a bounded collection put the footer in the supporting end region and keep the collection's own viewport in main; for a growing collection the footer follows in document flow. The footer introduces neither scrolling nor an extra frame/border. Slot output that is directly empty releases its space; condition an opaque component at the slot boundary if its internal emptiness must release allocation.

Verify actual control order per backend, narrow/RTL wrapping, unchanged drafts/focus when optional information changes and no source reads on footer mounting or layout changes. Collection header composition is a separate concern.

The collection footer allocates rows using its container width, present slots and content asks, not a fixed device breakpoint. When the complete sequence cannot fit, the footer prefers a shared jumper → pagination group at logical end, with information and page size above it. If native controls cannot fit together, supporting items pack above isolated navigation. Native page-window/sizing adaptations retain first/previous/current/next/last, all supplied slots and stable input instances. The wide sequence and ordinary row alignment follow backend conventions; the compact navigation pair remains together at logical end and mirrors in RTL. No mobile-specific business template is needed. Custom controls can participate through the backend compact-context protocol; the footer does not rewrite opaque custom content.

Use [UiCollectionHeader](../api/components/UiCollectionHeader.md) for optional search, actions, external filters/sorting and optional business information. It is independent of the collection body and owns responsive disclosure without owning queries or drafts. See the [header guide](collection-header.md).

## Card-grid width preferences

Ordinary `presentation="cards-grid"` needs no sizing configuration: the backend supplies a preferred minimum and a finite maximum. This keeps a lone card from becoming excessively wide. The parent supplies available width; collection presentation owns columns and gaps; each UiCard owns its frame/insets. The list control continues to own records, selection and operations, not layout sizes. See [UiCollectionPresentationOptions](../api/types/UiCollectionPresentationOptions.md).

```vue
<!-- Bounded defaults, including for a single item. -->
<UiCollectionView :binding="records" aria-label="Records" presentation="cards-grid">
  <RecordFields />
</UiCollectionView>

<!-- An explicit bounded range. -->
<UiCollectionView
  :binding="records"
  aria-label="Records"
  presentation="cards-grid"
  :presentation-options="{ minWidth: '16rem', maxWidth: '24rem' }"
>
  <RecordFields />
</UiCollectionView>

<!-- Deliberate unrestricted growth, including a lone full-width item. -->
<UiCollectionView
  :binding="records"
  aria-label="Records"
  presentation="cards-grid"
  :presentation-options="{ minWidth: '16rem' }"
>
  <RecordFields />
</UiCollectionView>
```

`records` is the existing list binding; RecordFields is a synchronous reusable business field declaration. A business component can encapsulate these preferences and ordinary consumers need not reconstruct them. This is a component property, without a required strategy wrapper or CSS. Width strings are positive rem/em/px layout preferences, not theme gaps, insets or native styles.

Omitted options and `{}` restore bounded defaults. A maximum-only object uses the default minimum; `{ minWidth: '16rem', maxWidth: 'default' }` changes only the preferred minimum while explicitly retaining the default cap. A minimum-only object means **no maximum**; it is not merged with the default cap. Avoid treating all omitted properties as default patches. Invalid lengths/unknown keys fail visibly; the resolved maximum must not be smaller than the effective minimum.

Bounded grids keep equal columns across rows, with the same ordinary gap and logical-start alignment. Surplus stays at logical end. Column count comes from the available container and preferred minimum rather than record count, so removing an item does not inflate surviving cards. The single-column narrow fallback can be smaller than the preferred minimum; a single-column allocation stretches by default as described below. Minimum-only growth deliberately collapses unoccupied columns. Full-width cards and tables retain their own allocation contracts.

Backend defaults are documented by the selected package. Reactive options, parent/container resizing and font-relative unit changes rearrange existing cards without resetting drafts or initiating source reads. SSR renders bounded CSS columns before client measurement refines the count; column positions can adjust after mounting. Native table SSR and hydration remain subject to the selected backend’s documented support.

Verify one, two and many records, partial rows, ordinary gaps and unused end space; test widths immediately around column transitions and below the preferred minimum. Toggle defaults, explicit bounds and minimum-only mode while retaining a focused editor and selection. Check container-only resize, rem/em changes, RTL, long/localized content, scroll/continuation and disposal. Automated geometry does not replace human visual or assistive-technology acceptance.

`presentation-options.stretchSingleColumn` defaults to `true`: when the offered width fits only one column at the effective preferred minimum/gap, cards fill that width even when it exceeds `maxWidth`. This is about container capacity, not the number of records. A lone item in a wider, multi-column grid stays capped, and a partial final row keeps its columns.

To keep the maximum strict in a single-column arrangement:

```vue
<UiCollectionView
  :binding="records"
  aria-label="Records"
  presentation="cards-grid"
  :presentation-options="{ stretchSingleColumn: false }"
/>
```

The flag alone retains default width bounds; it can also accompany explicit bounds. Minimum-only stretching is unaffected. The server/premeasurement fallback remains bounded until client measurement determines column capacity.

## Summaries and action surfaces

[Collection summaries](collection-summaries.md) supplies lazy record iterators and optional typed business data through field summary slots, with separate table/card presentation. [uiCollectionActionVariant](../strategies/uiCollectionActionVariant.md) selects bordered/soft/text action surfaces independently of actionPresentation. Business compositions use UiCollectionButton.defaultVariant for overridable defaults and reserve variant for explicit choices.


## Infinite continuation content

`UiCollectionView`, `UiTable` and `UiList` accept the same optional `#infinity-loading` and `#infinity-complete` content slots. They receive `{ message, loadedCount }` ([UiCollectionInfinitySlotProps](../api/types/UiCollectionInfinitySlotProps.md)). `message` is the resolved plain-text wording. `loadedCount` counts accepted records currently accumulated by the binding, including records outside the visible viewport; it is not an overall source total. Reading it does not iterate a lazy source or request more data.

```vue
<UiCollectionView
  :binding="orders.bindings.list"
  aria-label="Orders"
  height="full"
  infinite
  :messages="{
    listAppending: t('orders.loadingMore'),
    listComplete: t('orders.complete'),
  }"
>
  <UiCollectionField field-key="reference" label="Reference" role="title">
    <template #default="{ item }">{{ item.reference }}</template>
  </UiCollectionField>

  <template #infinity-loading="{ message, loadedCount }">
    <strong>{{ message }}</strong> ({{ loadedCount }})
  </template>
  <template #infinity-complete="{ message, loadedCount }">
    {{ message }} ({{ loadedCount }})
  </template>
</UiCollectionView>
```

The business component owns `orders` and its load/dispose lifecycle; `t` is the application's reactive translator. A containing layout must supply a bounded height. Import the components from `@uninterface/uninterface`. For direct table/list use, put the same named templates on `UiTable`/`UiList` alongside their ordinary column/item slots. The collection forwards them through table and both card presentations, so switching presentation requires no alternate status template.

`#infinity-loading` is rendered only while an infinite append runs. It does not replace initial loading or refresh masks. `#infinity-complete` is rendered only for a successful, nonempty, idle, non-stale infinite result whose binding reports no more records. An empty terminal result uses `#empty`; errors use `#error`. Reaching a viewport boundary or an automatic continuation budget is not source completion. `showSummary` does not suppress this completion feedback. In manual/non-infinite presentation neither infinity slot is used.

Default infinite loading/completion feedback is centered, uses a subdued theme text tone, and uses text no larger than ordinary record text. Backends own the exact typography and colors. Custom content inherits the supporting status treatment.

Supply inline/phrasing content such as text, emphasis or icons. The slots replace the message, preserving the backend loading indicator, spacing and semantic container. Omitted slots, or slot output Vue considers empty, retain the resolved default text. Slot rendering must be side-effect-free: do not call loadMore, retry, change queries or calculate a source total there. The backend renders a table continuation body row after data and before creation/summary rows; list/cards use their continuation area. The observation sentinel remains independent of supplied content, and summaries retain their own placement.

### Wording and announcements

Optional `messages: UiCollectionMessages` accepts `listAppending` and `listComplete` string overrides. Omitted keys use application localization. Bind translated strings reactively; changing locale does not translate literal overrides. These values supply default visible wording, slot `message`, and accessible announcement text. They belong to one view; sharing a binding does not share the overrides. The currently elected visible host supplies the single announcement for that binding/application. Only active table or card coordination participates when a collection changes presentation.

Use these overrides when changing the meaning of feedback. Uninterface does not extract speech from arbitrary slot VNodes: slots enrich visible content, while the resolved plain-text message remains the accessible announcement. Custom slot content should not add a second live region. Initial/refresh/error messages retain application localization; the loading indicator and native integration remain backend-owned. See [UiCollectionMessages](../api/types/UiCollectionMessages.md) and [localization](localization-and-icons.md).

The existing `#error` context includes `placement: 'initial' | 'replacement' | 'append'` alongside `error`, `retry` and `canRetry`. Branch on placement to distinguish append recovery; use the supplied guarded retry operation and availability. Adapt private exceptions to safe business wording. See [read failures](lists.md#read-failures-and-recovery) and [UiCollectionErrorSlotProps](../api/types/UiCollectionErrorSlotProps.md).

### Observable checks

Verify initial load, refresh and empty results never invoke these slots; append supplies the previous accepted count and completion supplies the accumulated count. Append failure exposes `placement: 'append'` with usable Retry. Verify default/empty slot fallback, reactive message changes and locale fallback without new requests; the native spinner, sentinel, one announcement and continuation-before-summary placement must remain. Exercise table, both card presentations and direct table/list use. Switching a view or rendering a slot must not fetch, discard records, selection or editor drafts, or dispose the owning session.
