# Types and interfaces

Type-only exports from core and its focused entry points. Each reference specifies its import path and signature. Use `import type`; these are not runtime constructors.


## Application setup and backend metadata

- [UiAppHosting](UiAppHosting.md) — Document or viewport space offer
- [UiApplicationOptions](UiApplicationOptions.md) — Setup options, resource ownership and backend integration
- [UiApplication](UiApplication.md) — Vue application with installed UI services and readiness
- [UiBackendDescriptor](UiBackendDescriptor.md) — Adapter identity, toolkit dependencies and capability declarations
- [UiRuntime](UiRuntime.md) — Read-only metadata and support information for the active assembly

## Fields, forms and actions

- [UiButtonBinding](UiButtonBinding.md) — Producer-independent button role, activity, availability and invocation
- [UiCheckboxGroupValue](UiCheckboxGroupValue.md)
- [UiCheckboxValue](UiCheckboxValue.md)
- [UiCodec](UiCodec.md) — Parsing and formatting operations
- [UiNumberCodecOptions](UiNumberCodecOptions.md) — Locale, precision, scale and numeric bounds
- [UiMoneyFormatOptions](UiMoneyFormatOptions.md) — Currency, formatting locale and scale
- [UiFieldControlOptions](UiFieldControlOptions.md)
- [UiFieldControl](UiFieldControl.md) — One editable value, its draft, baseline and validation
- [UiFieldDraftChange](UiFieldDraftChange.md) — Optional origin and logical-part metadata for internal draft notifications
- [UiFormControl](UiFormControl.md) — Coordinated fields, validation, submission and reset
- [UiMultiSelectValue](UiMultiSelectValue.md)
- [UiParseResult](UiParseResult.md) — Accepted value or parsing issue
- [UiRadioGroupValue](UiRadioGroupValue.md)
- [UiValidationRule](UiValidationRule.md) — Business validation callback

## Input frames and search

- [UiInputFrameContract](UiInputFrameContract.md)
- [UiInputFrameParticipantOptions](UiInputFrameParticipantOptions.md)
- [UiInputFrameParticipation](UiInputFrameParticipation.md)
- [UiInputProjection](UiInputProjection.md)
- [UiSearchBinding](UiSearchBinding.md) — search and candidate acceptance.
- [UiSearchControl](UiSearchControl.md) — search and candidate acceptance.
- [UiSearchOptions](UiSearchOptions.md) — search and candidate acceptance.
- [UiSearchResult](UiSearchResult.md) — search and candidate acceptance.
- [UiTextSuggestionsBinding](UiTextSuggestionsBinding.md) — search and candidate acceptance.

## Files and uploads

