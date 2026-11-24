# createUiSearchFilterControl

Import from `@uninterface/uninterface`. Creates a reusable search filter session with its typed editor binding and registered default view.

```ts
createUiSearchFilterControl<F>(
  definition: UiSearchFilterDefinition<F>,
  source: UiCollectionFilterSource<F>,
): UiSearchFilterControl
```

The business definition retains the existing filter contract and omits createEditor. Criterion: `string`. Optional codec/rules, placeholder and searchLabel. Ordinary consumers pass the resulting binding; they do not reconstruct fields/projections or native input wiring. Create once per business lifetime and dispose with its owner, independently of where its view is mounted.

The control extends the common collection-filter binding with pattern and a typed editor. Common commit/clear/discard, summaries, activity, validation scheduling and stale-result guards remain authoritative. UiCollectionFilter renders the registered view and borrows this editor session; concurrent editors for one binding are rejected. Backends render the shared view's native-backed components, never a separate query engine.

See [built-in filters](../../guides/filter-patterns.md) for defaults, detailed interactions, examples and limits, and [filter adaptations](../../guides/filter-adaptations.md) for presentation replacement. Verify valid/invalid/unchanged commits, external synchronization, clearing, disabled state, explicit/live policies, context switches without reads and disposal. Browser checks establish native geometry/keyboard behavior.
