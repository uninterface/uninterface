# createUiCollectionSortBinding

Import from `@uninterface/uninterface`.

```ts
createUiCollectionSortBinding<T, F, S extends string>(
  list: UiListBinding<T, F, S>,
  labels: Readonly<Record<S, UiTextSource>>,
): UiCollectionSortBinding
```

Projects a list's declared sorting capability and applied query into a reusable panel binding. Provide a nonempty label for every allowed source key; functions can read reactive localization. Labels are resolved on presentation reads. This helper creates no session, watcher, data request or second query state, and needs no disposal. The list owner retains lifetime and source errors.

```ts
const sorting = createUiCollectionSortBinding(control.bindings.list, {
  customer: () => t('customer'),
  amount: () => t('amount'),
})
```

Pass it as UiCollectionHeader's `sortBinding`, or to collectionSortPanel.view({ binding: sorting }). Field availability and single/multiple support come from the source declaration, not labels. Verify live query/label updates, guarded disabled/disposed calls and rejected unsupported keys. See [panel usage](../../guides/collection-panels.md).
