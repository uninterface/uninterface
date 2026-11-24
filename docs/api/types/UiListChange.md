# UiListChange

A confirmed business mutation and the integration's knowledge of its effect on the accepted collection. Import from `@uninterface/uninterface`.

```ts
type UiListChange<T> =
  | { kind: 'upsert'; item: T;
      reconciliation: 'unknown' | { index?: number; exclude?: boolean; total?: number } }
  | { kind: 'remove'; key: UiListKey;
      reconciliation: 'unknown' | { total?: number } }
```

For known upserts, omission of `index` preserves the existing same-key position; insertion requires an explicit zero-based final index within accepted membership. Supplied index repositions a replacement. `exclude: true` removes it from this query's projection without claiming business deletion or clearing retained selection. Known removal clears the key from accepted records and selection. The application must actually know query membership and order; `{}` is an assertion, not an instruction to guess.

A membership change with a previously known pagination total requires the authoritative new total. Invalid indices/totals, simultaneous exclusion/insertion and overflow of a replacement page are rejected atomically. Removing the last row beyond the newly known last page marks the result stale; an explicit first/absolute/refresh request obtains the corrected window. No unseen row is invented to refill a page.

Unknown upsert replaces an existing value in-place but does not insert an unseen key. Unknown remove hides that known key and clears selection. Both mark stale, remove total/cursor-offset knowledge and prevent relative continuation until reconciled. The owner chooses when to refresh. Without any accepted result, changes cannot construct one; they mark reconciliation needed.

`applyConfirmed` invalidates in-flight reads, including sources that ignore abort. It does not persist, deep-clone domain records, refetch, or write to a parent draft. Invalid changes throw; a configured operation returning an invalid change records an item error. A configured mutation's known reconciliation belongs to the accepted query at dispatch. If a different query is accepted before it finishes, the controller treats its reconciliation as unknown to prevent old placement/count assumptions affecting the new window. Owner calls to `applyConfirmed` must describe the currently accepted query.

Known reconciliation also asserts that retained continuation routes remain usable. Use unknown reconciliation when a mutation invalidates them. Remote eventual consistency, optimistic rollback, whole-window replacement and temporary child-editor key reconciliation are separate concerns.

Verify canonical replacement without extra reads, selected-key retention, unknown insertion omission, authoritative totals, atomic failure and older-read rejection. See [confirmed updates](../../guides/lists.md#keep-selection-and-item-actions-separate).
