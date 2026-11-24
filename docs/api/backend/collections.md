# Collection views

[Backend reference](README.md) · [API reference](../README.md)

List/table/paginator bindings, measurement, summaries and footer navigation.

## Collection views

Static modules `UiList.vue`, `UiTable.vue`, and `UiPaginator.vue` implement `list.view.v1`, `table.view.v1`, and `paginator.view.v1`. UiTableColumn is a logical core declaration with no vendor column API in business slots. Core's hidden declaration host precedes a separate surface for synchronous SSR registration. The backend renders only accepted rows and must never add a second sort/filter/page pipeline.


Collection producers expose [UiListBinding](../types/UiListBinding.md) and [UiPaginatorBinding](../types/UiPaginatorBinding.md). `list.control.v1` declares a control capability, not view support; dedicated views declare their own capabilities. See the [view/value contract](../../contracts/list-view-decisions.md).

### UiCollectionRow

`{ key: UiListKey, item: unknown, context: UiListItemContext<unknown>, selectLabel: string, issue: string }` is the erased backend row. Forward the original item/context to core slots. Numeric and string keys remain distinct. Dedicated selection controls call context.requestSelected; arbitrary nested actions do not select or activate the row.


### UiCollectionViewProps

Shared collection props are `rows`, `label`, `height: 'content' | 'full'`, `scroll: 'none' | 'horizontal' | 'vertical' | 'both'`, `selection`, `disabled`, `busy`, `empty`, `failed`, `error`, localized `message`, and elected-host `announcement`. Use `retryLabel`, `canRetry` and `retry(): Promise<boolean>` for failures. `infinite`, `moreLabel`, `canLoadMore`, `hasMore` and `loadMore(): Promise<boolean>` describe continuation. `observe({ visible, near, renewed? })` reports actual geometry; only genuine user scroll intent, viewport resize or threshold reentry renews the automatic budget. Scroll intent includes wheel/touch gestures and scrolling keys on the named viewport, even at a boundary with no remaining scroll distance. Standard infinite presentation has no manual Load more action; the continuation methods remain available for custom compositions. Observation never initiates initial loading. Repeated notifications, rendering and append growth are not renewal events.

The error slot receives `{ error, placement, retry, canRetry }`, where placement is the current `failurePlacement` (initial/replacement/append). The empty slot receives no records. Retain accepted rows through refresh/failure. Never expose exception text as built-in public feedback. Place `announcement` in a contained polite live region, separate from visible content; core elects one visible host per application/binding. Paginators do not repeat it.


### UiListViewProps

Extends UiCollectionViewProps with optional exact positive `columns` or preferred positive CSS-length `columnWidth`, mutually exclusive. The default slot receives `{ row }`; core forwards typed item/context to the business slot. Backends own grid fitting, theme gaps and scroll/focus targets. A grid remains a semantic list, not an ARIA interactive grid.


### UiTableViewColumn

`{ key, label?, sortable, sort?: 'ascending' | 'descending', sortPriority?: number, primary, sortDescription, sortLabel, filter, requestSort(order?): Promise<boolean> }` supplies header intent and localized secondary precedence. `sortPriority` is the one-based position in the whole query, including clauses without a rendered column. `requestSort()` cycles ascending/descending/absent; an explicit `'ascending' | 'descending' | null` applies a native direction/removal intent to that clause, preserving other clauses and suppressing unchanged requests. Apply aria-sort only to the primary sorted th; associate sortDescription with the actual sort control (button or native interactive header). Stable keys and stable native render functions must preserve cell editors through column reorder and localization.


### UiTableViewProps

`showSortPriority` is true when the whole source query has more than one active sort clause, including clauses without rendered columns. When true, display each sorted column's one-based `sortPriority` beside its native direction indicator. When false, omit the number. Do not renumber by visible column order or infer this flag by counting visible sorted columns. The number is not another control; mark it aria-hidden because sortDescription supplies its accessible equivalent. Include the number and its gap in intrinsic header content measurement, prevent it shrinking/wrapping, and retain native caret interaction and header typography.

