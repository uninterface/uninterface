# UiPaginatorBinding

Producer-independent navigation for one list session, imported from `@uninterface/uninterface`. The control supplies this binding when pagination is configured. UiPaginator, UiPaginatorSizeSelect and UiPaginatorJumper independently borrow this binding.

| Observation | Meaning |
|---|---|
| `target`, `kind` | `'paginator'`; `'numbered' \| 'cursor'` |
| `requested`, `accepted?` | Intended request versus metadata attached to retained records |
| `total?`, `pageCount?` | Known matching total; numbered count only when known, zero for no matches |
| `range?` | `{ start, end }` using accepted position/offset and count; both zero for empty; omitted for unknown cursor offset, accumulation or a range outside safe-integer precision |
| `pageSizes` | Shared allowed choices, empty when size changes are unavailable |
| `pending`, `disabled`, `error` | Read activity, session restriction/disposal and read failure |
| `canNext`, `canPrevious` | Supported relative route, no pending request and no stale result |
| `canFirst` | Restart available after a result/failure, unless session-disabled |
| `canJump` | Configured numbered random access, unless session-disabled |
| `canChangeSize` | Configured size choices, unless session-disabled |

All request methods return `Promise<boolean>`: `next()`, `previous()`, `first()`, `goTo(number)`, `setPageSize(size)` and `retry()`. Relative navigation returns false when unavailable. Repeated relative requests are guarded synchronously; supported absolute jumps may supersede an older request. Unsupported jumps, unsupported sizes and out-of-known-range absolute requests reject rather than appearing successful. The initial empty numbered request may still be page 1.

First restarts at the configured position. Retry preserves the failed request rather than reverting to the accepted page. Cursor replacement supports provider-supplied previous routes; accumulation disables previous and exposes forward continuation/restart. No implicit history or remote-total inference is provided.

The binding has no items, independent writable page model or disposal operation. Borrowers use accepted metadata to label retained rows; unsupported optional displays must be omitted, never fabricated. Views must not claim “page 1 of 0,” manufacture cursor page numbers or reset focus merely because a request succeeds.

Verify two borrowers, repeat activation, requested/accepted separation, unknown totals, cursor totals without random access and zero matches. See [pagination usage](../../guides/lists.md#choose-pagination-from-actual-source-capabilities).

All observations above are readonly. Applications can render and localize their own statistics from total/range/pageCount/accepted/requested; there is no required statistics component. Render totals only when known, including zero. A known cursor total does not imply a page count or range.
