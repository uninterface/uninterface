# UiTableColumnDefinition

Column meaning, imported from `@uninterface/uninterface`:

```ts
interface UiTableColumnDefinition<S extends string = string, K extends string = string> {
  readonly columnKey: string
  readonly label?: UiTextSource
  readonly sortBy?: S
  readonly filterBy?: K
  readonly filterActive?: boolean
  readonly preferredWidth?: number | string
  readonly minWidth?: number | string
  readonly spring?: boolean
  readonly resizable?: boolean
  readonly align?: 'left' | 'center' | 'right' 
}
```

`columnKey` is a nonempty stable business column identity. `label` is the plain-text header fallback; a label slot can supply rich noninteractive content. `sortBy` selects a declared sort key; `filterBy` associates a header filter with a filter-object key. Content remains independent: there is no mandatory record accessor. Filter association does not generate a filter editor or infer its business predicate.

The [binding helper](../functions/createUiTableColumnBinding.md) constrains `S` and `K` from its list binding and reads the definition reactively. Declarations must have unique identities within a table and a label or label slot; a binding cannot be overridden by competing local definition props. Definitions alone do not render, invoke a source, select a record or authorize editing.

The type, helper and dedicated column/table views are implemented. Widths accept positive pixel numbers or px/rem/em strings; defaults are preferred 12em, minimum 3em, spring true and resizable true. Alignment defaults to the backend. See [column allocation and alignment](../../guides/table-columns.md) for consumer obligations, interaction and observable verification. Verify localized label updates preserve identity and unsupported sort/filter keys fail compilation. See [the selected declaration contract](../../contracts/list-api.md#async-records-control-and-table).

`preferredWidth` and `minWidth` also accept `"content"`: measure the largest currently rendered header/cell content plus native cell insets. Use both with spring=false for content-sized action columns, so manual resizing cannot clip their buttons. See [content sizing](../../guides/table-columns.md#content-sized-columns) for lifecycle, fallback and limitations.

`label` accepts [UiTextSource](UiTextSource.md). Core resolves it reactively before presentation; changing text preserves identity and interaction state. Functions must return text synchronously without side effects. See [text-source usage and verification](../../guides/text-sources.md).

`filterActive` is the business-supplied applied state of the column filter (false on omission), independent of whether the popup is open. It updates the indicator and accessible name; it never changes query criteria.

Sorting availability follows [UiListOptions.sorting](UiListOptions.md): the source's allowed keys and `single`/`multiple` mode. Column `sortBy` offers an association; it does not grant source support. Single mode replaces the prior clause when another column is sorted; multiple mode preserves the other ordered clauses. Omitted sorting configuration offers no user sorting. See [sorting capabilities](../../guides/collection-sorting.md).
