# UiCollectionFilter

A logical Vue render host for one reusable filter editor. Import from `@uninterface/uninterface`. It renders the binding's stable business view with no wrapper/backend view of its own; existing fields, inputs and popup hosts supply native surfaces.

This is also the standard host for the [built-in search, choice and range filters](../../guides/filter-patterns.md). Their control factories register the default views; pass the resulting binding without selecting a separate filter-specific component. Optional presentation adaptations customize those views while preserving the same session.

Props: required `binding: UiCollectionFilterBinding`; optional `presentation: Partial<UiFilterPresentationContext>` overriding inherited/default context; standard `zOrder`. Attributes forward to the default business view. Its optional default scoped slot receives `UiCollectionFilterViewContext` instead of rendering the definition's view. Custom slot authors own attribute forwarding and semantic/editor cooperation.

Event `applied(result: 'committed' | 'unchanged')` fires only for view-context submit/clear, not live updates or direct binding calls. A column popup can close on this event. The component borrows and claims the session; unmount/deactivation releases the claim without disposal or implicit discard. Concurrent active editor views for one binding reject. Availability is exposed for host selection/disabled handling, not automatic registration removal.

```vue
<UiCollectionFilter :binding="amount.binding" />
<!-- Inside a column filter slot, context is inherited automatically. -->
<UiCollectionFilter :binding="amount.binding" @applied="close" />
```

Default context is filter-row/inline/single-row with labelProvided=false, summaryProvided=false and individual submission. Column popups supply table-column/popover/stacked and labelProvided=true. Partial overrides remain reactive. Group submission is rejected until its transaction contract exists. Logical strategy target is `collection-filter`; standard z-order participation adds no visible wrapper.

Verify inherited/custom context, stable input/focus on reactive context changes, retained draft after conditional relocation, one-editor ownership and cleanup. Actual popup focus/geometry remains backend/browser acceptance.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.

A custom default slot receives `editor`, the stable registered Vue view, alongside binding/presentation/operations. Render `<component :is="editor" />` once to wrap or arrange the existing business editor without reconstructing its field/session. Rendering multiple copies is outside the one-editor contract.
