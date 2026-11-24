export type { UiTextSource } from './text/source'
/** Public API: every export is documented under ../docs/api/README.md. */
export { default as UiApp } from './components/UiApp.vue'
export type { UiAppHosting } from './layout/hosting'
export type { UiRegionScrollPolicy } from './layout/scroll-policy'
export { default as UiContent } from './components/UiContent.vue'
export type { UiContentProps } from './layout/content'
export { default as UiCard } from './components/UiCard.vue'
export type { UiHierarchyLevel } from './presentation/hierarchy'
export type { UiCardTreatment, UiCardPresentation } from './presentation/card'
export { uiCardPresentation, uiCardPresentationQuery } from './strategy/card'
export { default as UiNavbar } from './components/UiNavbar.vue'
export { default as UiIcon } from './components/UiIcon.vue'
export { defineUiI18n, useUiI18n } from './i18n/context'
export { useUiColorMode } from './presentation/color-mode'
export { default as UiForm } from './components/UiForm.vue'
export { default as UiField } from './components/UiField.vue'
export { default as UiInputFrameSpacer } from './components/UiInputFrameSpacer.vue'
export { default as UiInputFrame } from './components/UiInputFrame.vue'
export { default as UiTextInput } from './components/UiTextInput.vue'
export { default as UiCheckbox } from './components/UiCheckbox.vue'
export { default as UiSelect } from './components/UiSelect.vue'
export { default as UiButton } from './components/UiButton.vue'
export { default as UiLayout } from './components/UiLayout.vue'
export { default as UiRegionLayout } from './components/UiRegionLayout.vue'
export { default as UiGridLayout } from './components/UiGridLayout.vue'
export type { UiGridLayoutProps } from './layout/grid'
export { default as UiFlowLayout } from './components/UiFlowLayout.vue'
export type { UiFlowLayoutProps } from './layout/flow'
export type {
  UiRegionLayoutProps,
  UiRegionLayoutDivision,
} from './layout/regions'

export { createUiFieldControl } from './controls/field'
export { createUiFormControl } from './controls/form'
export { createUiListControl } from './controls/list'
export { createUiCollectionEditorControl } from './controls/collection-editor'
export type {
  UiCollectionEditorControl,
  UiCollectionEditorOptions,
  UiCollectionEditorRow,
} from './controls/collection-editor'
export { useUiCollectionEditor } from './collection/editor-view'
export type {
  UiCollectionEditorView,
  UiCollectionEditorViewOptions,
} from './collection/editor-view'
export { createUiLocalListSource } from './controls/list-source'
export { createUiTableColumnBinding } from './bindings/table-column'
export type {
  UiListSlotProps,
  UiTableColumnDefinition,
  UiTableColumnBinding,
} from './bindings/table-column'
export type {
  UiListControl,
  UiListOptions,
  UiListPaginationOptions,
  UiListChange,
} from './controls/list'
export type {
  UiListSorting,
  UiListKey,
  UiListQuery,
  UiListResult,
  UiListPaginationResult,
  UiListState,
  UiListBinding,
  UiListItemContext,
  UiPaginatorBinding,
} from './bindings/list'
export {
  UiFormSubmissionError,
  UiFormSubmissionStateError,
} from './controls/submission-error'
export type { UiFieldControl, UiFieldDraftChange } from './controls/field'
export type { UiFormControl } from './controls/form'
export type { UiCodec, UiParseResult } from './controls/codec'
export { createUiNumberCodec, formatUiMoney } from './controls/number-codec'
export type {
  UiNumberCodecOptions,
  UiMoneyFormatOptions,
} from './controls/number-codec'
export type { UiValidationRule } from './controls/validation'

export { getUiRuntime } from './runtime/context'
export type { UiRuntime } from './runtime/context'
export { useUiResponsive } from './environment/context'
export type {
  UiResponsiveContext,
  UiResponsiveProfile,
} from './environment/context'
export type {
  UiLayoutOptions,
  UiLayoutProps,
  UiResolvedLayout,
} from './layout/linear'
export type { UiThemeColor } from './presentation/theme'
export type { UiButtonVariant } from './presentation/button'
export type { UiButtonBinding } from './bindings/button'

