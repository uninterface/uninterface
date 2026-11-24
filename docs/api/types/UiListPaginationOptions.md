# UiListPaginationOptions

Session pagination configuration, imported from `@uninterface/uninterface`:

```ts
type UiListPaginationOptions = (
  | { kind: 'numbered'; canJump: boolean }
  | { kind: 'cursor'; initialCursor?: string | null; mode?: 'replace' | 'accumulate' }
) & { pageSize: number; pageSizes?: readonly number[] }
```

`pageSize` is required and positive. Optional `pageSizes` must be unique positive safe integers and include the initial size when nonempty. Omitted/empty choices disable size-changing requests. No library page-size default is invented.

Numbered mode starts at page 1 and requires an explicit declaration of arbitrary-page access. Cursor mode defaults to null initial cursor and page replacement. Accumulation retains chunks and disables previous navigation; `first` and `refresh` restart accumulation. Query/size changes always restart at the configured first position.

Configuration is copied/frozen for the session; live mode switches are unsupported. Multiple views borrow the same options. A known total does not change `canJump` or convert cursor navigation into numbered navigation.

Verify rejected invalid sizes, atomic restart, cursor replacement versus accumulation, and no extra load when borrowing [UiPaginatorBinding](UiPaginatorBinding.md).
