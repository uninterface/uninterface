# UiCardPresentation

Import from `@uninterface/uninterface`.

```ts
type UiCardPresentation = Readonly<Partial<Record<UiHierarchyLevel, UiCardTreatment>>>
```

A portable map from each of the five structural levels to optional [treatment requests](UiCardTreatment.md). Use with [uiCardPresentation](../../strategies/uiCardPresentation.md). Omitted levels and properties retain their defaults; supplying a map does not require reconstructing all five entries. Negative numeric keys use computed property syntax in TypeScript, for example `{ [-1]: { color: 'primary' } }`.

The map does not choose a card's level, infer nesting, contain CSS or refer to a backend. All five keys remain independent: a customized -2 is never automatically replaced with -1. Strategy construction validates and snapshots the map; replace the declaration reactively to change it. This is a presentation configuration, not a new business schema or rendering DSL.

Default treatments distinguish -1, 0, 1 and 2; -2 shares -1. An application may deliberately assign matching custom treatments to several levels. Such customization does not change their structural meaning; its author owns evaluating the resulting distinction. Backends must not silently collapse distinct explicit treatments.

Verify partial maps, invalid keys/values, immutable snapshots, independent upper levels and equivalent maps supplied in different property orders. Native adapters translate the resolved requests without changing business content or controls.
