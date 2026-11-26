# Collection header

Use [UiCollectionHeader](../api/components/UiCollectionHeader.md) to group query controls, actions and optional information above a collection. Place UiCollectionView beneath it and UiCollectionFooter after the body; use UiRegionLayout for a bounded collection whose body scrolls. Header and footer do not create another scrolling engine.

This guide explains ownership and design rationale. The [presentation reference](collection-presentation.md) is the consolidated source for available adaptations, defaults, selection conditions and content precedence. [Header authoring](header-adaptations.md) and [complete customization recipes](collection-customization.md) explain implementing another presentation.

## Group by purpose

The five optional slots are search, filters, sort, actions and info. Their names describe concerns, not fixed positions. Explicit filterBindings and sortBinding can generate filter/sort content; a nonempty corresponding slot takes precedence over that generation. A separate ordinary reset button binding supplies the operation that clears the complete query.

Long-row groups search, filters and Reset before external sorting. Collection actions prefer the inline-end of the filter row, where they align to the controls with or without visible field labels. When that arrangement does not fit, they move to the inline-end of the sort row or to a following row and align to its top. Actual group widths and backend gaps determine placement; one gap of extra space is required before moving back to an earlier row to avoid oscillation. Query controls may wrap at constrained widths. Info follows. DOM/Tab order follows the allocated arrangement; retained controls and drafts survive the move. Narrow-expandable keeps search, separate Filter/Sort triggers and Reset first. At most one query panel opens at a time, before the action row; info follows. Missing parts reserve no space. Trigger activity reflects applied criteria independently of whether the panel is open.

An application can omit external filters and sorting when its table supplies equivalent column controls. For cards it can use inline filters or badges on desktop and panels at narrow widths. See the [example application policy](collection-presentation.md#example-application-policy), including the case where the application selects a table on mobile.

## Ownership and information

The business component owns its list control, filter sessions, operations, truthful source capabilities, reset criteria and information. The header adaptation owns arrangement/disclosure; the selected filter/sort collection owns its content; each filter adaptation owns its editor view. Backends fulfill native controls, surfaces, theme spacing and focus mechanics. None of these views interprets arbitrary query objects or sorts/filters a remote page locally.

Use hasColumnFilter/hasColumnSort as observations of available column interactions, not as commands to hide every external editor. The business knows which concerns are equivalent. Cross-column filters or a priority editor can remain outside sortable columns when required.

Info is optional business information, such as “N selected.” Selection may span pages and filters, so that count is not necessarily a fraction of current results. Result range/total normally belongs beside pagination in the footer. Avoid duplicating information or announcements. Selected-item commands belong in actions with clear business context; an automatic batch-action replacement mode is not implemented.

Reset owns clearing search, filters and sorting, cancelling pending edits, availability/loading and one atomic query update. A draft-only reset makes no source request. The header renders the supplied ordinary action with its reset icon and localized scope name; it does not infer empty values or run a native form reset. Orders' unrestricted status criterion is the full supported set, not an empty set.

## Context, alignment and lifetime

The inline header coordinates labelled editor bands without enclosing independent filters in a new form. Search is visually unlabelled by default. Long-row shows its label only outside mobile when filters are present using the default collectionFilterPanel fields presentation; badges, custom filter presentations, sort-only headers and headers without external filters use header-search. Narrow search always receives header-search. Visible search labels follow that context while accessible naming remains. Backends register actual editor surfaces, allowing labels to occupy their natural height and errors to grow below; native floating labels remain intact. Ordinary UiLayout first-baseline alignment does not promise this editor-band measurement.

Default expanded filters receive filter-form/panel context. Alternative filter collections may supply different context, such as a badge Add popover. Context selects presentation; it does not change explicit/live policy or establish a collective Apply operation. See the [context and completion matrix](collection-presentation.md#host-context-and-individual-behavior).

Closing/switching header panels unmounts borrowed views without submitting, discarding drafts or requesting data. Returning from the built-in long-row arrangement starts narrow-expandable collapsed, regardless of a previous open panel; applied-state indicators remain accurate. This resets transient disclosure, not business criteria or drafts. Owners retain sessions outside those views. Built-ins share keyed parent paths for retained controls and coordinate focus when responsive hiding removes an editor. Arbitrary custom trees follow normal Vue remount rules and must implement their own focus handoff. An internal badge or column popup has its own cancellation contract; it must not be confused with closing a header disclosure.

Defaults use the configured responsive environment, not measured container width. Rows still wrap within available space. The backend header is a neutral host; private backend layout primitives support the built-ins, while custom presentations can compose ordinary public components. No business CSS or backend-name selection is required for the supported arrangements.

## Design evidence and limits

- [PatternFly toolbar guidance](https://www.patternfly.org/components/toolbar/design-guidelines/) establishes filter/action grouping and responsive filter disclosure beyond tables.
- [Carbon data table usage](https://carbondesignsystem.com/components/data-table/usage/) groups search/filter/global commands and associates selection commands with selection context. Uninterface does not import Carbon's batch-mode replacement rules.
- [Nuxt UI table](https://ui.nuxt.com/docs/components/table) and [Vuetify table search example](https://github.com/vuetifyjs/vuetify/blob/master/packages/docs/src/examples/v-data-table/prop-search.vue) demonstrate search above data.
- [Element Plus table](https://element-plus.org/en-US/component/table.html) supplies column sort/filter mechanisms, supporting omission of redundant external controls.
- [Bootstrap button toolbar](https://getbootstrap.com/docs/6.0/components/button-group/) supplies grouping primitives, not a complete collection-header specification.
- [Airtable sorting](https://support.airtable.com/docs/sorting-records-in-airtable-views) and [Notion sorting](https://www.notion.com/help/views-filters-and-sorts) support ordered field/direction rules with add/remove/reordering. The reusable sort-list panel follows that general model.

These sources inform Uninterface's composition; they do not prescribe its slot names, one-panel policy, direct movement buttons or exact backend appearance. Badge lists are explicit optional adaptations, not inferred from query objects. Action overflow, automatic overflow menus and automatic statistics remain separate work.

## Observable acceptance

Check table/cards with column controls present and absent, optional slots, no empty allocation, wrapping query controls, external sorting below and Reset before the action gap. Verify mutually exclusive narrow panels, applied-state indications, draft retention and no reads on disclosure or presentation changes. Check explicit/live completion, native field feedback, disabled actions and source-authorized sorting.

DOM tests establish wiring and ownership. Browser review must cover narrow widths, RTL, long labels, editor alignment, focus/caret recovery, keyboard/touch, popup placement and bounded scrolling. Neither documentation coverage nor DOM assertions establish visual acceptance.