Extends UiCollectionViewProps with `columns: readonly UiTableViewColumn[]`, `selectPageLabel`, `pageSelected`, `pageMixed`, `canSelectPage` and `selectPage(boolean)`. Slots: `label({ column })`, `filter({ column, trigger })`, `cell({ row, column })`, plus error/empty. Sort buttons and filter editors are distinct targets. Declare `table.column-sort.v1` and/or `table.column-filter.v1` only when implemented; core gates the corresponding controls and controller observations. supporting backends declare both.

For column filtering, supply a stable backend-owned Vue component as `trigger` in the filter slot. The supporting adapters use private `TableFilterButton.vue`; it accepts `active: boolean` and `disabled: boolean`, forwards all attributes/listeners to one actual button, and supplies a decorative filter icon with native theme/focus treatment. Forward the overlay host's data attributes, accessible name, expanded/controls/haspopup state and capture listener unchanged. Core composes that trigger with UiPopover, owns the run lifetime and inserts the business slot; the existing backend popover owns native surface geometry, arrow policy, focus and dismissal. No backend-specific filter schema or row processing is introduced. Stop nested filter pointer/key events from sorting. Include the trigger in header content measurement; the popup must not affect column width. Active filtering is distinct from expanded popup state. Backend modules without column-filter support need not supply a trigger helper. A cell may be any business composition. Native column registration probes with no row must not invoke its business cell.

Core marks the column-filter surface with `data-ui-column-filter-popover`. Forward it to the actual popover surface and size that surface to its contents within viewport limits, preserving native padding. Do not force a short choice list to occupy a general editor's fixed width. The supporting adapters implement this in their popover styles.


### UiPaginatorViewProps

Navigation only: `label`, `pending`, localized `firstLabel/previousLabel/nextLabel/lastLabel/pageLabel`, guards `canFirst/canPrevious/canNext/canLast/canJump`, accepted `page?/pageCount?/total?/acceptedPageSize`, operations `first/previous/next/last/goTo` and localized `pageName(number)`. All navigation operations return Promise<boolean>. Render first, previous, pages, next and last; unavailable actions stay disabled. Native bounded page buttons require an accepted page within known positive bounds and supported jumps. A fallback must not invent cursor pages or a last destination. Native widgets must not auto-clamp an out-of-bounds retained page into an unsolicited request. No summary, size selector, jump input or addition slots belong to this view.


### UiPaginatorSizeSelectViewProps

`label`, numeric requested `value`, localized `options: readonly { value: number; label: string }[]`, `disabled`, `pending` and `select(number): Promise<boolean>`. Render a standalone native selector named by label, retaining numeric option values. Native selection emits route to select once. Core guards unsupported choices, pending activity and model echoes. No lifecycle requests or session disposal.

For composite pickers, expose the numeric size as a string in
`data-uninterface-key` on the rendered option or its label node. Native
`<select>` options expose the size through their value. This lets tests
choose a page size independently of the localized label.


### UiPaginatorJumperViewProps

`label`, raw string `value`, `disabled`, `pending`, localized `error`, `update(string)` and `commit('enter' | 'blur'): Promise<boolean>`. Use a text-preserving native input with numeric input mode; do not clamp, parse or navigate on each keystroke. Enter prevents enclosing-form submission except during IME composition; blur commits through the separate reason. The backend wires the label, invalid state and error description to the actual input. Core owns validation, accepted-metadata synchronization and duplicate-commit guards.

The separate static modules UiPaginatorSizeSelect.vue and UiPaginatorJumper.vue require `paginator.size-select.v1` and `paginator.jumper.v1`. All pagination controls have the same or similar ordinary control-surface height within a backend. Labels sit inline; default tooltip feedback stays out of layout, while explicit below feedback can extend the row. Prefer native sizes/densities, with backend-owned adaptations where necessary, rather than a shared fixed pixel height. Standalone components need no paginator/form/field ancestor. The application arranges them and renders readonly statistics as text.

