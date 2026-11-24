# UiCollectionPanelAdaptation

Import from `@uninterface/uninterface`. An open presentation contract, not a standard component or name registry.

```ts
interface UiCollectionPanelAdaptation<Context> {
  readonly name: string
  readonly view: (context: Context) => VNodeChild
}
```

Names are diagnostic. The view returns actual Vue composition using native-backed components; use a child component for setup/lifecycle hooks. The host owns outer visibility, placement, toggle accessibility and expansion coordination. An adaptation can render inline badges and own its internal Add popup; the type name does not require a stacked or expandable panel. The business owns filter sessions and source queries. Implementations must preserve those ownership boundaries and never submit merely on mount/unmount.

Use UiCollectionFilterPanelContext or UiCollectionSortPanelContext for their respective panels. Replace through UiCollectionHeader's filterPanel/sortPanel object props or directly invoke a view in a custom composition. These props accept reactive objects, not selector functions or strategy declarations; use computed selection when conditional. See the [selection reference](../../guides/collection-presentation.md). Stable objects and static imports support tree shaking. Replacement trees follow normal Vue remount semantics.

Verify real custom rendering, independent selection, disclosure without reads, preserved owner drafts and keyboard access. See [panel guide](../../guides/collection-panels.md).
