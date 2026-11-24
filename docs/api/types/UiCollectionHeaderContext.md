# UiCollectionHeaderContext

Import type from `@uninterface/uninterface`. Read-only snapshot passed to header selectors and presentation render functions:

```ts
interface UiCollectionHeaderContext {
  readonly environment: UiResponsiveContext
  readonly parts: readonly UiCollectionHeaderPart[]
  readonly activeFilterCount: number
  readonly activeSortCount: number
}
```

Environment is the configured responsive token, not a measured width. Parts lists nonempty direct public slot output; opaque components are not inspected. Active counts are separately validated business-supplied counts, not inferred criteria. Filter activity excludes search unless the business explicitly defines otherwise; sort activity counts levels. Do not mutate this snapshot. Core evaluates business slots once per render and tracks reactive selection/render reads. Verify environment, slot visibility and count changes without requests or duplicate slot evaluation. See [uiCollectionHeaderPresentation](../../strategies/uiCollectionHeaderPresentation.md).
