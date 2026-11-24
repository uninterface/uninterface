# Uninterface documentation

Uninterface provides a UI language and usage principles for conventional business interfaces. Read the [project scope](../README.md) for its purpose and responsibility boundaries, then follow the path matching your task.

## Build an application

1. [Getting started](getting-started.md): include core and one backend in a Vue application.
2. [Usage guides](guides/README.md): compose business components and manage their controls and lifetime.
3. [API reference](api/README.md): look up individual components, functions, types and constants.
4. [Testing workflows](guides/testing.md): exercise business behavior independently of backend markup.

The API reference defines usable exports and local limitations. Conceptual contracts identify any unsupported extensions explicitly.

## Find a topic

| Task | Read |
|---|---|
| Align control presentation expectations and backend implementation | [Control presentation principles](guides/design-principles.md) |
| Choose native content elements or Uninterface components | [Native HTML content baseline](guides/native-html.md) |
| Isolate applications and server requests | [Application identity, cleanup and SSR](guides/application-isolation.md) |
| Encapsulate a business editing workflow | [Business components](guides/business-components.md), [confirmed email example](guides/confirmed-email.md) |
| Create or edit a record in a modal | [Form-integrated modals](guides/form-modals.md) |
| Present records as a table or cards | [Collection views](guides/collection-views.md) |
| Coordinate column filters with a separate query section | [Column filtering](guides/column-filtering.md) |
| Group content with visible boundaries | [Cards and hierarchy](guides/cards.md) |
| Apply scoped presentation preferences | [Strategies](guides/strategies.md), [common strategy catalog](strategies/README.md) |
| Style keyboard focus on author-supplied elements | [Reusable focus presentation](guides/focus-presentation.md) |
| Focus static content after navigation without an enclosing outline | [Navigation focus destinations](api/styling-classes/uninterface-navigation-focus-target.md) |
| Rely on conventional input look and feel | [Input-styled controls](guides/controls.md#input-styled-controls) |
| Manage editor availability and focus | [Common control API](guides/controls.md) |
| Connect actions to control state | [Control bindings](guides/control-bindings.md) |
| Validate fields and forms, including remote checks | [Asynchronous validation](guides/validation.md) |
| Edit numbers and monetary amounts | [Numbers and money](guides/number-and-money.md) |
| Understand dynamic stacking and its implementation limits | [Dynamic z-order](guides/dynamic-z-order.md) |
| Arrange content and choose scrolling behavior | [Application layouts](guides/application-layouts.md) |
| Adapt layout through reactive context | [Responsive layouts](guides/responsive-layouts.md) |
| Coordinate a business collection | [List sessions and sources](guides/lists.md) |
| Supply choices, commands and navigation | [Menus and asynchronous choices](guides/menus-and-choices.md) |
| Configure language resources and semantic icons | [Localization and icons](guides/localization-and-icons.md) |
| Register SVG files as catalogue artwork | [SVG icons](guides/localization-and-icons.md#svg-files), [createUiIconLoader](api/functions/createUiIconLoader.md) |
| Use theme roles and light/dark policy | [Theme colors](guides/theme-colors.md), [color mode](guides/color-mode.md) |
| Inspect backend identity, versions and support | [Runtime information](guides/runtime-information.md) |
| Apply an opt-in document styling utility | [Public styling classes](api/styling-classes/README.md) |
| Copy an application example | [Application examples](examples/README.md) |

## Implement or evaluate a backend

Start with the [backend authoring reference](api/backend/README.md), then read the applicable [contracts](contracts/README.md) and their acceptance criteria. [Architecture](architecture/README.md) explains static assembly and package boundaries. The [backend compliance checklist](agents/backend-compliance.md) provides a review procedure.

Each backend owns its installation instructions, toolkit compatibility and presentation limitations. Consult your chosen backend package's documentation alongside the shared integration contract.

## Development procedures

The [agent guide](agents/README.md) and [application development procedure](agents/application-development.md) apply the public contracts to implementation and review. Human developers can use the same procedures.

For controls, feedback, overlays, typography and other detailed topics, use the [guide catalog](guides/README.md#guides).

## Collections and presentation

Start with the [presentation selection reference](guides/collection-presentation.md) for all three layers, defaults and conditions. Use [complete customization recipes](guides/collection-customization.md) to implement application-owned views.

| Concern | Reference |
| --- | --- |
| Business ownership and composition | [Collections](guides/collections.md) |
| Filter definitions and sessions | [Collection filters](guides/collection-filters.md) |
| Search, choice and range controls | [Built-in filters](guides/filter-patterns.md) |
| Individual editor views | [Filter adaptations](guides/filter-adaptations.md) |
| Header purpose and design evidence | [Collection header](guides/collection-header.md) |
| Header implementation | [Header adaptations](guides/header-adaptations.md), [UiCollectionHeader](api/components/UiCollectionHeader.md) |
| Filter/sort collection views | [Panels and collection adaptations](guides/collection-panels.md), [badge interactions](guides/collection-badges.md) |
| Source-supported sorting | [Sorting capabilities](guides/collection-sorting.md) |
| Paging and information placement | [UiCollectionFooter](api/components/UiCollectionFooter.md) |

[Button width strategy](strategies/uiButtonWidth.md) controls whether scoped text actions fill their layout allocations, including stacked mobile actions.

## Documentation ownership

Core documentation defines backend-independent semantics, responsibilities, fallback rules and observable acceptance. Native component mappings, concrete theme values, supported native subsets, integration workarounds and backend-specific limitations belong in the corresponding backend package’s documentation. Cross-backend inventories belong in workspace documentation. External design/specification citations may retain their attribution when supporting a general principle; they do not describe installed-adapter behavior. Consumers should consult the selected backend’s presentation, capability and customization documentation alongside the shared contract.

- [Collection summaries](guides/collection-summaries.md): lazy record access, business-provided data and table/card presentation.

- [Composed drawer navigation](guides/drawer-navigation.md): coordinate a hamburger trigger, modal drawer and vertical menu through a reusable control.

- [Operation progress](guides/progress.md): measured and indeterminate bars and upload integration.


[Collection editor coordination](guides/collection-editors.md) connects editable child values to local views, immediate editing actions and view-local focus recovery.
