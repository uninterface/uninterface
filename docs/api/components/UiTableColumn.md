# UiTableColumn

`UiTableColumn` declares one business column inside UiTable. It does not render a cell wrapper or require an accessor. Import from `@uninterface/uninterface`.

Supply either `binding: UiTableColumnBinding<T, F, S>` or definition props: required nonempty `columnKey`, `label` (unless a meaningful `label` slot is provided), optional `sortBy: S`, `filterBy: Extract<keyof F, string>` and `filterActive: boolean`. Binding and definition props are mutually exclusive. Keys are unique and stable within the table; changing identity requires keyed remount. Foreign bindings reject.

The default slot receives [UiListSlotProps](../types/UiListSlotProps.md): `{ item, context }`. The optional noninteractive `label` slot replaces plain label content. The `filter` slot receives `{ filters: Readonly<F>, setFilters(filters): Promise<boolean>, close(): Promise<boolean> }`; business authors build their own editor and apply/debounce workflow. The backend presents a compact filter icon and an anchored popover containing the slot. `filterActive` (default false) supplies applied state explicitly; no query value is interpreted automatically. `close()` completes the popup without changing filters. Outside/Escape/trigger dismissal closes it without an implicit apply. Slot contents mount on opening and unmount on closing; retain drafts in a business owner if needed. `filterBy` is an association, not a generated filter schema.

Bound declarations infer types from their producer. Direct declarations need an explicit Vue annotation such as `<!-- @vue-generic {Order, Filters, Sort} -->`; a parent table's generics do not flow implicitly to independently declared children. [createUiTableColumnBinding](../functions/createUiTableColumnBinding.md) supports arbitrary business columns.

Core registers declarations synchronously before the backend surface, including SSR. Business component internals remain opaque. Async/Suspense or teleported declarations are unsupported. Labels/query associations may update without replacing cell editors.

Verify typed slot access rejects missing item fields and `value`, duplicate keys fail, reusable/conditional columns preserve order through SSR/hydration, and reorder retains local input drafts. See [column decisions](../../contracts/list-view-decisions.md).

Sizing definition props: `preferredWidth?: number | string`, `minWidth?: number | string`, `spring?: boolean`, `resizable?: boolean`, `align?: 'left' | 'center' | 'right'`. These are also supported in the column binding. Defaults are `12em`, `3em`, true, true and native alignment. Lengths accept positive pixel numbers or px/rem/em strings. At least one column must be springable. See [sizing, alignment and interaction rules](../../guides/table-columns.md), including the impossible-fit fallback and backend-specific reorder limitations. Verify alignment and width updates preserve drafts and do not read the source.

`preferredWidth` and `minWidth` also accept `"content"`: measure the largest currently rendered header/cell content plus native cell insets. Use both with spring=false for content-sized action columns, so manual resizing cannot clip their buttons. See [content sizing](../../guides/table-columns.md#content-sized-columns) for lifecycle, fallback and limitations.

## Stacking

`zOrder?: UiZOrder` describes outward stacking. The declaration host projects this identity onto the rendered column cells or collection field targets. See [dynamic stacking](../../guides/dynamic-z-order.md) for scope, lifetime, pending refs and observable overlap checks. Core owns order; the backend owns rendering targets.

See [column filtering](../../guides/column-filtering.md) for responsibility boundaries, synchronization and acceptance.

Declare actual source support through `UiListOptions.sorting` (`mode` and allowed `keys`). Omission means no user sorting. Column `sortBy` only offers an association whose key is allowed by that declaration. Single mode replaces the previous column; multiple mode preserves ordered clauses. Initial and programmatic queries enforce the same restrictions before requests. See [sorting capabilities](../../guides/collection-sorting.md).

## Summary slot

Optional #summary receives UiCollectionSummaryContext<T, D>: records(), scope, coverage, status, label and provided. The component's fourth generic D types summaryData; explicitly annotate direct declarations for typed payloads. The business slot selects the operation and formatting. Presence activates its owning collection/table summary. No item context, selection or editing operation is supplied. Field/column identity and alignment coordinate presentation. See [summary ownership, examples and checks](../../guides/collection-summaries.md).