- [UiFileDescriptor](UiFileDescriptor.md) — file acquisition and upload.
- [UiUploadAcquisitionGuard](UiUploadAcquisitionGuard.md) — View admission guard: capture revision before opening a chooser and supply a live available getter for local restrictions.
- [UiUploadContext](UiUploadContext.md) — file acquisition and upload.
- [UiUploadController](UiUploadController.md) — file acquisition and upload.
- [UiUploadDeliveryContext](UiUploadDeliveryContext.md) — A stable delivery ID for one accepted acquisition.
- [UiUploadDestination](UiUploadDestination.md) — Exactly one business destination: a retained descriptor field, or a synchronous service receiver returning undefined.
- [UiUploadFailureStage](UiUploadFailureStage.md) — Distinguishes candidate validation, byte transfer and delivery of a successful result..
- [UiUploadIssue](UiUploadIssue.md) — Localized workflow feedback: a literal string or a message descriptor.
- [UiUploadOutcome](UiUploadOutcome.md) — Awaitable acquisition/recovery result.
- [UiUploadProgressBinding](UiUploadProgressBinding.md) — Producer-independent progress target.
- [UiUploadProgressProps](UiUploadProgressProps.md) — Standalone progress inputs.
- [UiUploadProgressValue](UiUploadProgressValue.md) — file acquisition and upload.
- [UiUploadRegionAction](UiUploadRegionAction.md) — Semantic operation names for internal participation.
- [UiUploadRegionBinding](UiUploadRegionBinding.md) — Producer-independent region target.
- [UiUploadRegionControl](UiUploadRegionControl.md) — Factory-created workflow coordinator.
- [UiUploadRegionOptions](UiUploadRegionOptions.md) — Candidate validation, optional retry, live business restrictions and safe error mapping.
- [UiUploadRegionPhase](UiUploadRegionPhase.md) — Workflow phase, separate from transfer status.
- [UiUploadRegionProps](UiUploadRegionProps.md) — Region inputs.
- [UiUploadRegionRole](UiUploadRegionRole.md) — Derived destination role: retained for a field, service for a receiver.
- [UiUploadRegionState](UiUploadRegionState.md) — Read-only reactive workflow observations.
- [UiUploadStatus](UiUploadStatus.md) — file acquisition and upload.
- [UiUploadTaskState](UiUploadTaskState.md) — file acquisition and upload.
- [UiUploadTask](UiUploadTask.md) — file acquisition and upload.
- [UiUploadTransport](UiUploadTransport.md) — file acquisition and upload.

## Dates and times

- [UiTemporalControl](UiTemporalControl.md) — dates, times and intervals.
- [UiTemporalEligibility](UiTemporalEligibility.md) — dates, times and intervals.
- [UiTemporalInputBinding](UiTemporalInputBinding.md) — dates, times and intervals.
- [UiTemporalKind](UiTemporalKind.md) — dates, times and intervals.
- [UiTemporalOptions](UiTemporalOptions.md) — dates, times and intervals.
- [UiTemporalPrecision](UiTemporalPrecision.md) — dates, times and intervals.
- [UiTemporalPresentation](UiTemporalPresentation.md) — dates, times and intervals.
- [UiTemporalRange](UiTemporalRange.md) — dates, times and intervals.
- [UiTemporalValue](UiTemporalValue.md) — dates, times and intervals.

## Collections and editable values

- [UiCollectionMessages](UiCollectionMessages.md) — Per-view continuation wording
- [UiCollectionInfinitySlotProps](UiCollectionInfinitySlotProps.md) — Infinite loading/completion content context
- [UiCollectionErrorSlotProps](UiCollectionErrorSlotProps.md) — Failed-read placement and recovery context

- [UiCollectionPanelAdaptation](UiCollectionPanelAdaptation.md)
- [UiEntryCollection](UiEntryCollection.md) — Observable source state and results
- [UiListBinding](UiListBinding.md) — Shared producer-independent collection target
- [UiListChange](UiListChange.md) — Confirmed mutation with explicit reconciliation knowledge
- [UiListControl](UiListControl.md) — Owned collection session and operations
- [UiListItemContext](UiListItemContext.md) — Keyed observations and guarded action bindings
- [UiListKey](UiListKey.md) — Stable string or numeric identity
- [UiListOptions](UiListOptions.md) — Business source, query, identity and operation configuration
- [UiListPaginationOptions](UiListPaginationOptions.md) — Numbered/cursor mode and allowed sizes
- [UiListPaginationResult](UiListPaginationResult.md) — Authoritative source navigation metadata
- [UiListQuery](UiListQuery.md) — Immutable filters, ordered sort and requested position
- [UiListResult](UiListResult.md) — Accepted source membership and completeness
- [UiListSlotProps](UiListSlotProps.md) — Shared typed item/context content payload
- [UiListSorting](UiListSorting.md)
- [UiListState](UiListState.md) — Requested versus accepted data, activity and selection
- [UiListValueControl](UiListValueControl.md) — editable collection/record composition.
- [UiListValueEditor](UiListValueEditor.md) — editable collection/record composition.
- [UiListValueOptions](UiListValueOptions.md) — editable collection/record composition.
- [UiPaginatorBinding](UiPaginatorBinding.md) — Borrowed session navigation and accepted counts
- [UiRecordValueControl](UiRecordValueControl.md) — editable collection/record composition.
- [UiTableColumnBinding](UiTableColumnBinding.md) — Optional typed reusable column definition
- [UiTableColumnDefinition](UiTableColumnDefinition.md) — Column identity, label and query associations

