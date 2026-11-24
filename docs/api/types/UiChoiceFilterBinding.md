# UiChoiceFilterBinding

Import type from `@uninterface/uninterface`.

```ts
interface UiChoiceFilterBinding<V> extends UiCollectionFilterBinding {
  readonly pattern: 'choice'
  readonly editor: UiChoiceFilterEditorBinding<V>
}
```

The target remains collection-filter. Inherited members are documented on [UiCollectionFilterBinding](UiCollectionFilterBinding.md). All common getters and operations refer to the original session, not copied state. Pass this binding to UiCollectionFilter or existing collection hosts such as a table column filter. Do not fabricate it or spread it into a replacement object: hosts require a factory-registered binding. Typed editor access supports custom view implementations; ordinary consumers need only pass the binding. Verify live common getters, shared commit/clear/discard, disabled state and draft retention across host remounts. See [filter adaptations](../../guides/filter-adaptations.md).
