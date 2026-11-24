# UiChoiceFilterControl

Import type from `@uninterface/uninterface`. Factory-created control, not a class:

```ts
interface UiChoiceFilterControl<V> extends UiCollectionFilterControl {
  readonly binding: UiChoiceFilterBinding<V>
  dispose(): void
}
```

Own one control per filter session. It registers its stable view and exposes the shared filter contract with a typed editor. Dispose releases scheduling, validation and owned resources; later commits are unavailable. View unmount/disclosure never disposes the owner. See [createUiChoiceFilterControl](../functions/createUiChoiceFilterControl.md). Verify independent controls, one active borrower, retained drafts across placements and idempotent disposal.
