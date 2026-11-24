# UiCollectionHeaderPart

Import type from `@uninterface/uninterface`.

```ts
type UiCollectionHeaderPart = 'search' | 'filters' | 'sort' | 'actions' | 'info'
```

Names the five public header slots. Business authors supply their content; presentation implementations compose it through UiCollectionHeaderViewContext.render. A disclosure trigger is owned and rendered by an adaptation and is not a business slot. Core omits empty direct slot output without inspecting opaque components. Check optional content, reading order and reachability in each presentation. See [UiCollectionHeader](../components/UiCollectionHeader.md).
