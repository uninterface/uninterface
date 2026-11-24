# uiHierarchyLevelQuery

Import from `@uninterface/uninterface` or `@uninterface/uninterface/backend`. This shared `UiStrategyQuery<UiHierarchyLevel>` identity underlies [uiHierarchyLevel](../../strategies/uiHierarchyLevel.md).

Custom strategies answer with `uiHierarchyLevelQuery.answer(value)`. The card's core logical node resolves supported contributions using unanimity on original requested values. An explicit card level overrides the agreed preference; no answer/conflict uses zero. Backend adaptation happens afterward, so -2 and -1 remain conflicting answers even when presented alike.

Passing this identity to UiStrategy.block blocks all incoming families answering this concern. Reusing the string name does not reproduce the identity. Verify custom answers, scopes, blocking, disagreement and reactive prop removal. See [UiCard](../components/UiCard.md) and the [backend protocol](../backend/feedback.md#uicardviewprops).
