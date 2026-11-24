# createUiLocalListSource

Adapts a complete, application-owned collection to a list source. Import from `@uninterface/uninterface`.

```ts
createUiLocalListSource<T, F = Record<string, unknown>, S extends string = string>({
  items,   // () => readonly T[]
  matches, // optional (item: T, filters: Readonly<F>) => boolean
  compare, // optional Partial<Record<S, (left: T, right: T) => number>>
}): (query: UiListQuery<F, S>) => UiListResult<T>
```

Each invocation reads `items()`, applies matching, stable ordered sorting, then optional numbered pagination exactly once. It copies membership and preserves item references; it never mutates the model. Equal comparison results preserve the original order. Comparators must return finite numbers. Nonempty filters without `matches`, undeclared sort keys and cursor pagination throw; the owning list control captures these as source failures.

Without pagination the result is complete. Numbered results include matching total and accepted size/number; a requested page beyond the new last page is clamped, with page 1 used for an empty result and total zero. `complete` is true when the whole matching collection fits that page.

The helper does not watch reactive inputs, perform writes, acquire mutation permission or integrate parent validation/reset. Refresh deliberately after model changes. A remote page must not be passed as a complete local collection unless local processing is intentionally restricted to that page.

The business supplies predicate/comparator meanings. Presentation must use the result without another filtering/sorting/paging pass. Verify one predicate pass per read, stable ties, unchanged object identity and correct accepted metadata after removing the last page. See [list sources](../../guides/lists.md#translate-the-query-once).