## Collection filters and presentation

- [UiChoiceFilterBinding](UiChoiceFilterBinding.md)
- [UiChoiceFilterControl](UiChoiceFilterControl.md)
- [UiChoiceFilterDefinition](UiChoiceFilterDefinition.md)
- [UiChoiceFilterEditorBinding](UiChoiceFilterEditorBinding.md)
- [UiChoiceFilterEditorOptions](UiChoiceFilterEditorOptions.md)
- [UiCollectionFilterBinding](UiCollectionFilterBinding.md)
- [UiCollectionFilterControl](UiCollectionFilterControl.md)
- [UiCollectionFilterDefinition](UiCollectionFilterDefinition.md)
- [UiCollectionFilterPanelContext](UiCollectionFilterPanelContext.md)
- [UiCollectionFilterSource](UiCollectionFilterSource.md)
- [UiCollectionFilterViewContext](UiCollectionFilterViewContext.md)
- [UiCollectionHeaderAdaptation](UiCollectionHeaderAdaptation.md)
- [UiCollectionHeaderContext](UiCollectionHeaderContext.md)
- [UiCollectionHeaderPart](UiCollectionHeaderPart.md)
- [UiCollectionHeaderSelection](UiCollectionHeaderSelection.md)
- [UiCollectionHeaderViewContext](UiCollectionHeaderViewContext.md)
- [UiCollectionSortBinding](UiCollectionSortBinding.md)
- [UiCollectionSortPanelContext](UiCollectionSortPanelContext.md)
- [UiFilterAdaptation](UiFilterAdaptation.md)
- [UiFilterCommitResult](UiFilterCommitResult.md)
- [UiFilterEditingPolicy](UiFilterEditingPolicy.md)
- [UiFilterEditorContext](UiFilterEditorContext.md)
- [UiFilterEditorInstance](UiFilterEditorInstance.md)
- [UiFilterPresentationContext](UiFilterPresentationContext.md)
- [UiFilterRange](UiFilterRange.md)
- [UiFilterSelection](UiFilterSelection.md)
- [UiFilterSummary](UiFilterSummary.md)
- [UiFilterViewContext](UiFilterViewContext.md)
- [UiRangeFilterBinding](UiRangeFilterBinding.md)
- [UiRangeFilterControl](UiRangeFilterControl.md)
- [UiRangeFilterDefinition](UiRangeFilterDefinition.md)
- [UiRangeFilterDraft](UiRangeFilterDraft.md)
- [UiRangeFilterEditorBinding](UiRangeFilterEditorBinding.md)
- [UiSearchFilterBinding](UiSearchFilterBinding.md)
- [UiSearchFilterControl](UiSearchFilterControl.md)
- [UiSearchFilterDefinition](UiSearchFilterDefinition.md)
- [UiSearchFilterEditorBinding](UiSearchFilterEditorBinding.md)

## Navigation and entries

