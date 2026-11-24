# UiCollectionHeaderAdaptation

Import type from `@uninterface/uninterface`. An open presentation implementation:

```ts
interface UiCollectionHeaderAdaptation {
  readonly name: string
  readonly view: (context: UiCollectionHeaderViewContext) => VNodeChild
}
```

`view` is a Vue render function: it returns the actual composition and owns its presentation interactions. It can use Uninterface components, application components and appropriate native content. There is no layout-description interpreter, group schema or fixed disclosure count. `name` is diagnostic; object identity determines strategy agreement. Export a stable object, without registration.

```ts
import { h } from 'vue'
import { UiLayout, UiButton, UiIcon, type UiCollectionHeaderAdaptation } from '@uninterface/uninterface'

const actionsFirst: UiCollectionHeaderAdaptation = {
  name: 'actions-first',
  view: context => h(UiLayout, { direction: 'vertical' }, {
    default: () => [
      context.render('actions'),
      context.render('search'),
      context.render('sort'),
      context.render('filters'),
      context.reset && h(UiButton, { binding: context.reset, variant: 'icon' }, {
        icon: () => h(UiIcon, { name: 'reset' }),
        default: () => context.resetLabel,
      }),
      context.render('info'),
    ],
  }),
}
```

An ordinary Vue SFC can implement the view through `view: context => h(MyHeaderPresentation, { context })`. It can have its own setup, lifecycle, child components and event handlers. Render functions themselves do not have a component setup phase: use `context.state(symbol, initializer)` for header-lifetime state or delegate lifecycle work to a component. Do not perform business operations while rendering.

The header invokes the selected render function in a stable host boundary, so changing function identity does not itself replace the returned Vue tree. Standard Vue component types, keys and parent paths determine identity. Built-ins cooperate on these to preserve visible editors and focus across switching. An unrelated custom tree can remount children; owner-held filter sessions preserve drafts, while custom implementations must explicitly coordinate any additional local state or focus that needs retention.

Render each supplied slot at most once and keep it reachable (possibly through disclosure). Do not inspect opaque business components. Pass filter presentation context through `context.render`; preserve accessible names and keyboard completion. Adaptations own arrangement/disclosure, not query execution, filter meaning, commit policy or form sessions. Backends fulfill the components used by the composition.

See the [complete customization recipes](../../guides/collection-customization.md) for a working component and conditional integration.

See [UiCollectionHeaderViewContext](UiCollectionHeaderViewContext.md) and [uiCollectionHeaderPresentation](../../strategies/uiCollectionHeaderPresentation.md). Verify custom component mounting, interaction and cleanup, reactive rendering, retained business drafts and identity-based agreement. Browser checks establish actual layout and focus behavior.
