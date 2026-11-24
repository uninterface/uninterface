# uiSearchFilterPresentation

Import from `@uninterface/uninterface`. Selects an actual search filter view implementation, not a parameter profile.

```ts
uiSearchFilterPresentation(
  value: UiFilterSelection<UiSearchFilterEditorBinding>,
  options?: { scope?: UiStrategyScope },
): UiStrategyDeclaration
```

Accepts a stable adaptation object or synchronous reactive selector receiving UiFilterViewContext. Attach with UiStrategy; target is collection-filter. Selectors are evaluated before object-identity agreement. Different selectors selecting the same object agree; different objects with equal names conflict. Undefined abstains. Conflict/no answer restores the pattern's documented default. Family/query barriers, depth, targets and stopAt follow the normal strategy contract. Names are diagnostic; no registration or backend selection is involved.

The default and supplied view exports are documented in [filter adaptations](../guides/filter-adaptations.md). Context is host presentation plus the typed editor/common filter operations; selection must not edit/query. Pattern-incompatible custom direct answers are unsupported; an incompatible selector result throws. Range/choice families operate over compatible pattern bindings; application-specific typed views must be scoped to compatible value semantics.

Verify context and reactive state changes, identity agreement, conflict/default recovery, barriers, custom Vue rendering and unchanged business criteria/commit policy. Backends fulfill the composed components. Browser checks remain necessary for layout/focus and native picker/tooltip behavior.