- [UiBreadcrumbItem](UiBreadcrumbItem.md) — navigation destinations and bindings.
- [UiBreadcrumbsBinding](UiBreadcrumbsBinding.md) — navigation destinations and bindings.
- [UiEntryControl](UiEntryControl.md) — Entry loading, branch caches and selection operations
- [UiEntrySelection](UiEntrySelection.md) — Independent single/multiple selection scope configuration
- [UiEntrySource](UiEntrySource.md) — Supplied or asynchronously loaded entries
- [UiEntry](UiEntry.md) — Shared item, submenu, group and separator definitions
- [UiLinkBinding](UiLinkBinding.md) — navigation destinations and bindings.
- [UiMenuHostBindings](UiMenuHostBindings.md) — Event and accessibility bindings for popup hosts
- [UiNavMenuBinding](UiNavMenuBinding.md)
- [UiNavMenuPresentation](UiNavMenuPresentation.md)
- [UiNavigationControl](UiNavigationControl.md) — navigation destinations and bindings.
- [UiNavigationCrumb](UiNavigationCrumb.md)
- [UiNavigationDriver](UiNavigationDriver.md)
- [UiNavigationLocation](UiNavigationLocation.md) — navigation destinations and bindings.
- [UiNavigationMenuControl](UiNavigationMenuControl.md)
- [UiNavigationMenuOptions](UiNavigationMenuOptions.md)
- [UiNavigationOptions](UiNavigationOptions.md) — navigation destinations and bindings.
- [UiNavigationResult](UiNavigationResult.md)
- [UiNavigationStatus](UiNavigationStatus.md)
- [VueRouterNavigationOptions](VueRouterNavigationOptions.md)

- [UiNavigationDrawerControl](UiNavigationDrawerControl.md) — Owned drawer and borrowed navigation coordination
- [UiNavigationDrawerOptions](UiNavigationDrawerOptions.md) — Post-exit destination focus handoff

## Layout and responsive context

- [UiContentProps](UiContentProps.md) — Ordinary content hosting, bounded scrolling and accessible naming
- [UiFlowLayoutProps](UiFlowLayoutProps.md) — Content-sized flow, wrapping and alignment
- [UiGridLayoutProps](UiGridLayoutProps.md) — Equal-width shared columns and scrolling
- [UiLayoutDensity](UiLayoutDensity.md)
- [UiLayoutFraming](UiLayoutFraming.md)
- [UiLayoutOptions](UiLayoutOptions.md) — Linear arrangement options
- [UiLayoutProps](UiLayoutProps.md) — Linear options and accessible naming
- [UiRegionLayoutDivision](UiRegionLayoutDivision.md) — Allocation shares indexed by region
- [UiRegionLayoutProps](UiRegionLayoutProps.md) — Start/main/end arrangement properties
- [UiRegionName](UiRegionName.md)
- [UiRegionResizeBoundary](UiRegionResizeBoundary.md)
- [UiRegionScrollPolicy](UiRegionScrollPolicy.md) — Grouped region scrolling
- [UiResolvedLayout](UiResolvedLayout.md) — Normalized options consumed by a layout view
- [UiResponsiveContext](UiResponsiveContext.md) — Token from the responsive vocabulary
- [UiResponsiveProfile](UiResponsiveProfile.md) — Declared vocabulary for typed responsive consumption

## Overlays and stacking