Jumper views resolve `uiValidationFailure` at the existing `paginator-jumper` strategy node. Supporting backends support `show-tooltip` (default) and `show-below`; `show`/unsupported embedded placement use the default and `none` suppresses presentation only. Raw `error` continues to determine semantic invalidity. Associate only displayed feedback with the actual input; keep input identity/focus through policy changes. Tooltip feedback appears on invalid commit without hover, clears on editing, participates in shared overlay/stacking ownership and must not increase footer layout dimensions. Explicit below feedback may add height. Use approximately five digit cells for the input content width, with native padding/borders and normal control height; do not impose maxlength or truncate drafts. This is backend presentation, not a new business width prop.


### useUiCollectionView

Optional backend helper accepting UiCollectionViewProps. Returns refs `root` (actual bounded scrollport), `target` (named table/list focus fallback), `sentinel`, `failure` (the current visible read-recovery region), stable `id` and `rowRef(key, element)`. The adapter must provide actual semantic elements, including toolkit internal targets when needed. It observes geometry/visibility, pauses on deactivation, disconnects on unmount, reports intent, and restores retained editor focus after DOM moves. Recovery survives a pending action's temporary native disabled state until an update enables the control or removes its row. Focused removal tries surviving following then preceding item actions, then target; a focus move elsewhere or view deactivation cancels recovery. It uses only supplied row elements, not business component internals.

Native table/pagination integrations must retain shared sort, query and reconciliation ownership. In multiple mode, project only the changed sort clause and preserve other clauses, including keys absent from the current table. In single mode, selecting a direction replaces the previous clause. Backends call the supplied requestSort callback rather than owning this query logic. Business children must not accidentally enable native tree handling. Native filtering, slicing and expansion must not compete with the shared source. Include first/last navigation where supported, retain capability navigation for unknown bounds/non-jump and out-of-bounds pages, and keep size selectors/jumpers independently imported. All remain ordinary tables. Concrete components, bridges and styling belong in backend documentation; geometry, visual fidelity and assistive-technology acceptance are recorded separately.

Core declaration SSR support does not establish native table SSR/hydration support. Each backend must document its supported envelope and limitations; verify the rendered native table and hydration in that environment.


### useUiTableSizing

Optional backend mechanics: `useUiTableSizing(props: UiTableViewProps, root: Ref<HTMLElement | undefined>, id: string, options?: { minimumHeader?: boolean })`. The backend supplies the measured allocation/scroll host and stable view ID. Returns computed `fits`, `tableStyle`, `selectionWidth`; functions `width(key)`, `cellStyle(key)`, `columnId(key)` and `handle(key)`. Use actual native column geometry, apply physical header/cell alignment, and attach handle attributes/events to an independently focusable boundary. No shared DOM tree is prescribed.

`UiTableViewColumn` additionally carries preferredWidth/minWidth (optional positive px number or px/rem/em string), resolved spring/resizable booleans, optional left/center/right align and localized resizeLabel. `UiTableViewProps.sizeConstraintLabel` names the recoverable insufficient-space condition. `table.column-sizing.v1` and `table.column-alignment.v1` are required capabilities for UiTable.

The helper measures host content width and relative units, observes container/ancestor changes, allocates spring space, retains view-local user widths and supplies pointer capture/cancellation and keyboard handlers. Backends render the table with v-show while fits is true and a localized status otherwise; retaining mounted editors is required. It moves focus out before hiding an active table. Explicit horizontal/both permits overflow; other modes must contain it. Disable native competing resize logic. All adapters reserve 3em for selection. See [sizing semantics, obligations and acceptance](../../guides/table-columns.md).

Map resolved widths and alignment to the actual native columns without competing allocation mechanisms. Native positional cell identity may limit editor retention during reorder; document that limitation separately from resizing/alignment. DOM checks cover mechanics; browser geometry and assistive-technology acceptance remain separate.


### Collection summaries, table footer and measured content

