# UiCollectionSortBinding

Import from `@uninterface/uninterface`. A borrowed, producer-independent sorting editor contract.

```ts
interface UiCollectionSortBinding {
  readonly target: 'collection-sort'
  readonly mode: 'single' | 'multiple'
  readonly fields: readonly { readonly key: string; readonly label: string }[]
  readonly sort: UiListQuery['sort']
  readonly disabled: boolean
  setSort(sort: UiListQuery['sort']): Promise<boolean>
}
```

Fields describe source-supported keys with resolved business labels. `sort` is the live applied ordered query; empty means source default order. `setSort` replaces the complete sort intent while retaining filters and resetting pagination through its owning list. Invalid keys, directions, duplicates or cardinality must be rejected before mutation/request. Source failures remain owned by the list; false does not necessarily mean an unchanged query. Disabled/disposed bindings refuse interactions.

The [factory](../functions/createUiCollectionSortBinding.md) supplies this from a list without loading or owning its lifetime. Custom producers must fulfill the same constraints. Views never sort returned records themselves.

Verify table/panel synchronization, source order, single/multiple restrictions, live labels and no requests on mount/disclosure.
