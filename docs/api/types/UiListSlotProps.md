# UiListSlotProps

```ts
interface UiListSlotProps<T> {
  readonly item: T
  readonly context: UiListItemContext<T>
}
```

Import from `@uninterface/uninterface`. This is the selected shared payload for list-item and table-cell content: the original business record and its [keyed interaction context](UiListItemContext.md). It contains no separate accessor-derived `value`, vendor row/store or writable membership array.

The type is available for reusable content components and implemented list/table views. Business content may combine several record fields or present independent actions. Selection, activation and removal remain distinct. A column's sort/filter association does not dictate what its cell displays.

Implementations must preserve concrete item typing and keyed child identity. Verify incorrect record-property access is rejected and reordering columns preserves mounted editor drafts. See the [view proposal](../../contracts/list-api.md).
