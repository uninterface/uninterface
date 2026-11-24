# Collection presentation: layers, selection and conditions

Start here to choose or customize collection presentation. This is the consolidated selection reference. [Collections](collections.md) explains business ownership; the linked guides below describe each implementation and its interactions. All named adaptations are statically imported objects whose `view(context)` returns actual Vue content. They are not standard UiXxxx components, configuration profiles or registered string names.

## Three independent presentation layers

| Layer | Owns | Built-in exports | Selection |
| --- | --- | --- | --- |
| Header | Search/filter/sort/reset/action/info arrangement and disclosure | `collectionHeaderLongRow`, `collectionHeaderNarrowExpandable` | `uiCollectionHeaderPresentation` through UiStrategy |
| Collection of filter/sort criteria | Several filters or sort rules as editor content or badge lists | `collectionFilterPanel`, `collectionFilterBadges`, `collectionSortPanel`, `collectionSortSelect`, `collectionSortBadges` | Reactive `filterPanel` / `sortPanel` props on UiCollectionHeader, or direct `.view(context)` reuse |
| Individual filter editor | One search, choice or range view and its completion affordances | `filterSearchInput`, `filterChoiceList`, `filterChoiceSelect`, `filterRangeCompact`, `filterRangeStacked` | `uiSearchFilterPresentation`, `uiChoiceFilterPresentation`, `uiRangeFilterPresentation` through UiStrategy |

The middle layer uses the public type `UiCollectionPanelAdaptation<Context>`, but may render inline badges and is not restricted to an expandable panel. Header selection does not automatically select a collection presentation or individual editor. A header can host badges; a badge Add popup can host a choice list; each selection has its own context and responsibility.

Business filter controls own meaning, summary, accepted values, drafts, codecs, validation and lifetime. The source-backed sort binding exposes allowed fields, single/multiple mode and ordered rules. Data sources execute filtering and sorting before pagination. Presentation never sorts remote page results locally, fetches all remote records to sort them, or creates another query owner. Backends supply native controls, surfaces, theme dimensions and focus mechanics.

## Library defaults

| Decision | Condition | Result |
| --- | --- | --- |
| Header | Responsive environment is `mobile` | `collectionHeaderNarrowExpandable` |
| Header | Any other environment token | `collectionHeaderLongRow` |
| Filter collection | Default `filterPanel` | `collectionFilterPanel` when a header calls `renderPanel('filters')`; built-in long-row instead renders inline filter views |
| Sort collection | Sort binding with allowed fields, no nonempty sort slot | `collectionSortPanel` |
| Single-sort panel | Default collectionSortPanel with single-mode binding | Delegates to collectionSortSelect: inline field/No sort selection with direction and trash icons |
| Search | No agreed strategy answer | `filterSearchInput` |
| Choice | Column **or badge** popover; 1–6 ready flat ordinary options; every selected key present | `filterChoiceList` (checkboxes for multiple, radios for single) |
| Choice | Other context, empty/large/grouped/unready options, or missing selected keys | `filterChoiceSelect` (UiMultiSelect or UiSelect) |
| Range | No agreed strategy answer, in any context | `filterRangeCompact` |

Six options is a library heuristic, not a web standard. A forced choice-list strategy can override it, but its author must ensure the source and native groups can represent all choices. `filterRangeStacked` is explicitly selectable; narrow screens and vertically stacked panels do not select it automatically. Defaults use the configured responsive environment, not a measurement of the header container. Built-in rows still wrap to fit available width.

Long-row places search, filters and reset in a wrapping sequence, followed by flexible space and actions. External sorting starts a full-width row below all wrapped controls; info follows. Narrow-expandable places search, Filter/Sort toggles and reset first, at most one expanded query panel next, then actions and info. These are different actual render implementations.

## Select, override and condition

Header and individual-filter strategies accept a stable adaptation object or a synchronous selector returning an object or `undefined`. Header selectors observe environment, available `parts`, and active counts. Filter selectors observe the current common binding, typed editor and host `presentation`. Both may read additional reactive business state. Create reusable objects once, not inside selectors.

```ts
import { computed } from 'vue'
import {
  useUiResponsive,
  uiCollectionHeaderPresentation, uiChoiceFilterPresentation,
  collectionHeaderLongRow, collectionHeaderNarrowExpandable,
  collectionSortBadges, collectionSortPanel, filterChoiceSelect,
} from '@uninterface/uninterface'

// In a component's setup:
const { context: environment } = useUiResponsive()
const header = uiCollectionHeaderPresentation(({ environment }) =>
  environment === 'mobile' ? collectionHeaderNarrowExpandable : collectionHeaderLongRow,
)
const choices = uiChoiceFilterPresentation(filterChoiceSelect)
const sorting = computed(() =>
  environment.value === 'mobile' ? collectionSortPanel : collectionSortBadges,
)
// Attach header/choices using <UiStrategy :use="[header, choices]">.
// Pass sorting using <UiCollectionHeader :sort-panel="sorting">.
```

The header selector above restates the library default for illustration; ordinary consumers need not attach it. The sort expression is an application policy, not a library default. `filterPanel` and `sortPanel` currently accept objects, not selector functions. Compute the selected object or bind an ordinary reactive expression. They do not participate in strategy-family agreement, depth or blocking. Header/filter strategy scope and blocking follow [UiStrategy](../api/components/UiStrategy.md).

