# UiCollectionFilterPanelContext

Import from `@uninterface/uninterface`.

```ts
interface UiCollectionFilterPanelContext {
  readonly bindings?: readonly UiCollectionFilterBinding[]
  render(presentation: UiFilterPresentationContext): VNodeChild
}
```

The host supplies non-search filter views, including opaque business components. Call render once with the presentation context for their inherited editor adaptation. collectionFilterPanel supplies filter-form/panel/stacked with individual submission; other adaptations choose their own context. This does not enumerate business criteria, create filter sessions or infer query meaning.

Custom hosts must forward context to UiCollectionFilter views (direct presentation props or a header's render method). Do not render the same filter slot twice. Verify inherited context through wrappers, original commit policies and retained drafts when the host unmounts the panel. See [collectionFilterPanel](../constants/collectionFilterPanel.md).

`bindings` enumerates the definitions supplied by the host; an enumerating view must respect their current availability/disabled state. It is optional for render-only panels and required by `collectionFilterBadges`, which uses it instead of calling render. Enumeration never creates another session or changes filter values. The business must not mount a duplicate editor for a binding that is open in the badge chooser.