Infinite-table continuation status belongs at the end of the accepted data body,
before any creation row and summary, rather than after the summary/footer. Keep
append loading, failure/Retry, explicit completion and the observation sentinel
at that continuation point. Preserve native table semantics and column tracks;
do not insert fake business records into toolkit data. Continuation scrolls with
records while bounded summaries retain their bottom position. Keep exactly one
elected announcement outside table busy/masked content; relocating visible
feedback must not duplicate or silence it. Verify pending/error/retry/completion,
retained drafts/focus, no-summary mode and switching to manual content-height
accumulation without automatic continuation.

UiCollectionViewProps additionally supplies summary (true only for an ordinary successful loaded-count message) and showSummary (explicit visible opt-in). Suppress only summary messages when showSummary is false. Do not suppress loading, uninitialized, stale, empty, failure/retry or explicit infinite completion states. Preserve the elected, contained role=status announcement regardless of visible summary. UiList/UiTable default to no visible loaded summary; an explicit showSummary enables it, while a custom table footer replaces it.

UiTable views receive an optional footer slot, outside the semantic table. Render it below the table, anchored to the collection viewport during horizontal scrolling. Core supplies the public slot's count from accepted rows. The named collection scrollport must own the active axes. It may be a native toolkit viewport; attach accessible naming, keyboard focus and continuation observation to that actual element. Avoid competing nested scrollports. table.footer.v1 declares support.

UiTableViewColumn preferredWidth/minWidth accept content. useUiTableSizing additionally returns contentStyle(key) and stable contentRef(key, rowKey?) callbacks (omitted rowKey identifies a header). Apply them to backend-owned, stable header/cell content wrappers. The helper measures intrinsic wrapper width plus native ancestor insets through the actual th/td, observes changes and coalesces layout reads. Selection columns remain separate. With minimumHeader enabled, header wrappers are also measured at intrinsic width even for fixed/numeric author minima; native header controls and insets establish a usable minimum beneath which columns cannot shrink. Author minima remain lower bounds, and explicit oversized asks can still require scrolling or the insufficient-space surface. Existing wrappers are measured and restored before paint without cloning content. Font/content changes refresh the measurement. Initial content fallback is 3em; unmeasurable content retains its last measurement. Do not remount editors when toggling policies. Declare `table.column-content.v1` for this contract. Actual button containment and footer anchoring require browser geometry checks; DOM stubs only verify allocation/wiring.


### Collection overflow and fixed headers

Core resolves full-height collection requests to vertical/both, even when the author omitted scroll or requested none/horizontal. Adapters set overflow-x and overflow-y independently. Content-height collections expand vertically; a horizontal request must not add a vertical scrollbar. Bounded collections fill the assigned height and scroll rows, with horizontal overflow suppressed unless allowed. UiTable automatically pins headers for full height using compatible native facilities first. Pass the actual bounded scrollport to useUiCollectionView while its allocation container supplies sizing. Use compatible native fixed/sticky header facilities. useUiCollectionView follows scroll-target changes and reconnects geometry/listeners, retaining its row focus mechanics. No backend-specific author prop is required.


### Collection views

`collection.view.v1` requires the statically imported UiCollectionView.vue backend view and its private CollectionCard.vue and CollectionTableActions.vue helpers. CollectionTableActions receives the row actions in its default slot and owns their compact, wrapping arrangement; preserve native button padding and hit areas instead of using general layout peer spacing. `UiCollectionCardsViewProps` extends UiCollectionViewProps with `grid: boolean` and optional `presentationOptions: UiCollectionPresentationOptions`. The options are validated by core and keep omission semantics; do not merge a default maximum into a minimum-only request. The view renders a named semantic list of rows, supplies the row slot, status and real scroll/focus/continuation targets through useUiCollectionView. Grid/full-width changes must retain keyed row instances. Table presentation continues through UiTable rather than a second table implementation.