For strategy selections, `undefined` abstains. Supported answers selecting the same object agree; conflicting objects or no answer restore the default. Identical names do not make different objects equal. There is no universal nearest/local/last-wins rule. A filter selector returning an adaptation for another pattern is invalid. Adaptation names and custom filter usages require no registration; adding a custom view does not mean adding a built-in pattern or a backend.

## Content supply and precedence

| Input | Current behavior |
| --- | --- |
| Nonempty `search`, `actions`, `info` slots | Supplied concerns; the header adaptation decides their placement |
| Nonempty `sort` slot | Overrides generated sort content, so `sortPanel` does not replace that slot |
| `sortBinding` without nonempty sort slot | Generates sort content using `sortPanel`; source capabilities still govern eligibility |
| Nonempty `filters` slot | Supplies filter views; otherwise nonempty `filterBindings` generates UiCollectionFilter views |
| Default `filterPanel` | Long-row renders filter content inline; narrow-expandable calls the stacked panel |
| Alternative `filterPanel` plus `filterBindings` | Both built-in headers use that adaptation; it can enumerate bindings or call the render callback |
| Alternative `filterPanel` without `filterBindings` | Narrow `renderPanel('filters')` uses it; long-row renders the supplied slot directly |

An empty bindings array creates no generated filter part. Filter badges require explicit bindings and use them instead of the render callback; an opaque filters slot is not a discovery mechanism. Do not supply competing editors for the same binding. A custom filter collection calling `context.render(presentation)` receives the supplied/generated filter content once, without recursively selecting itself. A custom header calls either `render` or `renderPanel` once per reachable part, not both. Keep conditionally absent content at the slot/binding boundary; the header cannot inspect a business component's internals.

`activeFilterCount` remains business-supplied, even with enumerated bindings. `activeSortCount` defaults from sortBinding, or zero, and can be overridden. Counts describe applied criteria, not disclosure state. Reset is a separate ordinary button binding; its owner clears the complete query and pending drafts atomically.

## Host context and individual behavior

| Host | Typical filter context | Consequence |
| --- | --- | --- |
| Long-row ordinary filters | `filter-row` / `inline` / `single-row` | Visible field labels; normal field feedback |
| Long-row search | Same as filter row when external query editors exist; otherwise `header-search` / `inline` | Search label shown alongside editors, suppressed when search stands alone |
| Narrow search | `header-search` / `inline` | Placeholder/action presentation; accessible name retained |
| Default expanded filter panel | `filter-form` / `panel` / `stacked` | Filter collection stacks; individual ranges remain combined |
| Table column popup | `table-column` / `popover`, label provided | No redundant heading; eligible short choices use a list; range has Apply tick and tooltip feedback |
| Badge Add editor | `filter-badge` / `popover`, label provided | Eligible short choices use a list; range has an Apply action and tooltip feedback |
| Custom collection/host | Explicit supplied context | Editors use that context or a strategy-selected custom view |

`labelProvided` suppresses redundant visible labels, never accessible names. `summaryProvided` is context for views that use it, not automatic summary rendering. `arrangement` is a preference for content arrangement, not a fixed width or a required widget. `submission` currently supports only `individual`; neither an outer panel nor a form-like layout introduces grouped Apply.

Explicit ranges show Apply for table-column/popover and filter-badge/popover contexts, with Enter as an equivalent route and no commit on focus exit. Other contexts complete through Enter or focus leaving the whole range editor; internal movement between bounds and Clear does not submit. Popover ranges use tooltip errors; inline/panel ranges retain normal feedback. View removal cancels pending completion and preserves drafts. Popup cancellation can separately discard unaccepted drafts according to its host contract. Live choice/search policies remain live; selecting a view does not rewrite their commit policy. See [built-in filters](filter-patterns.md) and [badge interactions](collection-badges.md) for exact completion/dismissal behavior.

## Example application policy

| Situation | Header | External filtering | External sorting |
| --- | --- | --- | --- |
| Table with column capabilities | Long-row or narrow-expandable | Known equivalent filters omitted | Omitted when column sorting is available |
| Desktop cards | Long-row | Search, filter editors and reset share wrapping rows | Multiple: sort badges below; single: field/No sort selector |
| Desktop cards with filter badges | Long-row | Filter badges replace expanded filter fields | Multiple: sort badges below; single: field/No sort selector |
| Mobile | Narrow-expandable | Default filter panel for supplied non-column filters | Cards: multiple sort-list panel or single field/No sort selector behind Sort toggle; Table uses column controls |

In this policy, select cards on mobile and a table elsewhere. If the application selects a table on mobile, keep any available column filters and omit the filter disclosure when it has no remaining controls. Keep search external. Use `hasColumnFilter` and `hasColumnSort` together with the application's knowledge of which criteria are available at each location. Keep external controls for cross-column filters or priority editors when the column controls cannot express the same criteria.

## Customize and verify

Use [complete customization recipes](collection-customization.md) for a custom header, a custom filter-collection layout, a typed search editor and conditional integration. [Header adaptations](header-adaptations.md), [filter adaptations](filter-adaptations.md), [collection panels](collection-panels.md) and [badges](collection-badges.md) cover the detailed contracts.

Check policy selection separately from native rendering. Test missing parts, reactive selection, agreement/conflict, context changes, one editor per binding, preserved source/drafts, no mount/resize reads, disabled and invalid actions, lifecycle cleanup and focus recovery. Native geometry, narrow wrapping, long labels, RTL, keyboard/touch and assistive-technology behavior still need browser acceptance. Existing DOM regressions establish interaction wiring; documentation coverage checks establish export/link coverage, not prose accuracy or visual acceptance.
