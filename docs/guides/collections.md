# Collections: ownership and presentation

A collection combines independent concerns. Start here when building a record browser; use the [presentation selection reference](collection-presentation.md) for the complete adaptation inventory, defaults and conditions, and [customization recipes](collection-customization.md) for application-owned views. In either case, choosing a table toolkit does not assign business query ownership to that toolkit.

| Concern | Owner | Read next |
|---|---|---|
| Sortable source keys and single/multiple-level support | Source capabilities declared and optionally restricted by the business integration | [Sorting capabilities](collection-sorting.md) |
| Requested criteria, source reads, accepted results, paging and selection | Business-owned list control | [List sessions](lists.md) |
| Table/card/list fields, actions and sort/filter opportunities | Business collection composition and collection views | [Collection views](collection-views.md), [column filtering](column-filtering.md) |
| One filter's meaning, activity, summary, clear and query transformation | Business filter definition | [Reusable collection filters](collection-filters.md) |
| A search/choice/range draft and its validation/session | Built-in filter control, created by its business owner | [Built-in filters](filter-patterns.md) |
| Actual filter editor composition and presentation interactions | Backend-independent filter adaptation | [Filter adaptations](filter-adaptations.md) |
| Several filter/sort criteria as editor content or removable badges | Backend-independent collection adaptation | [Panels and collections](collection-panels.md), [badges](collection-badges.md) |
| Arrangement of search, filters, sort, actions and information | Backend-independent header adaptation | [Header adaptations](header-adaptations.md), [header guide](collection-header.md) |
| Numbered pages or cursor accumulation, including infinite tables/cards | Business-owned list control and collection view | [Infinite collection views](collection-views.md#infinite-loading-in-tables-and-cards) |
| Result information, paginator, size and jumper placement | Collection footer | [Collection footer](../api/components/UiCollectionFooter.md) |
| Native controls, theme spacing, overlays and focus mechanics | Selected backend | [Backend reference](../api/backend/README.md) |

## Compose without reconstructing internals

A business component creates its list and filter controls once and disposes them when that business lifetime ends. Its ordinary consumers provide service operations/data, not codecs, field projections or reconstructed search/range forms. Built-in filter controls register a default view. Render each with UiCollectionFilter; its typed binding carries both the editor contract and the registered presentation. No filter-specific host component is needed.

Supply filter views through UiCollectionHeader's slots and table-column slots. Use the controller's hasColumnFilter/hasColumnSort observations to omit known equivalents from the external section. An application may retain a sort priority editor alongside sortable columns. Orders omits external sorting on tables at every width, uses sort badges on desktop cards, and keeps the sort-list panel on narrow cards. These coarse flags do not route every criterion automatically. Cross-column or special filters can remain outside column headers. One binding can have only one active editor, although multiple indicators/summaries may describe it.

Header, whole filter/sort collection, and individual-filter adaptations are three separate selections. A header arranges supplied views and passes presentation context. Each filter chooses an editor suitable for its pattern and host context; a select does not become a checkbox list merely because its parent is called a header. Strategies can override either selection independently without changing the business criterion or commit policy.

## Implemented and deferred

Implemented: search, single/multiple choices and ordered text-codec ranges; actual Vue filter adaptations; actual Vue long-row/narrow-expandable header implementations; column popover/context integration; independent explicit/live/debounced sessions; configurable completion and existing validation feedback through composition; footer placement and paging controls.

[Filter/sort badge presentations](collection-badges.md) support explicit binding enumeration, passive summaries and Add/Remove workflows.

Deferred: grouped filter transactions, temporal-specific range pickers, arbitrary predicate builders and automatic cross-column routing. Boolean Any/Yes/No can be expressed using single choice and business mapping today. Date/time criteria can use custom editors; a generic range accepting a codec does not promise calendar/timezone support.

The Collections demo uses built-in search, choice and range controls with business-owned Orders query transformations. It exercises table/card relocation and header adaptation; it is not a second implementation of those editor mechanisms. Automated DOM checks cover behavior and ownership. Browser checks must additionally cover narrow/RTL layout, focus, tooltips and native picker placement.

See [built-in collection panels](collection-panels.md) for reusable filter/sort panel implementations, independent header coordination and source-backed sorting.