`UiCollectionCardViewProps` contains row, selection, part (header/body/actions) and ordered fields. `UiCollectionCardFieldView` contains key, label and placement (title/body/header-end/leading/media/overlay-end). Core requests a header only for selection, title/leading/header-end fields or overlay-end fallback without media. Empty direct field output does not request a header; supporting backends must render a headerless frame without a blank band or separator. The core UiCard frame supplies treatment/strategy/slots; this helper owns concrete internal placement and a dedicated native checkbox inside its header. Its field slot renders supplied business content by key; its default slot supplies actions. Core routes that action composition into UiCard’s footer by default or its top-end slot when requested; views anchor corner actions to the frame, not the media. This does not change table action placement. Body fields have labels; title/indicator/media fields do not. Overlay values use the media corner where media exists, otherwise a reserved header indicator group. Core omits empty direct field output before handing over metadata. Never inspect business component internals.

UiCard receives data-collection-card (row key text) and data-collection-selected when selected. Backend styles apply a dimension-preserving theme-owned selected treatment without making the card itself a checkbox, button or ARIA-selected list item. Keep native focus visible and distinct from selection. UiCollectionButton composes UiButton and requires no additional backend view; label hiding, accessible naming, hints and icon styling remain native button responsibilities.


### UiCollectionFooter

`collection.footer.v1` requires the statically imported `UiCollectionFooter.vue` view. It receives no controller or view-state props; its optional unscoped `info`, `size`, `paginator` and `jumper` slots have already been normalized by core to remove whitespace/comment/empty-fragment output. Core renders no view when all are empty. Opaque child components remain opaque.

Arrange each supplied slot once. Preserve custom components, keys, input state and focus when sibling slots disappear; use stable keyed wrappers. `info` is opaque business content, not a signal to derive range, selection or live announcements. Register the actual root with useUiZView; forward attributes/listeners to it. Keep strategy context and native child behavior intact. Do not introduce a pagination engine, read on mounting, or change child capabilities. No view binding type is needed for this slot-only contract.

Collection footer ordering and logical alignment belong to the backend’s documented adaptation. Match DOM/Tab order to presentation without CSS order/reversal. Wrap groups and release absent slots without phantom gaps. No unconditional landmark, live region, decorative boundary, inset, sticky behavior or scrolling is supplied. Native rationale and verification limits belong in backend collection documentation.


### useUiCollectionFooterLayout

`useUiCollectionFooterLayout(host, order, present)` provides footer allocation and width context. `order` contains the backend's preferred single-row sequence of `info | size | paginator | jumper`; `present()` returns the slots supplied in the current render. Return values supply ordered `parts()`, `split`, `rows`, `row(part)`, `start(part)`, `end(part)`, `sharedStart(part)` and `basis(part)` for independently implemented backend markup. No controller or query state is consumed.

Supporting wrappers expose `data-footer-part`; the helper measures their preferred intrinsic width on the existing elements, briefly removing wrapper allocation constraints and restoring them synchronously before paint. It never clones live controls or executes opaque component internals. ResizeObserver, relevant child mutations, Vue updates and font loading trigger a coalesced measurement. Hidden zero-width offers retain the last useful offer. Observers follow host/slot replacement and are disposed with the view. SSR uses the backend's ordinary sequence without DOM measurement.

Allocation uses present slots only, their intrinsic asks, the navigation budgets and the computed backend gap. When the preferred complete row fits, retain backend order. Otherwise prefer a shared jumper → pagination row if the compact minimum fits; pack remaining information/size slots above it in backend order. If sharing cannot fit, pack supporting slots above isolated navigation. A single item always uses one row. A backend gap of spare room is required to merge a split footer or enter a shared allocation; retaining an already fitting pair does not require that extra margin. Oversized individual content is constrained to the available width; custom editors retain responsibility for usable wrapping inside their own boundaries.

`sharedStart(part)` identifies the jumper starting a shared navigation row. Backend views keep that pair at logical end, using their normal inter-control gap and content-sized navigation wrapper. A stretching paginator wrapper would insert unused allocation between the controls. `basis(part)` supplies no forced width for that wrapper; isolated navigation still receives a full-row wrapper. Do not apply the shared marker to the ordinary wide sequence. DOM/Tab order is jumper then pagination, mirrored through logical positioning in RTL.

