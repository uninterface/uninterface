# createUiListControl

Creates an explicitly owned collection session. Import from `@uninterface/uninterface`.

```ts
createUiListControl<T, F = Record<string, unknown>, S extends string = string>(
  options: UiListOptions<T, F, S>,
): UiListControl<T, F, S>
```

`T` is the business item, `F` the filter data and `S` the allowed sort-key vocabulary. Required options are `itemKey`, `query` and `source`; selection, pagination, restrictions and mutation/activation operations are optional. See [UiListOptions](../types/UiListOptions.md).

The factory does not fetch. Its owner explicitly calls `refresh()` and `dispose()`. The returned factory-created object has immutable reactive observations and stable list/paginator bindings. Borrowing does not start, reset or end a session. No backend, DOM, toolkit store or process-wide collection state is created.

Invalid configuration throws before a source call. Source failures and result-contract errors are captured in read state. A directly returned source result is accepted synchronously within the call; promised results retain pending state until settlement. The public operation still returns a Promise<boolean>. Do not introduce an asynchronous loading frame for a synchronous projection refresh. Invalid owner requests throw/reject, while unavailable or superseded operations return `false`. Mutation failures belong to item contexts. The [control interface](../types/UiListControl.md) specifies each operation; the [list guide](../../guides/lists.md) explains ownership, reconciliation and supported examples.

Implementation responsibility: guard requests and item operations synchronously, retain accepted identity/query metadata, prevent obsolete publication, and expose source-supported navigation without invented counts. Verify independent sessions, synchronous/asynchronous source parity, retained failures, immutable query snapshots and idempotent disposal. Parent-form integration uses a separate [list-value control](createUiListValueControl.md). Consult the selected backend’s view capabilities and native table SSR/hydration limitations.

The returned control also exposes reactive `hasColumnSort` and `hasColumnFilter` observations for coordinating header controls with a separate business section. See [UiListControl](../types/UiListControl.md) and [column filtering](../../guides/column-filtering.md) for aggregation, SSR and lifecycle semantics.
