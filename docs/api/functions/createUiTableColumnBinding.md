# createUiTableColumnBinding

Creates reusable column meaning for one list session. Import from `@uninterface/uninterface`. The producer/helper and UiTable/UiTableColumn views are implemented.

```ts
createUiTableColumnBinding<T, F, S extends string>(
  list: UiListBinding<T, F, S>,
  definition: () => UiTableColumnDefinition<NoInfer<S>, Extract<keyof NoInfer<F>, string>>,
): UiTableColumnBinding<T, F, S>
```

The callback supplies live identity, localized label and optional query associations. For example, a customer column may use `{ columnKey: 'customer', label: t('customer'), sortBy: 'name' }`, while a summary column may use `{ columnKey: 'summary', label: t('summary') }`. Neither requires an accessor or a table controller. The list supplies the item, filter and sort vocabulary; a misspelled association cannot widen that vocabulary through inference.

The returned object and each read definition are frozen. The factory verifies the list target; reading the definition verifies a nonempty string column key. The callback may depend on reactive localization or business state. Keep column identity stable while a declaration is mounted; changing identity requires a keyed remount.

Consumers still choose participating declarations and content. UiTable rejects a bound column from a different list session or competing local identity/label/query props. Slot content is not part of this binding and no view mounting, source request, disposal or toolkit state is created.

Verify concrete item/query types, reactive labels, independent definitions for multiple business columns and no source call when constructing/reading a binding. See [UiTableColumnBinding](../types/UiTableColumnBinding.md) and [column composition](../../contracts/list-api.md#async-records-control-and-table).

The callback also supplies reactive `preferredWidth`, `minWidth`, `spring`, `resizable` and `align`. Reads validate positive lengths and the supported booleans/alignment. See [column sizing](../../guides/table-columns.md).

`preferredWidth` and `minWidth` also accept `"content"`: measure the largest currently rendered header/cell content plus native cell insets. Use both with spring=false for content-sized action columns, so manual resizing cannot clip their buttons. See [content sizing](../../guides/table-columns.md#content-sized-columns) for lifecycle, fallback and limitations.