- [UiDrawerBinding](UiDrawerBinding.md)
- [UiDrawerEdge](UiDrawerEdge.md)
- [UiDrawerExtent](UiDrawerExtent.md)
- [UiDrawerMode](UiDrawerMode.md)
- [UiDrawerSizingProps](UiDrawerSizingProps.md)
- [UiFloatingFeedbackHandle](UiFloatingFeedbackHandle.md)
- [UiFloatingFeedbackRoute](UiFloatingFeedbackRoute.md)
- [UiFloatingFeedbackTarget](UiFloatingFeedbackTarget.md)
- [UiModalCancelReason](UiModalCancelReason.md)
- [UiModalCloseRequest](UiModalCloseRequest.md)
- [UiModalCloseTrigger](UiModalCloseTrigger.md)
- [UiModalControl](UiModalControl.md)
- [UiModalResult](UiModalResult.md)
- [UiModalRunOptions](UiModalRunOptions.md)
- [UiModalSession](UiModalSession.md)
- [UiOverlayCancelReason](UiOverlayCancelReason.md)
- [UiOverlayCloseRequest](UiOverlayCloseRequest.md)
- [UiOverlayCloseTrigger](UiOverlayCloseTrigger.md)
- [UiOverlayControl](UiOverlayControl.md)
- [UiOverlayResult](UiOverlayResult.md)
- [UiOverlayRunOptions](UiOverlayRunOptions.md)
- [UiOverlaySession](UiOverlaySession.md)
- [UiPopoverAlign](UiPopoverAlign.md)
- [UiPopoverPlacement](UiPopoverPlacement.md)
- [UiTooltipPlacement](UiTooltipPlacement.md) — supplemental descriptions.
- [UiTooltipTrigger](UiTooltipTrigger.md) — supplemental descriptions.
- [UiZBand](UiZBand.md)
- [UiZHandle](UiZHandle.md)
- [UiZLayoutProps](UiZLayoutProps.md)
- [UiZOrderProps](UiZOrderProps.md)
- [UiZOrder](UiZOrder.md)
- [UiZPartOrder](UiZPartOrder.md)
- [UiZPartSelector](UiZPartSelector.md)
- [UiZParts](UiZParts.md)
- [UiZReference](UiZReference.md)
- [UiZResolved](UiZResolved.md)
- [UiZSnapshot](UiZSnapshot.md)

## Feedback and panels

- [UiCollapsibleBinding](UiCollapsibleBinding.md)
- [UiExpansionControl](UiExpansionControl.md)
- [UiExpansionMode](UiExpansionMode.md)
- [UiExpansionOptions](UiExpansionOptions.md)
- [UiExpansionState](UiExpansionState.md)
- [UiFeedbackAction](UiFeedbackAction.md)
- [UiFeedbackCloseReason](UiFeedbackCloseReason.md)
- [UiFeedbackContentContext](UiFeedbackContentContext.md)
- [UiFeedbackHandle](UiFeedbackHandle.md)
- [UiFeedbackMessageSource](UiFeedbackMessageSource.md)
- [UiFeedbackMessage](UiFeedbackMessage.md)
- [UiFeedbackOverflow](UiFeedbackOverflow.md)
- [UiFeedbackPhase](UiFeedbackPhase.md)
- [UiFeedbackPlacement](UiFeedbackPlacement.md)
- [UiFeedbackRoute](UiFeedbackRoute.md)
- [UiFeedbackSendOptions](UiFeedbackSendOptions.md)
- [UiFeedbackTargetOptions](UiFeedbackTargetOptions.md)
- [UiFeedbackTarget](UiFeedbackTarget.md)
- [UiLoadingSurface](UiLoadingSurface.md)
- [UiNoticeAnnouncement](UiNoticeAnnouncement.md)
- [UiNoticeBinding](UiNoticeBinding.md)
- [UiNoticeKind](UiNoticeKind.md)
- [UiNoticeVariant](UiNoticeVariant.md)
- [UiTabPanelBinding](UiTabPanelBinding.md)
- [UiTabsBinding](UiTabsBinding.md)
- [UiTabsControl](UiTabsControl.md)
- [UiTabsOptions](UiTabsOptions.md)
- [UiTabsState](UiTabsState.md)

## Strategies and presentation

