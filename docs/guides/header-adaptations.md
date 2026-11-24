# Collection header adaptations

UiCollectionHeader accepts search, filters, sort, actions and info slots. Its adaptation is an actual Vue rendering implementation that arranges those slots and owns presentation interactions. Business authors ordinarily supply the slots; selecting a strategy is optional.

| Built-in | Presentation |
|---|---|
| collectionHeaderLongRow | Search, filters and reset in wrapping rows, flexible space then actions; external sorting on its own full-width row; info last |
| collectionHeaderNarrowExpandable | Search, Filter/Sort toggles and Reset first; one expanded panel next; then actions and optional info |

The default selects narrow-expandable in the mobile responsive environment and long-row otherwise. Table versus cards changes which controls the business supplies, not the header implementation. Existing column capability observations help omit known equivalent editors. A sort priority editor need not be omitted when column sorting exists: reordering levels is an additional interaction.

```ts
const headerPresentation = uiCollectionHeaderPresentation(({ environment }) =>
  environment === 'mobile' ? collectionHeaderNarrowExpandable : collectionHeaderLongRow,
)
```

Attach through UiStrategy. A constant adaptation is also accepted. The selector receives environment, nonempty public parts and activeFilterCount and activeSortCount; it can read reactive application state. Stable object identity determines agreement, not names or selector identities. Undefined abstains; disagreement/no answer restores defaults. Scope/block semantics remain ordinary UiStrategy semantics.

See the [selection reference](collection-presentation.md) for defaults, content precedence and conditional selection across all three layers. The [customization guide](collection-customization.md) supplies complete checked Vue/TypeScript implementations; the sketch below shows only the object boundary.

## Implement a presentation

```ts
import { h } from 'vue'
import type { UiCollectionHeaderAdaptation } from '@uninterface/uninterface'
import MyHeader from './MyHeader.vue'

const myHeader: UiCollectionHeaderAdaptation = {
  name: 'my-header',
  view: context => h(MyHeader, { context }),
}
```

The view can compose UiLayout and other components, use multiple disclosures or appropriate native content, and implement interaction handlers. There is no fixed group schema, adaptation-name union or mandatory registry. Backend-independent means composing shared components/contracts rather than selecting native toolkit names; backends still own native appearance and mechanics.

UiCollectionHeaderViewContext supplies the selection observations, stable id, localized query/filter/sort/reset labels, optional reset button binding, render(part, presentation?), renderPanel('filters' | 'sort') and state(symbol, initializer). render borrows supplied/generated content and passes filter presentation context to descendants; it can also wrap filters with the selected collection adaptation. renderPanel invokes the selected filter collection or custom/generated sort content. Render each concern once, through one of these routes. state retains shared presentation state for the header lifetime and scopes reactive cleanup. An SFC can own activation-specific state and lifecycle normally. Read the current context in callbacks/props; do not retain obsolete render snapshots.

Render all supplied concerns in reachable places. Keep source/keyboard order consistent with visual order. Preserve accessible toggle naming and expanded/controls relations, retain visible focus, and restore focus if a presentation change hides the active editor. The header is not a form/query transaction or a session owner. It must not commit or discard merely because a panel closes or the environment changes.

## Cooperation with filters

Long-row supplies filter-row/inline context to ordinary filters and search alongside external query editors; standalone search receives header-search. Narrow search receives header-search, while its default filter collection supplies filter-form/panel/stacked. An alternative filter collection chooses its own context. A filter independently selects a suitable [filter adaptation](filter-adaptations.md). Context indicates the host's role; it does not declare grouped Apply or replace a filter's explicit/live policy. A stacked panel arranges filters vertically; it does not require each filter to split its internal controls. The default range keeps Min and Max in one frame while adapting completion and feedback to this context.

The built-ins use stable keyed parent paths for retained controls and shared query-surface/focus coordination. Different custom component trees may remount editors under ordinary Vue rules; persistent drafts belong to their filter controls. Native field registration measures editor bands for long-row without a second enclosing form or fixed label height. The narrow implementation owns separate Filter/Sort toggles, mutually exclusive expansion state and a conditional panel; the backend header is a neutral host.

See the [header guide](collection-header.md) for the PatternFly/Carbon/native documentation supporting the grouping principles, the [UiCollectionHeader API](../api/components/UiCollectionHeader.md) for slots, and [UiCollectionHeaderAdaptation](../api/types/UiCollectionHeaderAdaptation.md) for the open view contract. These sources inform a library-owned composition, not a claim that every toolkit defines this five-slot header.

## Acceptance

Verify desktop/mobile defaults, explicit opposing selection, empty/optional slots, table/card capabilities, no requests during disclosure, owner-held drafts, focus/caret through built-in switches, custom component interactions/cleanup, RTL and native styling. Backend DOM regressions do not establish painted alignment or narrow containment.

The built-ins render a supplied reset binding once outside collapsed content. It clears the complete business query, rather than borrowing a native form reset. The owner supplies cancellation of drafts and one atomic query update; the header does not infer criteria. Active Filter and Sort counts independently select native primary/default color and accessible count hints. Open/closed state remains separate.

See [built-in collection panels](collection-panels.md) for reusable filter/sort panel implementations, independent header coordination and source-backed sorting.
