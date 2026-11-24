# UiListBinding

`UiListBinding<T, F, S>` is the producer-independent collection target intended for both list and table views. Import from `@uninterface/uninterface`. Views borrow the same session; native presentation support is declared by the selected backend.

| Member | Contract |
|---|---|
| `target` | Literal `'list'` |
| `continuation` | `'none'` or `'accumulate'`, available before initial loading |
| `generation` | Replacement-read generation; appends retain it, refresh/query restart advance it |
| `state` | [UiListState](UiListState.md) |
| `items` | Accepted read-only item array, empty before a result |
| `selection` | `'none' \| 'single' \| 'multiple'` |
| `disabled` | Session availability restriction, including disposal |
| `itemKey(item)` | Stable [UiListKey](UiListKey.md) |
| `context(key)` | Live [UiListItemContext](UiListItemContext.md); does not create an editor |
| `setQuery({ filters?, sort? })` | Shared atomic query request; returns `Promise<boolean>` |
| `selectPage(selected)` | Multiple selection over eligible accepted keys only |
| `hasMore`, `canLoadMore` | Accumulation continuation existence versus current ability to request it |
| `loadMore()` | `Promise<boolean>`; accumulated next chunk only, never an initial load or automatic failure retry |
| `canRetry`, `retry()` | Current read retry availability and `Promise<boolean>` request |

No `dispose` or mount-load operation is exposed. Views must not infer another source call from mounting, copy the result into another authoritative store or process it again. A custom producer must implement the same ownership, immutability, failure and synchronous duplicate-guard guarantees; structural typing does not establish its conformance.

After disposal, retained item observations remain readable and request methods become inert. The control's item contexts may be read for a stale view's final render. Verify two borrowers share identical updates, binding identity stays stable, and repeated continuation requests produce one call. See [the guide](../../guides/lists.md).

Supply `state.failedRead` when a read fails so views can place recovery correctly even when mounted after that failure. When omitted, views distinguish initial/replacement using accepted-result presence; append-specific presentation needs explicit metadata. See [read failure guidance](../../guides/lists.md#read-failures-and-recovery).

`sorting: UiListSorting<S>` exposes the immutable source capability, including when no keys are allowed. Views offer only declared keys and obey single/multiple cardinality. Custom producers must enforce it in setQuery as well. See [source capability](UiListSorting.md).