export { default as UiMenu } from './components/UiMenu.vue'
export { default as UiNavMenu } from './components/UiNavMenu.vue'
export { createUiEntryControl } from './entries/control'
export type { UiEntryControl } from './entries/control'
export type {
  UiEntry,
  UiEntrySource,
  UiEntryCollection,
  UiEntrySelection,
} from './entries/types'

export type { UiMenuHostBindings } from './entries/menu'

export { default as UiStrategy } from './components/UiStrategy.vue'
export { createUiStrategy, createUiStrategyQuery } from './strategy/definitions'
export {
  uiControlSize,
  uiControlSizeQuery,
  uiLayoutDensity,
  uiLayoutDensityQuery,
  uiHierarchyLevel,
  uiHierarchyLevelQuery,
  uiButtonWidth,
  uiButtonWidthQuery,
  uiButtonVariant,
  uiButtonVariantQuery,
  uiCollectionActionVariant,
  uiCollectionActionVariantQuery,
  uiFieldLabels,
  uiFieldLabelsQuery,
  uiCheckablePresentation,
  uiCheckablePresentationQuery,
  uiRequiredAnnotations,
  uiRequiredAnnotationsQuery,
  uiFieldHelp,
  uiFieldHelpQuery,
  uiValidationFailure,
  uiValidationFailureQuery,
} from './strategy/common'
export type {
  UiStrategyTarget,
  UiStrategyScope,
  UiStrategyIdentity,
  UiStrategyQuery,
  UiStrategyAnswer,
  UiStrategyDeclaration,
  UiStrategyFactory,
  UiStrategyBlock,
  UiStrategyResolution,
  UiControlSize,
  UiLayoutDensity,
} from './strategy/types'

export { default as UiSegmentedSelect } from './components/UiSegmentedSelect.vue'
export { default as UiRadioGroup } from './components/UiRadioGroup.vue'
export { default as UiCheckboxGroup } from './components/UiCheckboxGroup.vue'
export type {
  UiCheckboxValue,
  UiRadioGroupValue,
  UiCheckboxGroupValue,
} from './controls/choices'
export type { UiFieldControlOptions } from './controls/field'

export { useUiFocusPresentation } from './presentation/focus'
export type { UiFocusPresentationBinding } from './presentation/focus'

export {
  uiLayoutFraming,
  uiLayoutFramingQuery,
} from './strategy/layout-framing'
export type { UiLayoutFraming } from './presentation/layout-framing'
export type {
  UiRegionName,
  UiRegionResizeBoundary,
} from './layout/region-boundaries'

export { default as UiModal } from './components/UiModal.vue'
export { createUiModalControl } from './controls/modal'
export type {
  UiModalControl,
  UiModalSession,
  UiModalResult,
  UiModalRunOptions,
  UiModalCancelReason,
  UiModalCloseTrigger,
  UiModalCloseRequest,
} from './controls/modal'

export { default as UiMultiSelect } from './components/UiMultiSelect.vue'
export type { UiMultiSelectValue } from './controls/multiple-selection'

export { default as UiNotice } from './components/UiNotice.vue'
export { default as UiBadge } from './components/UiBadge.vue'
export { default as UiProgressBar } from './components/UiProgressBar.vue'
export type { UiProgressBarProps } from './presentation/progress'
export { default as UiKeyValueList } from './components/UiKeyValueList.vue'
export { default as UiKeyValueItem } from './components/UiKeyValueItem.vue'
export type {
  UiNoticeKind,
  UiNoticeAnnouncement,
  UiNoticeVariant,
} from './presentation/notice'

export { default as UiTabs } from './components/UiTabs.vue'
export { default as UiCollapsible } from './components/UiCollapsible.vue'
export { createUiExpansionControl } from './controls/expansion'
export type {
  UiExpansionMode,
  UiExpansionOptions,
  UiExpansionState,
  UiExpansionControl,
} from './controls/expansion'
export type { UiCollapsibleBinding } from './bindings/collapsible'
export { default as UiTab } from './components/UiTab.vue'
export { default as UiTabPanel } from './components/UiTabPanel.vue'
export { createUiTabsControl } from './controls/tabs'
export type { UiTabsControl, UiTabsOptions, UiTabsState } from './controls/tabs'
export type { UiTabsBinding, UiTabPanelBinding } from './bindings/tabs'