- [UiButtonVariant](UiButtonVariant.md) — Filled, outline, neutral, soft, text and icon treatments
- [UiCardPresentation](UiCardPresentation.md)
- [UiCardTreatment](UiCardTreatment.md)
- [UiControlSize](UiControlSize.md) — Five ordinal levels centered on zero
- [UiFocusPresentationBinding](UiFocusPresentationBinding.md) — readonly presentation-only element binding.
- [UiHierarchyLevel](UiHierarchyLevel.md) — Five hierarchy levels, negative above ordinary and positive subordinate
- [UiStrategyAnswer](UiStrategyAnswer.md) — Typed-query contribution stored by a declaration
- [UiStrategyBlock](UiStrategyBlock.md) — Family or query propagation barrier
- [UiStrategyDeclaration](UiStrategyDeclaration.md) — Captured policy answers and scope
- [UiStrategyFactory](UiStrategyFactory.md) — Callable family creating scoped declarations
- [UiStrategyIdentity](UiStrategyIdentity.md) — Unique family identity for blocking
- [UiStrategyQuery](UiStrategyQuery.md) — Typed presentation concern and agreement
- [UiStrategyResolution](UiStrategyResolution.md) — Answered value or diagnostic no-answer result
- [UiStrategyScope](UiStrategyScope.md) — Per-declaration role, depth and stop limits
- [UiStrategyTarget](UiStrategyTarget.md) — Built-in or custom logical role name

## Localization, themes and icons

- [UiColorModeControl](UiColorModeControl.md) — Mode observations and preference operations
- [UiColorModeOptions](UiColorModeOptions.md) — Document ownership, host inheritance and persistence options
- [UiColorModePreference](UiColorModePreference.md) — Light, dark or system preference
- [UiColorMode](UiColorMode.md) — Effective light or dark mode
- [UiDefaultThemeColor](UiDefaultThemeColor.md) — Required six-role baseline
- [UiI18nControl](UiI18nControl.md) — Application language, resources and formatting operations
- [UiI18nDefinition](UiI18nDefinition.md) — reusable namespace hooks and standalone descriptor creation.
- [UiI18nOptions](UiI18nOptions.md) — Initial locale, fallback and resource configuration
- [UiI18nTranslator](UiI18nTranslator.md) — namespace-bound immediate/lazy translation and message descriptors.
- [UiIconCatalogue](UiIconCatalogue.md) — Semantic names mapped to icon definitions
- [UiIconDefinition](UiIconDefinition.md) — Artwork, optional tone variants and directional mirroring
- [UiIconName](UiIconName.md) — Semantic icon identity
- [UiLocaleSource](UiLocaleSource.md) — Resource packs, lazy loading and locale aliases
- [UiMessageContext](UiMessageContext.md) — Message parameters and Intl-backed helpers
- [UiMessageDescriptor](UiMessageDescriptor.md) — Translatable namespace/key/parameter identity
- [UiMessagePack](UiMessagePack.md) — Named collection of messages
- [UiMessage](UiMessage.md) — Literal message or synchronous message function
- [UiMessages](UiMessages.md) — Built-in control message catalogue
- [UiTextSource](UiTextSource.md) — static or synchronously supplied text for reusable definitions.
- [UiThemeColorDefinition](UiThemeColorDefinition.md) — Semantic definition of an extension
- [UiThemeColorExtensions](UiThemeColorExtensions.md) — TypeScript extension vocabulary
- [UiThemeColor](UiThemeColor.md) — Shared semantic color role, including declared extensions

[All API categories](../README.md)

- [UiCollectionPresentationOptions](UiCollectionPresentationOptions.md) — Card-grid minimum/maximum preferences and omission semantics

- [UiCollectionSummaryScope](UiCollectionSummaryScope.md)

- [UiCollectionSummaryStatus](UiCollectionSummaryStatus.md)

- [UiCollectionSummarySource](UiCollectionSummarySource.md)

- [UiCollectionSummaryContext](UiCollectionSummaryContext.md)

- [UiCollectionActionVariant](UiCollectionActionVariant.md)

- [UiProgressBarProps](UiProgressBarProps.md) — precise range, unknown mode and accessible task naming.

- [UiCollectionEditorOptions](UiCollectionEditorOptions.md)
- [UiCollectionEditorControl](UiCollectionEditorControl.md)
- [UiCollectionEditorRow](UiCollectionEditorRow.md)
- [UiCollectionEditorView](UiCollectionEditorView.md)
- [UiCollectionEditorViewOptions](UiCollectionEditorViewOptions.md)
