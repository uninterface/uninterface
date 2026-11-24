# UiCollectionSortPanelContext

Import from `@uninterface/uninterface`.

```ts
interface UiCollectionSortPanelContext {
  readonly binding: UiCollectionSortBinding
}
```

The host supplies a borrowed sorting binding. The view reads current fields, mode, ordered clauses and availability and submits complete sort intent through setSort. It owns neither source execution nor disclosure. Verify no load on mount, synchronization with external changes and single/multiple enforcement. See [collectionSortPanel](../constants/collectionSortPanel.md).
