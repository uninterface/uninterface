# createUiListValueControl

Creates an owned editable collection contributing one field to a parent form. Import from `@uninterface/uninterface`.

```ts
createUiListValueControl<T, E extends UiListValueEditor<T> = UiListValueEditor<T>>(
  options: UiListValueOptions<T, E>,
): UiListValueControl<T, E>
```

Supply typed `initialValue`, stable `itemKey` and a synchronous `createEditor(item)` returning a fresh exclusively owned record-valued field plus `dispose()`. The factory copies input values, stages new editors and claims coordination before publishing membership. A constructor/formatter failure leaves membership and baselines unchanged; abandoned staged editors are disposed. Keys are nonempty strings or finite numbers and must be unique. The factory does not persist, create a list source or own any Vue view.

Optional `projection: 'validate'` defers automatic row inspection until an explicit child validation boundary; text editors supply this on blur. Omission retains `change` projection. Pair it with scalar `revalidateOn: 'validate'` to defer both feedback and projection checks. See [options](../types/UiListValueOptions.md) and [validation boundaries](../../guides/editable-collections.md#validation-boundaries).

The returned [control](../types/UiListValueControl.md) owns child lifetime and whole-collection validation. Put its `field` in the parent's fixed field inventory. Dispose the parent form and then this owner when the business session ends. Hiding/filtering/paging views does not dispose editors.

An optional [record helper](createUiRecordValueControl.md) composes ordinary scalar controls into each record field. See [editable collections](../../guides/editable-collections.md) for a complete example and consumer obligations.

Verify hidden invalid children block save; moves/view swaps preserve raw drafts; membership/reset/canonical acceptance are staged; removal/disposal invalidates asynchronous results; and ownership/cycles reject. Browser/assistive-technology acceptance remains separate.
