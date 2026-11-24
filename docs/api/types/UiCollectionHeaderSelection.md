# UiCollectionHeaderSelection

Import type from `@uninterface/uninterface`.

```ts
type UiCollectionHeaderSelection = UiCollectionHeaderAdaptation
  | ((context: UiCollectionHeaderContext) => UiCollectionHeaderAdaptation | undefined)
```

A stable adaptation object or a pure synchronous contextual selector. Undefined abstains. Reactive reads are tracked; selected objects agree by identity, not name or selector-function identity. No registration or string catalog is involved. Avoid allocating adaptations inside the selector. Core restores responsive defaults on no answer/disagreement. Verify reactive conditions and scoped agreement using [uiCollectionHeaderPresentation](../../strategies/uiCollectionHeaderPresentation.md).