export { default as UiSwitch } from './components/UiSwitch.vue'

export { default as UiLink } from './components/UiLink.vue'
export { default as UiBreadcrumbs } from './components/UiBreadcrumbs.vue'
export { default as UiBreadcrumb } from './components/UiBreadcrumb.vue'
export { createUiNavigationControl } from './navigation/control'
export { createUiNavigationDrawerControl } from './navigation/drawer'
export { useUiResponsiveNavigationSwitch } from './navigation/responsiveSwitch'
export type {
  UiNavigationDrawerControl,
  UiNavigationDrawerOptions,
} from './navigation/drawer'
export type {
  UiLinkBinding,
  UiBreadcrumbsBinding,
  UiBreadcrumbItem,
  UiNavigationLocation,
  UiNavigationOptions,
  UiNavigationControl,
} from './navigation/control'

export { default as UiTooltip } from './components/UiTooltip.vue'
export type {
  UiTooltipTrigger,
  UiTooltipPlacement,
} from './presentation/tooltip'

export { createUiSearchControl } from './search/control'
export type {
  UiSearchResult,
  UiSearchBinding,
  UiTextSuggestionsBinding,
  UiSearchOptions,
  UiSearchControl,
} from './search/control'

export { default as UiSuggestions } from './components/UiSuggestions.vue'

export { uiDefaultInputEquals } from './controls/value'

export {
  createUiFileDescriptorFromFile,
  createUiUploadController,
} from './files/control'
export type {
  UiFileDescriptor,
  UiUploadStatus,
  UiUploadProgressValue,
  UiUploadContext,
  UiUploadTransport,
  UiUploadTaskState,
  UiUploadTask,
  UiUploadController,
} from './files/control'
export { default as UiFileInput } from './components/UiFileInput.vue'
export { default as UiUploadRegion } from './components/UiUploadRegion.vue'
export { default as UiFilePreview } from './components/UiFilePreview.vue'
export { default as UiImagePreview } from './components/UiImagePreview.vue'
export { default as UiFileCollection } from './components/UiFileCollection.vue'

export {
  createUiDateControl,
  createUiTimeControl,
  createUiDateTimeControl,
  createUiDateCodec,
  createUiTimeCodec,
  createUiDateTimeCodec,
} from './temporal/control'
export type {
  UiTemporalKind,
  UiTemporalPrecision,
  UiTemporalRange,
  UiTemporalValue,
  UiTemporalEligibility,
  UiTemporalOptions,
  UiTemporalInputBinding,
  UiTemporalControl,
} from './temporal/control'
export type { UiTemporalPresentation } from './temporal/presentation'
export { default as UiDateInput } from './components/UiDateInput.vue'
export { default as UiTimeInput } from './components/UiTimeInput.vue'
export { default as UiDateTimeInput } from './components/UiDateTimeInput.vue'

export type {
  UiNavigationResult,
  UiNavigationDriver,
  UiNavigationStatus,
  UiNavMenuPresentation,
  UiNavigationCrumb,
  UiNavigationMenuOptions,
  UiNavMenuBinding,
  UiNavigationMenuControl,
} from './navigation/menu'

export { createUiUploadRegionControl } from './files/region'
export { createUiUploadProgressBinding } from './files/progress'
export { default as UiUploadProgress } from './components/UiUploadProgress.vue'
export type {
  UiUploadIssue,
  UiUploadFailureStage,
  UiUploadDeliveryContext,
  UiUploadDestination,
  UiUploadRegionOptions,
  UiUploadRegionPhase,
  UiUploadOutcome,
  UiUploadRegionState,
  UiUploadRegionControl,
  UiUploadAcquisitionGuard,
  UiUploadRegionRole,
  UiUploadRegionAction,
  UiUploadRegionBinding,
  UiUploadProgressBinding,
  UiUploadRegionProps,
  UiUploadProgressProps,
} from './files/region-types'

