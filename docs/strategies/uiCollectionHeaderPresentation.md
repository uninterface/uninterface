# uiCollectionHeaderPresentation

Select a backend-independent collection header adaptation. Import from `@uninterface/uninterface`; attach with UiStrategy. Ordinary headers need no declaration.

```ts
uiCollectionHeaderPresentation(
  value: UiCollectionHeaderSelection,
  options?: { scope?: UiStrategyScope },
): UiStrategyDeclaration
```

Accepts an adaptation object or a synchronous selector `(context: UiCollectionHeaderContext) => adaptation | undefined`. The selector receives the current responsive environment token, nonempty public slot names, and activeFilterCount and activeSortCount. Reactive values read by selectors and presentation render functions are tracked. Selection stays pure and does not render slots. Presentation functions compose Vue components and slot content; business operations belong to event handlers and business-owned controls, never to rendering.

```ts
import {
  uiCollectionHeaderPresentation,
  collectionHeaderLongRow,
  collectionHeaderNarrowExpandable,
} from '@uninterface/uninterface'

const headerPresentation = uiCollectionHeaderPresentation(({ environment }) =>
  environment === 'mobile'
    ? collectionHeaderNarrowExpandable
    : collectionHeaderLongRow,
)
// <UiStrategy :use="headerPresentation"><UiCollectionHeader>…</UiCollectionHeader></UiStrategy>
```

This is also the default selection. Other environment tokens default to long-row; custom responsive vocabularies can supply their own conditional selector. Constant shorthand: `uiCollectionHeaderPresentation(collectionHeaderLongRow)`. Explicit selection overrides the default even when its layout differs from the current environment. Width detection remains independent; no new breakpoint or container observer is introduced.

Each eligible selector is evaluated in this header's current context, then selected adaptation objects must agree by identity. Returning undefined abstains. Distinct functions selecting the same object agree; distinct objects with identical names do not. No answer, all abstentions, or disagreement restore the default responsive selection. Scope targets (`collection-header`), depth, stopAt, family blocking and query blocking retain normal strategy semantics; no local-wins rule is added.

Names describe adaptations; they are not registry keys or accepted string values. Built-ins are statically exported objects, and custom objects implement [UiCollectionHeaderAdaptation](../api/types/UiCollectionHeaderAdaptation.md). Keep object identities stable; do not construct a fresh object in each selector call. No registration, backend switch or closed adaptation-name union is required. Each adaptation supplies an actual Vue render implementation; custom implementations can return their own component tree and interactions.

The header resolves the adaptation and hosts its Vue output with shared lifetime support. Each implementation owns its composition, disclosure and filter context. supporting backends fulfill the components it uses with native markup, spacing and editor alignment. No native toolkit supplies this exact five-slot header contract. Verify reactive selection, custom grouping, identity agreement/conflict, scoped/block recovery, no source reads, retained drafts/focus and empty slots. Browser checks must establish wrapping, containment and actual alignment. See the [header guide](../guides/collection-header.md).
