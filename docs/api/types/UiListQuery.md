# UiListQuery

`UiListQuery<F = Record<string, unknown>, S extends string = string>` describes one source request. Import from `@uninterface/uninterface`.

```ts
{
  readonly filters: Readonly<F>
  readonly sort: readonly { readonly key: S; readonly direction: 'asc' | 'desc' }[]
  readonly pagination?:
    | { readonly kind: 'numbered'; readonly number: number; readonly size: number }
    | { readonly kind: 'cursor'; readonly cursor: string | null; readonly size: number }
}
```

Sort descriptors are ordered and keys must be unique and nonempty. Numbered requests and sizes use positive safe integers. Cursor strings are opaque; null denotes the configured initial null route. A configured non-null initial cursor is also supported.

The control takes immutable snapshots of plain finite data, recursively copying/freezing objects and arrays, including nested filter properties. Functions, class instances, cycles and nonfinite numbers are rejected. Business records are not part of this query copy policy. Encode dates or other domain query arguments explicitly.

`setQuery` replaces supplied filters/sorts as a whole, preserving omitted parts; it restarts position atomically. Sources own processing; views do not reinterpret the query. `state.query` is requested intent, while `state.result.query` describes accepted records and may include a source-corrected numbered position.

Verify one read for a combined filter/sort transition, unchanged request meaning after external nested-filter mutation, and preserved sort-key inference. See [list sources](../../guides/lists.md#translate-the-query-once).
