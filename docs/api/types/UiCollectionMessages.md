# UiCollectionMessages

Import from `@uninterface/uninterface`.

## Meaning and API

```ts
export type UiCollectionMessages = Partial<{
  listAppending: string
  listComplete: string
}>
```

Per-view plain-text wording accepted by `UiCollectionView`, `UiTable` and `UiList` through optional `messages`. Omitted keys use the current application translations. `listAppending` labels append activity; `listComplete` labels explicit infinite-source completion. Ordinary Vue bindings make supplied strings reactive. Bind translations explicitly when they should follow language changes; literal values remain literal.

## Ownership and verification

Core resolves wording for the view's default visible content, infinity slot context and elected single announcement. Backends retain indicator and placement. Overrides do not alter activity, source completion, data, query or continuation guards, and do not propagate to other views sharing the binding. Slots cannot supply announcement text implicitly.

Verify two views retain their own wording, the elected visible host supplies the announcement, omission falls back after locale changes and changing messages causes no reads. See [infinite feedback](../../guides/collection-views.md#infinite-continuation-content).
