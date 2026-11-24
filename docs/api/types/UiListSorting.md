# UiListSorting

Import from `@uninterface/uninterface`. Source capabilities declared by the business integration and snapshotted by createUiListControl.

```ts
interface UiListSorting<S extends string = string> {
  readonly mode: 'single' | 'multiple'
  readonly keys: readonly S[]
}
```

Keys must be unique nonempty strings supported by the source, optionally restricted by the application. They need not be record properties. `single` permits zero or one clause; `multiple` permits an ordered list without duplicate keys. Empty keys mean no user sorting. Omitted UiListOptions.sorting normalizes to single/empty keys. Configuration is fixed for the session; create a new session to change it.

Core validates initial and programmatic queries before source requests or state changes. Invalid initial configuration throws; invalid setQuery rejects its promise. Table headers and sort panels consume the same declaration. The source executes sorting before pagination; toolkit capabilities cannot enable unsupported remote sorting.

Verify unsupported keys/cardinality rejection, single-column replacement, retained multi-level priorities and unchanged source result order. See [sorting ownership](../../guides/collection-sorting.md).