Backend views render stable keyed slot wrappers under the same root and explicit zero-height flex line breaks. They own per-row start/end/center alignment and flexible information space. Actual DOM order follows allocated reading order; no CSS reordering of focusable children. The helper preserves focus and text selection if a retained editor moves, suppressing only relocation blur/focusout during that patch so resizing cannot commit its draft. An explicitly removed editor is not restored or protected from ordinary blur.


### useUiCollectionFooterNavigation

`useUiCollectionFooterNavigation(preferredEm: () => number, minimumEm?: () => number)` registers one cooperating paginator's backend-owned width budgets and returns its available width as a computed value, or undefined outside a footer. The preferred budget requests its ordinary page window. The optional compact minimum permits sharing a row with the jumper. Both are positive presentation estimates in em, based on native metrics and current navigation content, not business width requirements. They must stay independent of the allocated window; otherwise fewer rendered pages could merge rows and expand them again. Without a compact minimum, navigation uses its measured intrinsic ask for sharing. This contract expects one cooperating paginator per footer.

Navigation receives the remaining row width after its peers and gaps, capped at its preferred request when there is sufficient room. Backends adapt the native page window using that offer. First/previous/next/last and the current page remain; backend sizing and supported windows differ. The footer waits for the changed allocation/window to render before checking actual width. If the settled customized/native navigation exceeds a shared offer, a retained overflow bound prevents retrying the same inadequate pair. Changing the registered budgets clears that learned bound. The footer does not clone or rewrite opaque navigation.


### useUiCollectionFooterCompact

`useUiCollectionFooterCompact()` returns whether the footer navigation's allocated width is less than its preferred ask, or undefined outside a footer. It does not indicate whether the footer has multiple rows. Paginators and supporting editors may use this signal for native compact facilities. No fixed mobile breakpoint is prescribed. Standalone controls retain their previous responsive defaults.

The layout retains supporting slots' last measured ordinary width requests while compact presentation is active, using them as lower bounds when computing the navigation offer. Actual wrapper allocation still uses current measured widths. This separates the ordinary request from the smaller result of applying that offer, preventing native compact/ordinary sizing from repeatedly selecting each other. Returning to ordinary presentation updates those requests. Verify convergence after page-size/page-count changes as well as container resizing, especially when native label and input widths change with size.



## Card-grid width allocation mechanics

`useUiCollectionCardGrid(props, target)` is optional shared backend mechanics exported from `@uninterface/uninterface/backend`. The adapter supplies its actual semantic list target (`Ref<HTMLElement | undefined>`) and receives reactive CSS style bindings for that target. It accepts `grid` and `presentationOptions` from UiCollectionCardsViewProps; it adds no DOM, data owner, source read or toolkit dependency. Backends retain list/card markup, accessibility, gaps and default widths.

Adapters using this helper define positive rem/em/px defaults on their list through `--ui-collection-card-default-min` and `--ui-collection-card-default-max`. Their ordinary `--ui-collection-card-min`/`--ui-collection-card-max` reference these defaults; explicit options override the latter pair through the returned style. Supply a finite default maximum at least as large as the minimum. With grid inactive the helper adds no column geometry. Keep ordinary grid gaps; do not distribute surplus with space-between.

For bounded grids the helper measures the list’s content-box width, computed gap and font-relative lengths; columns = max(1, floor((width + gap) / (minimum + gap))). Repeated equal tracks shrink to share the offered width and grow only to the maximum, leaving surplus at logical end, subject to the single-column exception below. Empty columns retain allocation independently of item count; rows remain content-sized. Minimum-only options instead use auto-fit and fractional tracks to preserve unbounded occupied-column growth. Options `{}`, omission, maximum-only and explicit `maxWidth: 'default'` use their documented default relationships. Resolved mixed-unit/default ranges with maximum below minimum throw.

Mounted measurements use ResizeObserver on the actual list, updates/options, ancestor style/class/language/visibility mutations, window resizing and font-load events. KeepAlive deactivation and scope disposal disconnect observers/listeners; reactivation measures again. Gaps, rem/em defaults and available widths are backend presentation concerns; preserve native keyed content/focus. Without a measurement (including SSR), bounded CSS auto-repeat keeps bounds and content but may choose fewer columns than the mounted minimum-based allocation. No browser-dependent render tree is introduced, and no claim of identical initial geometry or native table hydration follows.

