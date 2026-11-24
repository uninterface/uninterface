# createUiListFilterSource

`createUiListFilterSource<T, F, S extends string>(binding: UiListBinding<T, F, S>): UiCollectionFilterSource<F>` borrows a list query owner. Import from `@uninterface/uninterface`.

read returns state.query.filters. update invokes a synchronous transformation against current filters, skips identity-preserving updates and dispatches through binding.setQuery. Returns synchronous query acceptance, not remote read success. Source failure/loading/retry remain in the existing list state. Query changes retain ordinary pagination-reset and read supersession semantics. Disabled/disposed list bindings reject updates. The source does not own or dispose the list and performs no mounting reads.

Verify acceptance before delayed replies, failed reads retaining requested criteria, latest-query merges, no-op suppression and disabled/disposed guards.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
