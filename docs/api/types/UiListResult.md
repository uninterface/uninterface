# UiListResult

Source result, imported from `@uninterface/uninterface`:

```ts
interface UiListResult<T> {
  readonly items: readonly T[]
  readonly complete: boolean
  readonly pagination?: UiListPaginationResult
}
```

`complete` explicitly states whether these items cover the entire matching collection. A partial unpaginated result is permitted but grants no navigation. Pagination metadata must match the configured/requested mode and size. Returned windows cannot exceed the requested size. Known totals cannot be smaller than returned counts, and `complete: true` with a known total must include that entire count. See [UiListPaginationResult](UiListPaginationResult.md).

`undefined` is reserved for an absent context item; wrap such a domain value in a keyed record rather than returning it as an item.

The controller copies and freezes accepted membership and metadata, preserving each original item object. It validates keys and metadata before publication. Invalid replies become read failures and preserve the previous accepted result. It adds an immutable `query` snapshot in [UiListState](UiListState.md).

Cursor accumulation reconciles overlaps by key and reports the combined projection. Its traversal/completeness rules are explained in [the list guide](../../guides/lists.md#accumulate-continuation-results); a terminal cursor is not by itself proof that a non-null initial route covered the whole collection.

Sources own domain validation and filtering/sorting/paging. Views render accepted items once. Verify successful empty versus absent/failed result, retained object identity, duplicate failure and atomic metadata publication.
