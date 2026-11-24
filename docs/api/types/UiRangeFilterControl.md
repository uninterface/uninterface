# UiRangeFilterControl

Import type from `@uninterface/uninterface`. Factory-created control, not a class:

```ts
interface UiRangeFilterControl<T> extends UiCollectionFilterControl {
  readonly binding: UiRangeFilterBinding<T>
  dispose(): void
}
```

Own one control per filter session. It registers its stable view and exposes the shared filter contract with a typed editor. Dispose releases scheduling, validation and owned resources; later commits are unavailable. View unmount/disclosure never disposes the owner. See [createUiRangeFilterControl](../functions/createUiRangeFilterControl.md). Verify independent controls, one active borrower, retained drafts across placements and idempotent disposal.