export { default as UiPreviewRegion } from './components/UiPreviewRegion.vue'

export { default as UiList } from './components/UiList.vue'
export { default as UiTable } from './components/UiTable.vue'
export { default as UiTableColumn } from './components/UiTableColumn.vue'
export { default as UiCollectionHeader } from './components/UiCollectionHeader.vue'
export { default as UiCollectionFooter } from './components/UiCollectionFooter.vue'
export { default as UiPaginator } from './components/UiPaginator.vue'
export { default as UiPaginatorSizeSelect } from './components/UiPaginatorSizeSelect.vue'
export { default as UiPaginatorJumper } from './components/UiPaginatorJumper.vue'

export { createUiListValueControl } from './controls/list-value'
export type {
  UiListValueControl,
  UiListValueEditor,
  UiListValueOptions,
} from './controls/list-value'
export { createUiRecordValueControl } from './controls/record-value'
export type { UiRecordValueControl } from './controls/record-value'

export { default as UiCollectionView } from './components/UiCollectionView.vue'
export { default as UiCollectionField } from './components/UiCollectionField.vue'
export { default as UiCollectionButton } from './components/UiCollectionButton.vue'

export { default as UiLoadingIndicator } from './components/UiLoadingIndicator.vue'
export { default as UiLoadingRegion } from './components/UiLoadingRegion.vue'
export type { UiLoadingSurface } from './loading/surface'

export { default as UiEmpty } from './components/UiEmpty.vue'

export { useUiZOrder, useUiStacking } from './stacking/public'
export { UiZOrderError } from './stacking/model'
export type {
  UiZOrder,
  UiZReference,
  UiZParts,
  UiZPartOrder,
  UiZPartSelector,
  UiZOrderProps,
  UiZLayoutProps,
  UiZHandle,
  UiZBand,
} from './stacking/authoring'
export type {
  ZResolved as UiZResolved,
  ZSnapshot as UiZSnapshot,
} from './stacking/model'

export { default as UiDrawer } from './components/UiDrawer.vue'
export { default as UiPopover } from './components/UiPopover.vue'
export {
  createUiDrawerControl,
  createUiPopoverControl,
} from './controls/overlay'
export type {
  UiOverlayControl,
  UiOverlaySession,
  UiOverlayResult,
  UiOverlayRunOptions,
  UiOverlayCloseRequest,
  UiOverlayCloseTrigger,
  UiOverlayCancelReason,
} from './controls/overlay'
export type { UiDrawerBinding } from './bindings/drawer'
export type {
  UiDrawerEdge,
  UiPopoverPlacement,
  UiPopoverAlign,
} from './presentation/overlay'

export {
  createUiFeedbackTarget,
  createUiFeedbackRoute,
} from './feedback/routing'
export type {
  UiFeedbackAction,
  UiFeedbackMessage,
  UiFeedbackMessageSource,
  UiFeedbackHandle,
  UiNoticeBinding,
  UiFeedbackTarget,
  UiFeedbackRoute,
} from './feedback/routing'

export {
  createUiToastTarget,
  createUiNotificationTarget,
} from './feedback/floating'
export type {
  UiFeedbackPlacement,
  UiFeedbackOverflow,
  UiFeedbackTargetOptions,
  UiFeedbackPhase,
  UiFeedbackCloseReason,
  UiFloatingFeedbackHandle,
  UiFeedbackContentContext,
  UiFeedbackSendOptions,
  UiFloatingFeedbackTarget,
  UiFloatingFeedbackRoute,
} from './feedback/floating-types'

export {
  createUiInputProjection,
  type UiInputProjection,
} from './input-frame/projection'
export {
  defineUiInputFrameContract,
  useUiInputFrameParticipant,
  renderUiInputFrameChildren,
  renderUiInputFrameOutside,
  type UiInputFrameContract,
  type UiInputFrameParticipation,
  type UiInputFrameParticipantOptions,
} from './input-frame/participation'

