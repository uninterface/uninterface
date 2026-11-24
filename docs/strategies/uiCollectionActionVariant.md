# uiCollectionActionVariant

Select collection record-action surfaces independently of their content.

```ts
uiCollectionActionVariant('bordered' | 'soft' | 'text', options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

Import from `@uninterface/uninterface`. `bordered` preserves each action’s ordinary treatment, including a collection’s mix of filled and outline buttons; `soft` requests a subdued tinted surface; `text` removes persistent fill/boundary while retaining interaction feedback. The strategy consumes [UiCollectionActionVariant](../api/types/UiCollectionActionVariant.md) at the `button` node of UiCollectionButton. It applies to table, full-width-card and grid-card record actions, including top-end actions. Header New/Refresh, filter-editor controls, paginator buttons and arbitrary ordinary UiButton content do not consume this concern.

```vue
<UiStrategy :use="uiCollectionActionVariant('soft')">
  <OrderCollection :binding="orders.bindings.list" />
</UiStrategy>
```

UiCollectionView.actionPresentation and UiCollectionButton.presentation continue to select text, icon+text or icon content. A bordered icon-only button retains its accessible label/hint. Missing artwork retains visible text. Semantic color, disabled/loading state, confirmation and invocation ownership are unchanged.

No declaration is automatically installed. Omission, a blocked concern or disagreement uses the backend's default collection action variant. Default is absence of a request, not a fourth strategy value; a backend may choose bordered, soft or text. Bordered preserves each action's defaultVariant, including mixed filled/outline treatments, or its text/native-icon fallback when no composition default is supplied. Explicit UiCollectionButton.variant takes precedence over strategies. Use defaultVariant for overridable business-composition defaults; ordinary consumers need not reconstruct buttons.

Equal supported answers agree; differing answers decline. Family/query blocking, target/depth/stopAt scopes and custom query answers follow the strategy protocol. When both this query and uiButtonVariant answer, their surface requests must agree after bordered resolves to each action's ordinary treatment. Disagreement in either concern or between them restores the contextual default. Generic icon does not change a collection's selected content mode. This is a concern-specific agreement, not universal local priority.

Core projects independent content/surface intent; backend views use useUiButtonPresentation and own native markup, geometry, hint, focus and visual feedback. Declare strategy.collection-action-variant.v1. Verify each surface in all content modes, explicit/default choices, blocking/agreement, reactive focus and draft retention, loading guards and destructive color. Browser visual review remains distinct from DOM wiring.