Custom backend mechanics may fulfill the same observable contract without this helper. Verify default and explicit ranges, minimum-only stretching, ordinary visible gaps, unused logical-end space, sparse/partial rows, container-only resize, changed font sizes, selection/editor retention, full-height collection scrolling/continuation, SSR content and disposal.

Single-column exception: `presentationOptions.stretchSingleColumn !== false` (default enabled) makes a measured capacity of one use a full-width fractional track, bypassing the maximum. Determine capacity from available width/minimum/gap, never from record count or the last row's occupancy. A flag-only object retains ordinary default bounds. Explicit false enforces the cap for one column; minimum-only requests keep their original unrestricted stretch regardless of the flag. Validate boolean inputs in core and preserve reactive updates/identity. Server/premeasurement CSS remains bounded until measurement resolves capacity. Verify both directions immediately around the one-to-two-column threshold, with one and many records, and live flag changes without source reads or focus loss.

## Business data summaries

UiCollectionViewProps.dataSummary is optional { label: string; status: UiCollectionSummaryStatus; columns: readonly { key: string; label: string }[]; labelColumnSpan?: number }. It appears only with summary declarations. The summary-cell slot receives { column }; core supplies business-rendered content. Never calculate aggregates or infer source totals in adapters.

Tables use native footer/summary facilities with matching column widths/alignment, blank selection cells and no row contexts/actions. For tables, core supplies labelColumnSpan: the number of leading business columns before the first declared summary slot, with a minimum of one. Merge that leading allocation, keep selection separate and retain each summary value at its column. If the first column has a summary, preserve both its label and value in the same cell. Covered cells must not occupy additional table tracks or accessibility positions. A merged label is not measured as content of one original column. Associate summary cells with their headers and name the summary/footer appropriately, including split native tables. Declare table.summary.v1. Full-height tables retain the summary at the visible bottom while records scroll, with opaque native surfaces and no obstruction of final-row controls. Preserve horizontal header/value alignment and native footer integration. Content-height summaries remain in normal flow. UiCollectionCardsViewProps refines dataSummary with cardTreatment: Required<UiCardTreatment>, resolved by core for the summary role independently of card hierarchy/presentation strategies. Reuse the backend card view with that treatment: a separate title header above field-name/value pairs, header band/separator, neutral tinted surface, solid boundary, flat elevation and compact density. The level-0 view input is ordinary frame context, not a summary-specific hierarchy level. Keep keys and values aligned, arrange pairs across available columns and stack at narrow widths. Cards render this named summary surface outside the record list/grid. Keep it outside the bounded card scrollport so it stays visible, with natural wrapping and backend-owned spacing; declare collection.summary.v1. Empty/loading/error presentation remains independent. Preserve editor identity, selection and scroll ownership; no slot traversal may initiate source loading. See the [business guide](../../guides/collection-summaries.md) for slot semantics and observable checks.


`useUiTableSizing` also returns `summaryRef(key)`, a content measurement/stacking registration callback with its own identity namespace. Apply it to summary content alongside contentStyle(key), so content-sized columns include summary values without replacing header/record measurements. Do not reuse a business record key for this registration.

### Table creation row and useUiTableAddRow

UiTableViewProps additionally carries optional `addRow: boolean`. When true, render a decorative column-aligned creation affordance after records and before the summary, containing the core-supplied `add-row-action` slot exactly once. Core supplies the named text-variant UiButton, original action checks, effective restrictions and focus handle; adapters must not create a second activation or pending-state owner. Declare `table.add-row.v1`. Existing arbitrary footer content is independent.

Generate noninteractive, aria-hidden tinted areas inside the native cell insets of each allocated column, including selection allocation. Keep the insets unshaded; do not tint the full column track, imitate control outlines or blur the areas. Do not invoke business cell slots, insert synthetic items, instantiate native editors or bind preview cells to item contexts. Keep the action centered over the visible allocation while columns scroll. Theme-native surface and column-separation choices belong to the adapter; no business CSS is required. Preserve focus, disabled/loading presentation, native table semantics and component identity.

