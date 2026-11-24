# Filter presentation adaptations

The [built-in filters](filter-patterns.md) already include default presentations. Use this guide when customizing those presentations; ordinary consumers only create a control and render its binding through UiCollectionFilter.

A filter adaptation implements an actual Vue view for a typed editor binding. It owns presentation and related interactions; the filter control owns the persistent draft/validation session and the business definition owns query meaning. Control and view are cooperating parts of the same filter. The adaptation does not return a widget schema or a set of layout parameters.

```ts
interface UiFilterAdaptation<E extends { readonly pattern: string }> {
  readonly name: string
  readonly pattern: E['pattern']
  readonly view: (context: UiFilterViewContext<E>) => VNodeChild
}
```

The context exposes binding (the common filter contract), editor (the typed pattern editor), presentation (current host context), submit() and clear(). A view can return ordinary Uninterface compositions or `h(MyFilterView, { context })` for an SFC with its own setup/lifecycle. Use component setup for lifecycle hooks, not the render callback. Render-time work must not commit, clear or query.

See the [selection reference](collection-presentation.md) for the complete defaults/context matrix, and [customization recipes](collection-customization.md) for a full individual-filter implementation and its integration.

## Built-in implementations

| Export | Pattern | Actual composition |
|---|---|---|
| filterSearchInput | search | Search input frame, context-aware label, explicit search action |
| filterChoiceList | choice | Native-backed checkbox/radio group and explicit-policy completion actions |
| filterChoiceSelect | choice | Native-backed multiple/single select and explicit-policy completion actions |
| filterRangeCompact | range | One input frame with bound projections and integrated actions |
| filterRangeStacked | range | Vertical layout of bound input frames, with actions at the final bound |

Shared choice/range surface components coordinate field feedback, labels and completion; they do not interpret a catalog of layout descriptions. Backends render their existing components without per-filter adapters or a filter predicate engine. Tree shaking includes the actual view dependencies of selected exports; it must not pull unrelated list/table engines into a filter-only consumer.

## Select by context or explicit strategy

```ts
import {
  uiChoiceFilterPresentation, filterChoiceList, filterChoiceSelect,
  uiRangeFilterPresentation, filterRangeCompact, filterRangeStacked,
} from '@uninterface/uninterface'

const rangePresentation = uiRangeFilterPresentation(({ presentation }) =>
  presentation.container === 'panel' ? filterRangeStacked : filterRangeCompact,
)
const choices = uiChoiceFilterPresentation(filterChoiceSelect)
// <UiStrategy :use="[rangePresentation, choices]">…</UiStrategy>
```

These are optional. Default choice selection uses the short, ready, flat column-or-badge-popover rule described in the selection reference; ranges default to compact in rows, popups and panels. The selector example above explicitly opts into separate bound frames in panels; this is not the default. Compact ranges still react to host context for labels, validation feedback and completion. Search defaults to filterSearchInput. uiSearchFilterPresentation supports the same constant/selector shape for custom implementations. The three typed families prevent a range view from being selected for a choice binding. The logical target is collection-filter, not the header or a native input.

Selectors receive reactive editor and presentation observations. Several selectors returning the same stable adaptation object agree; different objects conflict even when named alike. Undefined abstains. No answer/conflict restores that pattern's context-sensitive default. Scope/depth/stopAt and family/query blocking follow normal UiStrategy rules. Names are diagnostic, no registration is required, and selector reads do not change criterion semantics. Pattern-incompatible direct custom answers are unsupported; a selector returning an incompatible adaptation is an error.

Forced choice-list presentation deliberately overrides the default's conservative selection heuristic. The author must ensure the option source and native groups suit that choice, including grouped/asynchronous/missing choices. Prefer the picker fallback when unsure; a strategy cannot invent unsupported entry behavior.

## Implement an application presentation

The complete [ApplicationSearch.vue recipe](../examples/collection-adaptations/ApplicationSearch.vue) shows a working typed view, including form submission, current context, labels, disabled state and unmount-safe validation focus. The range sketch below illustrates the same contract boundary; it is not a complete range editor.

```ts
import { h } from 'vue'
import type { UiFilterAdaptation, UiRangeFilterEditorBinding } from '@uninterface/uninterface'
import PriceRangeView from './PriceRangeView.vue'

const priceRange: UiFilterAdaptation<UiRangeFilterEditorBinding<number>> = {
  name: 'price-range',
  pattern: 'range',
  view: context => h(PriceRangeView, { context }),
}
```

PriceRangeView reads context.editor.field and supplies its own component composition. The field still owns both drafts and codec validation. Route Apply/Enter to context.submit() so the host's applied event and column close behavior remain intact. Route Clear to context.clear(); do not mutate the query or independently parse/normalize accepted values. Use canClear, disabled and validating rather than guessing availability from text. Retain accessible labels, errors and native keyboard semantics; explicit fields need an operable completion route. Do not nest forms inside another form.

A view may change what it presents according to context. That does not authorize changing explicit/live policy, treating a disclosure as a group transaction, or discarding drafts on responsive removal. Ordinary Vue identity rules apply when the returned component tree changes: drafts survive through the control, but native focus is not guaranteed across different editor trees. Context is reactive and should be read from current props/getters rather than captured into stale local snapshots.

## Relationship to header adaptations

Header implementations arrange supplied/generated parts. Whole-filter collection adaptations arrange several criteria and can supply their own context. Individual views receive filter-row, header-search, filter-form, table-column, filter-badge or custom context from these hosts. Filter adaptations render each individual criterion. A long-row header can contain a custom filter view; a narrow-expandable header does not force every filter to become a checkbox list. Neither selects a backend by name. See [header adaptations](header-adaptations.md) and [built-in filters](filter-patterns.md).

## Observable checks

Exercise default and forced presentations, different selector functions agreeing on the same object, conflicts restoring defaults, scope barriers, changing context without data reads, custom component lifecycle, explicit and live completion, and disposal. Check backend-native field/selection/tooltip behavior across supporting backends. DOM tests establish contract wiring and draft/query behavior; actual layout, focus, touch and assistive-technology acceptance require browser review.

See [built-in collection panels](collection-panels.md) for reusable filter/sort panel implementations, independent header coordination and source-backed sorting.
