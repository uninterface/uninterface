# Collection sorting capabilities

Two independent business declarations determine the sorting offered by a collection: which source sort keys may be requested, and whether the source supports one or multiple sort levels. These declarations describe actual source support, optionally restricted by the business integration. A table toolkit's features cannot grant the data source additional capabilities.

Declare `sorting: { mode: 'single' | 'multiple', keys: [...] }` in UiListOptions. Core snapshots and enforces this capability. Omitting it means no user sorting. Table headers, collectionSortPanel and collectionSortBadges share the declaration; the source executes the query.

## Which columns are sortable

The business integration identifies the sort keys accepted by its source. A key expresses source-defined ordering; it need not be a record property or match the text displayed in a column. The business may expose a subset of those keys.

A column is sortable when the business associates it with an allowed source sort key and the selected backend can present the sorting interaction. The existing `sortBy` association performs the column mapping. Omit it for a column that must not offer header sorting. Rendering a value, giving a column an identity, or using a toolkit with sortable headers does not implicitly make that column sortable.

For example, a remote orders API might support `createdAt` and `total`, while a computed Status display has no corresponding server sort. Date and Amount can expose the supported keys; Status must not offer sorting merely because its text could be compared in JavaScript. A source sort key can also be offered by a separate sorting editor without a table column.

## Single-level versus multi-level support

This is a collection/source capability, independent of which sortable columns are currently visible.

| Declared support | Permitted user sorting request | Header interaction |
|---|---|---|
| Single-level | At most one sort clause | Sorting another column replaces the previous clause; changing direction updates that clause; removing it leaves no user sort |
| Multi-level | An ordered sequence of sort clauses supported by the source | Adding a column appends a level; changing direction retains its priority; removing a level preserves the order of the others |

No exposed sort keys means no user sorting is offered. An empty user sort request means the source's ordinary/default ordering, not a promise of unordered results. Source-owned stable tie-breakers need not be exposed as user sort levels.

Supporting sorting by Date and by Amount separately does not establish support for Date followed by Amount. The integration must know that the API accepts the ordered combination. Any additional source restrictions still apply; single/multiple alone does not describe every possible API limitation.

Table headers and external sorting editors must obey the same declared support. Switching table/cards, opening a panel or changing backend must not expand source capabilities or silently change the query. Backend-native interaction is used where compatible; an adapter must accurately represent direction and, for multiple levels, priority. Toolkit-native single-column state must not erase a valid multi-level query; toolkit-native multi-sort must not enable a second level for a single-level source.

## Visible priority in table headers

Supporting backends show one-based priority numbers beside active sort direction indicators when two or more rules are applied. A single active rule shows its direction without a number, even if the source permits multiple sorting. Numbers follow the entire source query, including fields without rendered columns; a visible column can therefore show 2 while priority 1 is external. Removing/reordering rules updates these numbers without changing the source-owned order.

Backends present sort priority with native badges or compact priority text consistent with header styling. Native header labels, direction indicators, priority numbers and controls participate in the measured header minimum, including columns with authored length minima. Accessible descriptions carry direction and priority, so the decorative number is not announced twice.

Verify adding a second rule, reversing direction, removing/reordering rules, hidden sort keys and returning to one/no rules. Browser review must cover header sizing, native caret/filter interactions, narrow allocations and RTL; DOM tests establish values and accessible wiring, not geometry.

## Execution and validation ownership

The business integration supplies truthful capabilities and maps supported query keys to the source API. Core constructs and checks sorting intent against the declared capabilities. Backend views present it and report user intent. The source executes the sorting before pagination and returns the results.

For remote sources, Uninterface must not sort only the loaded page, fetch the complete remote collection to emulate unsupported sorting, or silently drop unsupported clauses. Such behavior changes the meaning or execution of the request. An explicitly local source may sort its own complete local data; that is not a fallback for a remote API.

Capability enforcement must cover initial queries and programmatic query changes as well as UI interactions. Unsupported requests must be reported instead of silently converted into different sorting. Invalid initial configuration/query throws. Invalid setQuery rejects its promise before state changes or a source request; source execution errors continue through ordinary list error state.

## Current implementation and limits

- UiListOptions.sorting declares runtime allowed keys and single/multiple support; UiListBinding.sorting exposes its immutable snapshot.
- Initial and programmatic queries enforce keys, unique clauses, directions and cardinality.
- Table header actions offer only allowed column associations. Single mode replaces the previous clause; multiple mode preserves priority.
- createUiCollectionSortBinding supplies live query/labels to both sort adaptations. It creates no second session or data read.
- hasColumnSort reports mounted table presentation, independently of source multi-level support.
- Dynamic capability changes and arbitrary combination restrictions are not modeled. The source integration must enforce any additional API-specific constraints.

Acceptance for the capability implementation must demonstrate: unsortable columns have no sorting action; only declared keys reach the source; a single-level source never receives two user clauses; multi-level requests retain priority across edits; table and external controls agree; invalid initial/programmatic requests are reported; and remote results are never locally re-sorted. Check header keyboard interaction, visible direction/priority and native toolkit integration separately across backends.

See [list sessions and sources](lists.md), [UiTableColumn](../api/components/UiTableColumn.md), [UiListOptions](../api/types/UiListOptions.md), and the [collection ownership map](collections.md).


## External sorting presentations

In multiple mode, collectionSortPanel provides unnumbered fixed-field rows, current-direction toggles, Add for unused supported fields, and direct priority/removal actions. collectionSortBadges provides ordered badges with removal, Add field/direction selection and direct drag or Alt+Shift+Left/Right priority movement when multiple rules are active. Sorted Table headers retain their Move earlier / Move later menu. Reordering preserves direction and returns focus to the same criterion; first/last boundary operations are disabled. Both consume the same source-backed binding; selecting a view does not change the query or capabilities.

An application can omit an external sorter when sortable table columns expose every needed criterion, choose sort badges on desktop cards, and use a sort-list panel on narrow cards. Retain an external priority editor if the table lacks that operation. See the [example application policy](collection-presentation.md#example-application-policy), [panel details](collection-panels.md#sort-list-presentation-details), [badge interactions](collection-badges.md), and [design evidence](collection-header.md#design-evidence-and-limits).


For single-mode sources, collectionSortPanel defaults to collectionSortSelect, also available as an explicit adaptation. Its inline row contains Sort by, the field selector (including No sort), and direction/trash icons when a field is selected. Trash clears the rule and returns focus to the selector. Changing fields replaces the sole rule while retaining direction; choosing from No sort starts ascending. No sort requests source-default ordering. This is a presentation of declared single-sort capability, not a frontend limit inferred from the toolkit. If the application changes the source’s declared sort mode, start a new session with compatible sorting options. Switching table and card views keeps the current query.
