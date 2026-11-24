# UiCollectionFilterSource

`UiCollectionFilterSource<F>` connects filter sessions to a query owner. Import the type from `@uninterface/uninterface`.

read(): Readonly<F> returns reactive current criteria. update(transform: (current: Readonly<F>) => F): boolean must synchronously call transform once against the latest criteria and publish accepted changes before returning true; false means unavailable/rejected. Identity-preserving transforms must not request data. Optional disabled(): boolean tightens filter availability. The source owns any asynchronous data reading and its failure handling.

Do not implement update as an async function or return a remote-request Promise. Use createUiListFilterSource for existing list bindings. The filter controls do not infer a predicate engine or dispose the source. Verify atomic latest-query updates, reactive external replacement and no-op suppression.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
