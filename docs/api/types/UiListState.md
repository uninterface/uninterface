# UiListState

Read-only reactive observations for a collection session, imported from `@uninterface/uninterface` as `UiListState<T, F, S>`.

| Property | Meaning |
|---|---|
| `query: UiListQuery<F, S>` | Latest requested intent |
| `result?` | Accepted `UiListResult<T>` plus its `query`; absent before first success |
| `activity` | `'idle'`, `'loading'`, `'refreshing'` or `'appending'` |
| `error: unknown \| null` | Current read/result-validation failure; item-operation errors are separate |
| `failedRead?: 'initial' \| 'replacement' \| 'append'` | Current failure's read mode; cleared when a new read starts, succeeds or a confirmed change clears the error. Optional for custom producers; append-capable producers should supply it. |
| `stale: boolean` | Explicit reconciliation needed after failure/unknown mutation or an interrupted different query |
| `disposed: boolean` | Owner has ended the session |
| `selectedKeys: readonly UiListKey[]` | Retained key selection, independent of currently loaded membership |

Initial state is idle with no result and no error. Loading distinguishes first read from refresh/append over retained results. During pending requests, use `activity` and the separate query snapshots to identify retained content; `stale` is not a general query-equality test. Read success clears stale/error. An ordinary confirmed known change does not erase an already stale state; refresh reconciles it.

State properties, result arrays, query snapshots and selection arrays are not writable authoring APIs. Original item objects remain business-owned. Backends derive visible state from these observations and own localized status markup/announcement policy. Verify empty success versus failure, retained accepted-query identity, and independent source/item errors. See [list sessions](../../guides/lists.md).
