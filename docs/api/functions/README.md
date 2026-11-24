# Functions

Control factories and composables from core, plus focused setup, localization, responsive, routing and backend tooling exports. Each reference specifies its entry point. Theme-authoring operations are grouped under [uiTheme](../constants/uiTheme.md). Backend view helpers have a separate [reference](../backend/README.md).


## Application setup and backend metadata

- [assertUiCapabilities](assertUiCapabilities.md)
- [createUiApplication](createUiApplication.md) — `@uninterface/uninterface/setup` — Create a Vue application with localization, icons and native integration
- [getUiRuntime](getUiRuntime.md) — Inspect core/backend metadata, theme vocabulary and capabilities

## Fields, forms and actions

- [createUiFieldControl](createUiFieldControl.md) — Field editing, parsing and validation
- [createUiFormControl](createUiFormControl.md) — Coordinated form state and submission
- [createUiNumberCodec](createUiNumberCodec.md) — Localized decimal editing for numbers and scaled integers
- [formatUiMoney](formatUiMoney.md) — Read-only currency display from exact minor units
- [uiDefaultInputEquals](uiDefaultInputEquals.md) — editing-value equality.

## Input frames and search

- [createUiInputProjection](createUiInputProjection.md)
- [createUiSearchControl](createUiSearchControl.md) — search and candidate acceptance.
- [defineUiInputFrameContract](defineUiInputFrameContract.md)
- [renderUiInputFrameChildren](renderUiInputFrameChildren.md)
- [renderUiInputFrameOutside](renderUiInputFrameOutside.md)
- [useUiInputFrameParticipant](useUiInputFrameParticipant.md)

## Files and uploads

- [createUiFileDescriptorFromFile](createUiFileDescriptorFromFile.md) — file acquisition and upload.
- [createUiUploadController](createUiUploadController.md) — file acquisition and upload.
- [createUiUploadProgressBinding](createUiUploadProgressBinding.md) — upload workflow and presentation.
- [createUiUploadRegionControl](createUiUploadRegionControl.md) — upload workflow and presentation.

## Dates and times

- [createUiDateCodec](createUiDateCodec.md) — dates, times and intervals.
- [createUiDateControl](createUiDateControl.md) — dates, times and intervals.
- [createUiDateTimeCodec](createUiDateTimeCodec.md) — dates, times and intervals.
- [createUiDateTimeControl](createUiDateTimeControl.md) — dates, times and intervals.
- [createUiTimeCodec](createUiTimeCodec.md) — dates, times and intervals.
- [createUiTimeControl](createUiTimeControl.md) — dates, times and intervals.

## Collections and editable values

- [createUiListControl](createUiListControl.md) — Owned collection queries, selection, pagination and confirmed operations
- [createUiListValueControl](createUiListValueControl.md) — editable collection/record composition.
- [createUiLocalListSource](createUiLocalListSource.md) — Complete local data with one filter/sort/page pass
- [createUiRecordValueControl](createUiRecordValueControl.md) — editable collection/record composition.
- [createUiTableColumnBinding](createUiTableColumnBinding.md) — Optional typed, reusable column meaning for a list session

## Collection filters and presentation

- [createUiChoiceFilterControl](createUiChoiceFilterControl.md)
- [createUiChoiceFilterEditor](createUiChoiceFilterEditor.md)
- [createUiCollectionFilter](createUiCollectionFilter.md)
- [createUiCollectionSortBinding](createUiCollectionSortBinding.md)
- [createUiFilterFieldEditor](createUiFilterFieldEditor.md)
- [createUiListFilterSource](createUiListFilterSource.md)
- [createUiRangeFilterControl](createUiRangeFilterControl.md)
- [createUiSearchFilterControl](createUiSearchFilterControl.md)
- [useUiCollectionFilter](useUiCollectionFilter.md)

## Navigation and entries

- [createUiEntryControl](createUiEntryControl.md) — Asynchronous entry collections and selection
- [createUiNavigationDrawerControl](createUiNavigationDrawerControl.md) — Coordinate navigation outcomes with an owned modal drawer
- [useUiResponsiveNavigationSwitch](useUiResponsiveNavigationSwitch.md) — Switch between inline navigation and a drawer with focus recovery
- [createUiNavigationControl](createUiNavigationControl.md) — navigation destinations and bindings.
- [createVueRouterNavigationDriver](createVueRouterNavigationDriver.md)

## Layout and responsive context

- [createUiResponsive](createUiResponsive.md) — `@uninterface/uninterface/responsive` — Supply an application-owned responsive source
- [defineUiResponsiveProfile](defineUiResponsiveProfile.md) — `@uninterface/uninterface/responsive` — Declare a finite responsive token vocabulary
- [useUiResponsive](useUiResponsive.md) — Read the current responsive context

## Overlays and stacking

- [createUiDrawerControl](createUiDrawerControl.md)
- [createUiModalControl](createUiModalControl.md)
- [createUiPopoverControl](createUiPopoverControl.md)
- [useUiStacking](useUiStacking.md)
- [useUiZOrder](useUiZOrder.md)

## Feedback and panels

- [createUiExpansionControl](createUiExpansionControl.md)
- [createUiFeedbackRoute](createUiFeedbackRoute.md)
- [createUiFeedbackTarget](createUiFeedbackTarget.md)
- [createUiNotificationTarget](createUiNotificationTarget.md)
- [createUiTabsControl](createUiTabsControl.md)
- [createUiToastTarget](createUiToastTarget.md)

## Strategies and presentation

- [createUiStrategyQuery](createUiStrategyQuery.md) — Define a typed presentation query and its agreement
- [createUiStrategy](createUiStrategy.md) — Define a reusable strategy family
- [useUiFocusPresentation](useUiFocusPresentation.md) — backend-owned keyboard-focus presentation for existing elements.

## Localization, themes and icons

- [createUiI18nControl](createUiI18nControl.md) — `@uninterface/uninterface/i18n` — Create a standalone localization control
- [createUiIconLoader](createUiIconLoader.md) — `@uninterface/uninterface/vite` — Compile SVG files for icon catalogues
- [defineUiI18n](defineUiI18n.md) — Define typed namespace hooks and standalone message descriptors
- [useUiColorMode](useUiColorMode.md) — Read effective light/dark mode and its preference control
- [useUiI18n](useUiI18n.md) — Read application localization and request language changes

[All API categories](../README.md)

- [createUiCollectionEditorControl](createUiCollectionEditorControl.md)
- [useUiCollectionEditor](useUiCollectionEditor.md)