Optional `useUiTableAddRow(options)` supplies geometry mechanics without choosing a DOM tree. Options are getters: `enabled(): boolean`, `bounded(): boolean`, `host(): HTMLElement | undefined`, and `summary()`, `header()`, `row()` returning actual native elements or null/undefined. The adapter owns all lookups. Return refs are `viewportWidth` and `compact`. Geometry uses ResizeObserver and update/mount observations; cleanup disconnects and restores the host's prior inline scroll padding.

`compact` indicates that the host cannot fit the header, summary and a real row: release header pinning where needed rather than obstructing row controls. The creation affordance always remains the final body row in normal vertical flow; neither it nor its row group may pin to the viewport. Its action can remain horizontally attached to the visible allocation without changing vertical scrolling. The helper reserves scroll padding for the header and summary only, so native focus/scroll-to-view can reveal final editors and the creation action. Adapters with independently allocated headers/footers must supply matching geometry. It must do nothing to ordinary tables without addRow.

Verify empty/nonempty tables, row source/count/selection independence, conditional enablement, dynamic labels/columns, header/summary geometry, one guarded action, unavailable/absent focus results, native insertion/removal and cleanup. Source/DOM checks do not establish browser geometry or assistive-technology acceptance.

## Infinite feedback content slots

`UiCollectionViewProps.infinityComplete: boolean` is core-resolved terminal feedback, excluding loading, refreshing, appending, failed, stale, uninitialized and empty states. It is true only for infinite mode with accepted nonempty records and no further source records. Use this flag rather than deriving completion from viewport geometry or an empty cursor alone. Core already resolves per-view message overrides into `message` and the elected host's `announcement`; backends must not translate or share overrides again.

Collection, table and list backend modules forward optional `infinity-loading` and `infinity-complete` slots to their status content. Invoke loading only for `infinite && appending`, inside the existing decorative loading indicator; invoke completion only for `infinityComplete`. Both receive `{ message, loadedCount: rows.length }` and have `message` as default/empty-output fallback. Preserve inline phrasing semantics and native spacing. Keep the sentinel, body continuation row and summary positioning outside slot ownership. In tables the body status suppresses duplicate announcements; the independent elected live region remains outside the table/busy mask. Ordinary non-infinite status paths do not invoke infinity slots. Error outlets additionally supply their known `failurePlacement` as `placement`.

Verify the public collection forwarding and direct table/list paths, all three failure placements, native indicators, default/empty content, terminal/empty/stale distinctions, reactive per-view wording, single-host announcement election and zero extra reads. See the [business guide](../../guides/collection-views.md#infinite-continuation-content).


## Editable collection focus coordination

UiCollectionViewProps optionally supplies recoverFocus({ key, candidates, isCurrent }): Promise<boolean>. The keys describe a removed row and following/preceding visible candidates in the prior rendered order. True means focus was handled or deliberately cancelled; false permits the native collection fallback while isCurrent remains true. This callback belongs to core's borrowing-view attachment; backends must not run a parallel recovery decision.

useUiCollectionView invokes it only when removal displaces focus, waits for its result and preserves unrelated surviving focus. Keep using rowRef for actual native rows. Its isCurrent guard covers owner lifetime, newer recovery, target reappearance, loading and current focus. The attachment tries registered editor focus handles and the table's creation-action fallback after the editing operation settles. Backend focus handles still enforce native visibility, disabled state and asynchronous target availability. Backends using their own helper must implement the same protocol; omitting callback support cannot claim the coordinated editing behavior.

UiTableSurface registers its creation action using the existing public focus handle. UiField-context editors register through core, without prescribing native markup. Generic collections with no editing attachment retain existing native recovery. Verify Add/Remove in empty and populated tables, simultaneous borrowing views, disabled-button blur, moved focus, hidden invalid rows and disposed targets. See [collection editor usage](../../guides/collection-editors.md).