export { default as UiCollectionFilter } from './components/UiCollectionFilter.vue'
export { createUiCollectionFilter } from './collection/filter'
export { createUiFilterFieldEditor } from './collection/filter-field'
export { createUiListFilterSource } from './collection/filter-list'
export { useUiCollectionFilter } from './collection/filter-context'
export type { UiCollectionFilterViewContext } from './collection/filter-context'
export type {
  UiCollectionFilterDefinition,
  UiCollectionFilterBinding,
  UiCollectionFilterControl,
  UiCollectionFilterSource,
  UiFilterPresentationContext,
  UiFilterSummary,
  UiFilterEditingPolicy,
  UiFilterCommitResult,
  UiFilterEditorContext,
  UiFilterEditorInstance,
} from './collection/filter'
export { createUiChoiceFilterEditor } from './collection/filter-choice'
export type { UiChoiceFilterEditorOptions } from './collection/filter-choice'

export {
  collectionHeaderLongRow,
  collectionHeaderNarrowExpandable,
} from './collection/header-adaptations'
export {
  uiCollectionHeaderPresentation,
  uiCollectionHeaderPresentationQuery,
} from './strategy/collection-header'
export type {
  UiCollectionHeaderPart,
  UiCollectionHeaderContext,
  UiCollectionHeaderViewContext,
  UiCollectionHeaderAdaptation,
  UiCollectionHeaderSelection,
} from './collection/header'

export { createUiSearchFilterControl } from './collection/patterns/search-control'
export { createUiChoiceFilterControl } from './collection/patterns/choice-control'
export { createUiRangeFilterControl } from './collection/patterns/range-control'
export { filterSearchInput } from './collection/patterns/search-view'
export {
  filterChoiceList,
  filterChoiceSelect,
} from './collection/patterns/choice-views'
export {
  filterRangeCompact,
  filterRangeStacked,
} from './collection/patterns/range-views'
export {
  uiSearchFilterPresentation,
  uiSearchFilterPresentationQuery,
  uiChoiceFilterPresentation,
  uiChoiceFilterPresentationQuery,
  uiRangeFilterPresentation,
  uiRangeFilterPresentationQuery,
} from './strategy/filter-presentation'
export type {
  UiFilterRange,
  UiRangeFilterDraft,
  UiSearchFilterEditorBinding,
  UiChoiceFilterEditorBinding,
  UiRangeFilterEditorBinding,
  UiSearchFilterBinding,
  UiChoiceFilterBinding,
  UiRangeFilterBinding,
  UiSearchFilterControl,
  UiChoiceFilterControl,
  UiRangeFilterControl,
  UiSearchFilterDefinition,
  UiChoiceFilterDefinition,
  UiRangeFilterDefinition,
  UiFilterViewContext,
  UiFilterAdaptation,
  UiFilterSelection,
} from './collection/patterns/types'

export { collectionFilterPanel } from './collection/panels/filter-panel'
export { collectionSortSelect } from './collection/panels/sort-select'
export { collectionSortPanel } from './collection/panels/sort-panel'
export { collectionSortBadges } from './collection/panels/sort-badges'
export { collectionFilterBadges } from './collection/panels/filter-badges'
export { createUiCollectionSortBinding } from './collection/sort'
export type { UiCollectionSortBinding } from './collection/sort'
export type {
  UiCollectionPanelAdaptation,
  UiCollectionFilterPanelContext,
  UiCollectionSortPanelContext,
} from './collection/panels'

export { default as UiFloating } from './components/UiFloating.vue'
export { default as UiDrawerLayout } from './components/UiDrawerLayout.vue'
export type {
  UiDrawerMode,
  UiDrawerExtent,
  UiDrawerSizingProps,
} from './layout/drawer'
export type {
  UiCollectionMessages,
  UiCollectionInfinitySlotProps,
  UiCollectionErrorSlotProps,
} from './collection/feedback'
export type { UiCollectionPresentationOptions } from './collection/presentation'

export type { UiCollectionActionVariant } from './collection/action-variant'
export type {
  UiCollectionSummaryScope,
  UiCollectionSummaryStatus,
  UiCollectionSummarySource,
  UiCollectionSummaryContext,
} from './collection/summary'
