# UiCollectionHeaderViewContext

Import type from `@uninterface/uninterface`. Runtime services passed to a collection header presentation implementation:

```ts
interface UiCollectionHeaderViewContext extends UiCollectionHeaderContext {
  readonly id: string
  readonly queryLabel: string
  readonly filterLabel: string
  readonly sortLabel: string
  readonly resetLabel: string
  readonly reset?: UiButtonBinding
  render(part: UiCollectionHeaderPart, presentation?: UiFilterPresentationContext): VNode | null
  renderPanel(part: 'filters' | 'sort'): VNodeChild
  state<T>(key: symbol, initialize: () => T): T
}
```

`environment`, `parts`, `activeFilterCount` and `activeSortCount` retain the selector context's meanings. `id` is stable and unique for the header mount; derive IDs for actual presentation regions from it. `queryLabel`, `filterLabel`, `sortLabel` and `resetLabel` supply localized or business-overridden names. Optional `reset` is the business-owned ordinary button binding: render it through UiButton so disabled/loading/activation guards remain authoritative. The host does not generate a trigger or impose a panel structure.

`render` returns a keyed wrapper for supplied/generated content, or null for absent content. For filters, an alternative filterPanel with explicit filterBindings can wrap that content in its selected collection presentation; it is not always a raw slot wrapper. It provides the supplied filter presentation to UiCollectionFilter descendants, including opaque business wrappers. Omission supplies ordinary filter-row/inline context for other parts. For search it supplies header-search/inline by default, except outside mobile with a filters part and the default collectionFilterPanel fields presentation, where it supplies filter-row/inline. A header adaptation can pass an explicit context; narrow-expandable always requests header-search. It creates no editor session or group submission policy. Each slot must be rendered at most once and remain reachable. Conditional omission may unmount borrowed views; owner-held sessions retain their drafts.

`state` initializes a value once per symbol per header mount. Use a module-level private symbol, not a new symbol per render; implementations sharing a symbol intentionally share that state. Refs, computed values and watchers created by the initializer belong to the header's effect scope; onScopeDispose cleanup runs when the header unmounts. State survives adaptation switches and temporary empty content. It is not global or a new business controller. Watchers remain active while another adaptation is selected, so use this for shared lifetime requirements; use a child Vue component for activation-specific lifecycle work. Do not call component setup hooks in a render function.

```ts
const expandedKey = Symbol('my-header-expanded')
// Within view(context):
const expanded = context.state(expandedKey, () => ref(false))
// An event handler may change expanded.value; render reads remain reactive.
```

A view may return arbitrary Vue component compositions. The current context is a render snapshot: child components should read their current context prop, and long-lived callbacks should not retain stale snapshots. No backend registry or fixed group layout is required. Verify independent header instances, initialization once, scope disposal, state retention, inherited filter context and no business requests caused by presentation changes. See [UiCollectionHeaderAdaptation](UiCollectionHeaderAdaptation.md).

`renderPanel` applies the selected reusable filter panel, or renders custom/generated sort content. Use it once instead of render for a panel part. The default filter result is stacked; alternatives can be inline badges or custom views. Hosts supply external disclosure and placement. `parts` includes generated filters from nonempty filterBindings and generated sorting when the sort binding has eligible fields. Nonempty slots take precedence over generating their content; badge filters require explicit bindings. See the [precedence table](../../guides/collection-presentation.md#content-supply-and-precedence). See [panel adaptations](../../guides/collection-panels.md).
