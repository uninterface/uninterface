import type { UiControlFrameBinding } from './controlFrame'
import type { UiContentProps } from '../layout/content'
import type { UiFocusPresentationBinding } from '../presentation/focus'
import type { UiModalCloseTrigger } from '../controls/modal'
import type { UiResolvedLayout } from '../layout/linear'
import type { UiLayoutDensity } from '../strategy/types'
import type {
  UiThemeColorDefinition,
  UiThemeColor,
} from '../presentation/theme'
import type { UiButtonVariant } from '../presentation/button'
import type { UiHierarchyLevel } from '../presentation/hierarchy'
import type { UiCardTreatment } from '../presentation/card'
import type { UiAppHosting } from '../layout/hosting'
import type { UiRegionScrollPolicy } from '../layout/scroll-policy'

export interface UiAppViewProps {
  hosting: UiAppHosting
}

export interface UiCardViewProps {
  /** The body slot owns its layout and insets; omit only the card body's inset. */
  bodyLayout?: boolean
  loading: boolean
  loadingLabel: string
  /** Resolved intent, before the backend's permitted -2 to -1 adaptation. */
  level: UiHierarchyLevel
  color: UiThemeColor | null
  treatment: Required<UiCardTreatment>
}

export interface UiRegionLayoutViewBinding {
  zItems?: Readonly<Record<string, import('../stacking/runtime').ZBinding>>
  height: number
  regions: readonly ('start' | 'main' | 'end')[]
  group: UiRegionScrollPolicy['groups'][number]
  'aria-label': string
}

/** Render bindings for backend authors; see docs/api/backend/README.md. */
export interface UiBackendDescriptor {
  packageName: string
  version: string
  description: string
  dependencies?: readonly {
    readonly packageName: string
    readonly version: string
  }[]
  name: string
  capabilities: readonly string[]
  themeColors?: Readonly<Record<string, UiThemeColorDefinition>>
}
export interface UiButtonViewProps {
  frame?: UiControlFrameBinding
  form?: string
  type: 'button' | 'submit' | 'reset'
  color?: UiThemeColor
  collectionAction?: { iconOnly: boolean; defaultVariant: UiButtonVariant }
  variant?: UiButtonVariant
  disabled?: boolean
  loading: boolean
  loadingLabel: string
}
export interface UiFieldViewBinding {
  /** Field contains a standalone checkable or an option group. */
  checkable?: boolean
  id: string
  label: string
  help?: string
  issue: string | null
  validating: boolean
  describedBy?: string
  requiredLabel?: string
  group?: boolean
}
export interface UiControlViewBinding {
  id: string
  describedBy?: string
  required?: boolean
  invalid: boolean
  validating: boolean
  disabled: boolean
}
export interface UiTextInputViewProps {
  /** Minimum editor allocation in character cells inside a shared frame; never minlength. */
  minWidthCharacters?: number
  /** Approximate maximum visible character capacity inside a shared frame; never maxlength. */
  maxWidthCharacters?: number
  descriptionBinding?: UiControlViewBinding
  frame?: UiControlFrameBinding
  /** Core owns visibility. Native suffix actions call toggle; shortcut events stay on the input. */
  reveal?: {
    shown: boolean
    label: string
    toggle(): void
    keydown(event: KeyboardEvent): void
  }

  binding: UiControlViewBinding
  value: string
  type: 'text' | 'password' | 'search'
  multiline?: boolean
  readonly?: boolean
  inputmode: 'text' | 'decimal'
  autocomplete: string
}
export interface UiCheckboxViewProps {
  binding: UiControlViewBinding
  value: import('../controls/choices').UiCheckboxValue
}
export interface UiSelectOption {
  hidden?: boolean
  value: string
  label: string
  disabled?: boolean
  group?: string
}
export interface UiSelectViewProps {
  available: boolean
  binding: UiControlViewBinding
  value: string
  options: readonly UiSelectOption[]
  /** Loading message is a manual-presentation fallback; prefer native toolkit loading UI. */
  status: Pick<UiEntryStatusViewBinding, 'pending' | 'message'> & {
    state: 'idle' | 'loading' | 'refreshing' | 'ready' | 'error'
  }
}
export interface UiFormViewBinding {
  id: string
  label: string
  pending: boolean
  height?: 'content' | 'full'
}
export interface UiFocusHandle {
  focus(): Promise<boolean | null>
}
export interface UiFormViewHandle {
  focusInvalid(): void
}

export interface UiLayoutViewBinding extends UiResolvedLayout {
  zResize?: import('../stacking/runtime').ZBinding
  zItems?: Readonly<Record<string, import('../stacking/runtime').ZBinding>>
  /** Peer separation or adjoining allocation boundaries; never a public spacing knob. */
  spacing: 'peers' | 'none'
  /** Agreed peer-spacing intent; omission retains the backend default. */
  density?: UiLayoutDensity
  'aria-label'?: string
  items: readonly string[]
  /** Flow allocation keys that absorb spare space and have no content slot. */
  spacers?: readonly string[]
  /** Decorative lines between existing peer allocation keys. */
  separators?: readonly { first: string; second: string }[]
  /** Named start and end groups retain their logical edges on wrapped rows. */
  startEnd?: boolean
  /** Optional framing of stable allocation keys. Does not change slot content. */
  framing?: {
    separators: boolean
    /** One record per shared boundary; role/emphasis is independent of the raised side. */
    boundaries: readonly {
      first: string
      second: string
      role: 'start' | 'end'
      separator: boolean
      raised?: string
    }[]
    regions: Readonly<
      Record<
        string,
        {
          raised: boolean
          raisedEdges: readonly ('before' | 'after')[]
        }
      >
    >
  }
  resizeBoundaries?: readonly UiLayoutResizeViewBinding[]
  resizeIdentity?: string
  /** Vertical resize geometry reported by the backend, in CSS pixels. */
  measureResize?: (
    available: number,
    minimum: Readonly<Record<string, number>>,
  ) => void
  /** Core-resolved vertical allocations, including a reachable overflow fallback. */
  resizeSizes?: Readonly<Record<string, number>>
  resizeOverflow?: boolean
}

export interface UiLayoutResizeViewBinding {
  key: string
  first: string
  second: string
  label: string
  min: number
  max: number
  value: number
  /** Validated by core; stale callbacks are ignored after allocation changes. */
  resize(value: number): void
}

export interface UiEntryStatusViewBinding {
  pending: boolean
  message: string
  failed: boolean
  retryLabel: string
}
export interface UiEntryViewNode {
  entry: import('../entries/text').ResolvedEntry
  children?: readonly UiEntryViewNode[]
  expanded?: boolean
  selected?: boolean
  selectionMode?: 'single' | 'multiple'
  current?: boolean
  containsCurrent?: boolean
  request?(event?: MouseEvent): void
  status?: UiEntryStatusViewBinding
}
export interface UiMenuViewBinding {
  entries: readonly UiEntryViewNode[]
  status: UiEntryStatusViewBinding
  label: string
  mode: 'inline' | 'popup'
  open: boolean
}
export interface UiNavMenuViewBinding {
  presentation: import('../navigation/menu').UiNavMenuPresentation
  width?: 'full' | 'content'
  boundary?: import('../navigation/boundary').NavigationBoundary
  entries: readonly UiEntryViewNode[]
  status: UiEntryStatusViewBinding
  label: string
}

export type { UiMenuHostBindings } from '../entries/menu'

export { assertUiCapabilities, uiCoreCapabilities } from './capabilities'

export { useUiMenuView, useUiMenuPopup, useUiMenuIconColumn } from './menuView'
export { useUiMenuPoint } from './menuPoint'

export { syncUiTargetAttributes } from './targetAttributes'

export type { UiBackendIntegration } from '../setup/types'
export type { UiBackendColorMode } from '../presentation/color-mode'
export interface UiIconViewProps {
  tone?: UiThemeColor
}

/** Presentation input for shared layout mechanics; exported by backend ./layout. */
export interface UiLayoutPresentation {
  /** Inward focus treatment for a structural scroll host. */
  scrollFocus: UiFocusPresentationBinding
  peerSpacing: {
    /** Peer spacing and local backend row-whitespace accommodations; no control scaling. */
    class?: string
    /** Valid CSS gap expression, optionally referencing native theme variables. */
    gap?: string
  }
  /** Optional compact/spacious fulfillment. Zero always uses peerSpacing. */
  peerSpacingLevels?: Partial<
    Record<Exclude<UiLayoutDensity, 0>, UiLayoutPresentation['peerSpacing']>
  >
}

export { focusUiTarget } from './focus'
export { useUiButtonPresentation } from './buttonPresentation'

export { useUiStrategy, useUiStrategyNode } from '../strategy/context'
export {
  uiControlSizeQuery,
  uiHierarchyLevelQuery,
  uiButtonWidthQuery,
  uiButtonVariantQuery,
  uiCollectionActionVariantQuery,
  uiFieldLabelsQuery,
  uiCheckablePresentationQuery,
  uiRequiredAnnotationsQuery,
  uiFieldHelpQuery,
  uiValidationFailureQuery,
} from '../strategy/common'

export {
  useUiFieldStrategies,
  useUiFieldStrategyContext,
  useUiFieldDescription,
  useUiFieldFailure,
} from './fieldStrategies'

export interface UiChoiceGroupOption {
  key: string
  label: string
  description?: string
  disabled: boolean
  selected: boolean
}
export interface UiChoiceGroupViewProps {
  binding: UiControlViewBinding
  label: string
  orientation: 'vertical' | 'horizontal'
  options: readonly UiChoiceGroupOption[]
  retained: readonly { key: string; label: string }[]
  unavailableLabel: string
  status: UiSelectViewProps['status']
  available: boolean
}
export { useUiChoiceGroupView } from './choiceGroupView'

export type { UiFocusPresentationBinding } from '../presentation/focus'

export { useUiLayoutResizeView } from './layoutResizeView'
export { flowSpacerLayoutStyle, flowSpacerItemStyle } from './layoutFlowSpacer'
export { startEndLayoutItemStyle } from './layoutStartEnd'
export { UiLayoutSeparators } from './layoutSeparators'

export interface UiModalViewProps {
  /** Body owns overflow by default; content delegates normal scrolling to bounded descendants. */
  bodyScroll?: 'body' | 'content'
  width?: 'auto' | 'available'
  preferredWidth?: number | string
  minWidth?: number | string
  maxWidth?: number | string
  title: string
  closeLabel: string
  closeOn: readonly UiModalCloseTrigger[]
  pendingClose: boolean
}
export interface UiModalViewHandle {
  open(): Promise<void>
  close(): Promise<void>
}
export {
  useUiModalView,
  useUiOverlayTarget,
  createUiModalCssMotion,
  settleUiModalMotion,
} from './modalView'

export interface UiMultiSelectViewProps {
  binding: UiControlViewBinding
  value: readonly string[]
  options: readonly UiSelectOption[]
  placeholder?: string
  available: boolean
  clearLabel: string
  clearable: boolean
  status: UiSelectViewProps['status']
}

export interface UiNoticeViewProps {
  /** Default bound content; an authored default slot replaces both. */
  message?: string
  details?: readonly string[]
  kind: import('../presentation/notice').UiNoticeKind
  /** Resolved semantic color; undefined means neutral custom notice. */
  color?: UiThemeColor
  variant?: import('../presentation/notice').UiNoticeVariant
  title?: string
  dismissible: boolean
  dismissLabel: string
  onDismissRequest: () => void
}
export interface UiBadgeViewProps {
  color: UiThemeColor
}
export interface UiKeyValueItemViewProps {
  label: string
}

export interface UiTabViewBinding {
  z?: import('../stacking/runtime').ZBinding
  key: string
  disabled: boolean
  attributes: Readonly<Record<string, unknown>>
  tabId: string
  panelId: string
  selected: boolean
}
export interface UiTabsViewProps {
  items: readonly UiTabViewBinding[]
  label: string
  orientation: 'horizontal' | 'vertical'
}
export interface UiCollapsibleViewProps {
  /** Resolved semantic request; undefined when omitted or unsupported. */
  color?: UiThemeColor
  expanded: boolean
  disabled: boolean
  mounted: boolean
  triggerId: string
  panelId: string
}
export { useUiTabList } from './tabList'

export type { UiModalViewMotion } from './modalView'

export interface UiTabPanelViewProps {
  tabId: string
  panelId: string
  activeTabId: string
  selected: boolean
  mounted: boolean
  height: 'content' | 'full'
}
export { useUiTabPanel } from './tabPanel'
export { useUiNativeTabList } from './tabList'

/** Resolved content hosting; standard attributes target the content/scroll root. */
export interface UiContentViewProps {
  inset: NonNullable<UiContentProps['inset']>
  height: NonNullable<UiContentProps['height']>
  scroll: NonNullable<UiContentProps['scroll']>
  label?: string
}

export interface UiSwitchViewProps {
  binding: UiControlViewBinding
  value: boolean
  readonly?: boolean
}

export interface UiLinkViewProps {
  href?: string
  color?: UiThemeColor
  disabled: boolean
  current: boolean
}
export interface UiBreadcrumbsViewProps {
  status?: UiEntryStatusViewBinding
  retry?(): void
  label: string
  items: readonly {
    key: string
    z?: import('../stacking/runtime').ZBinding
    actionable?: boolean
    current: boolean
    href?: string
    disabled: boolean
    /** Attributes/listeners for the actual link or text, including core activation guards. */
    attributes: Record<string, unknown>
  }[]
}

export interface UiTooltipViewProps {
  id: string
  visible: boolean
  disabled: boolean
  triggers: readonly import('../presentation/tooltip').UiTooltipTrigger[]
  placement: import('../presentation/tooltip').UiTooltipPlacement
  requestVisible(value: boolean): void
}
export {
  useUiTooltipView,
  useUiTooltipPosition,
  useUiTooltipPositionUpdate,
} from './tooltipView'
export {
  useUiTooltipAnchorVisibility,
  useUiTooltipPlacement,
} from './tooltipGeometry'

export interface UiSuggestionsViewProps {
  engagement?(value: boolean): void
  id: string
  results: readonly { key: string; label: string; disabled: boolean }[]
  status: string
  pending?: boolean
  message: string
  label: string
  disabled: boolean
  query(value: string): void
  refresh(): Promise<void>
  accept(key: string): void
}
export { useUiSuggestionsView } from './suggestionsView'

export interface UiFileInputViewProps {
  label: string
  binding: UiControlViewBinding
  file: import('../files/control').UiFileDescriptor<File> | null
  readonly: boolean
  accept?: string
  capture?: 'user' | 'environment'
  pending: boolean
  rejection: string | null
  chooseLabel: string
  clearLabel: string
  select(files: readonly File[]): Promise<void>
  clear(): Promise<void>
}
export interface UiUploadRegionViewProps {
  phase: import('../files/region-types').UiUploadRegionPhase
  binding: UiControlViewBinding
  label: string
  readonly: boolean
  canAcquire: boolean
  busy: boolean
  occupied: boolean
  revision: number
  fileName: string | null
  issue: string | null
  requiredLabel: string | null
  chooseLabel: string
  accept?: string
  capture?: 'user' | 'environment'
  extent: 'compact' | 'regular' | 'large' | 'fill'
  allocatedHeight?: number
  preview: UiFilePreviewViewProps | null
  progress: UiUploadProgressViewProps | null
  actions: readonly {
    name: import('../files/region-types').UiUploadRegionAction
    label: string
    accessibleLabel?: string
    disabled: boolean
    invoke(): Promise<void>
  }[]
  select(files: readonly File[], revision: number): Promise<void>
}
export interface UiUploadProgressViewProps {
  bar: UiProgressBarViewProps
  active: boolean
  fileName: string | null
  issue: string | null
  issueId?: string
  retryLabel: string
  canRetry: boolean
  retryDisabled: boolean
  retry(): Promise<void>
  label: string
  loaded: number
  total: number | null
  cancelLabel: string
  cancelAccessibleLabel: string
  canCancel: boolean
  announcement: 'off' | 'polite'
  cancel(): Promise<void>
}
/** Resolved original units and precise fraction; null value is indeterminate. */
export interface UiProgressBarViewProps {
  value: number | null
  max: number
  fraction: number | null
  label: string
  valueText?: string
  color: UiThemeColor
}
export { useUiUploadRegionView } from './uploadRegionView'
export { useUiUploadProgressView } from './uploadProgressView'
export interface UiPreviewRegionViewProps {
  binding: UiControlViewBinding
  label: string
  extent: 'compact' | 'regular' | 'large'
}
export interface UiImagePreviewViewProps {
  url?: string
  alt: string
  fit?: 'contain' | 'stretch'
  width?: number | string
  height?: number | string
}
export { useUiImagePreviewView } from './imagePreviewView'
export { useUiFilePreviewView } from './filePreviewView'
export interface UiFilePreviewViewProps {
  thumbnail?: boolean
  presentation?: 'tile' | 'row'
  mediaType?: string
  name: string
  size?: number
  url?: string
  image: boolean
  alt: string
}
export interface UiFileCollectionViewProps {
  files: readonly import('../files/control').UiFileDescriptor[]
  removable: boolean
  disabled: boolean
  removeLabel: string
  remove(key: string): void
}

export interface UiTemporalInputViewProps {
  binding: UiControlViewBinding
  label: string
  kind: import('../temporal/control').UiTemporalKind
  value: import('../temporal/control').UiTemporalValue
  options: Readonly<import('../temporal/control').UiTemporalOptions>
  /** Experimental formatting wish; deliberately omitted from public guides. */
  dateFormatWish?: 'YMD' | 'DMY' | 'MDY'
  presentation?: import('../temporal/presentation').UiTemporalPresentation
  readonly: boolean
  startLabel: string
  endLabel: string
  openLabel: string
  clearLabel: string
  display(value: string): string
  candidate(value: string): string
  eligible(value: string): boolean
  update(value: import('../temporal/control').UiTemporalValue): Promise<void>
  blur(): Promise<boolean>
}
export interface UiTemporalEditorViewProps {
  frame?: UiControlFrameBinding
  binding: UiControlViewBinding
  kind: import('../temporal/control').UiTemporalKind
  value: string
  precision: import('../temporal/control').UiTemporalPrecision
  /** Experimental formatting wish; deliberately omitted from public guides. */
  dateFormatWish?: 'YMD' | 'DMY' | 'MDY'
  presentation?: import('../temporal/presentation').UiTemporalPresentation
  readonly: boolean
  label: string
  eligible(value: string): boolean
  update(value: string): void
  blur(): Promise<boolean>
}
export { useUiTemporalEditor } from './temporalEditor'

export interface UiInputFrameViewProps {
  descriptionBinding: UiControlViewBinding
  binding: UiControlViewBinding
  label: string
  readonly: boolean
  dirty: boolean
  focusEditor(): Promise<boolean | null>
}
export { useUiInputFrameSurface } from './inputFrame'

export {
  provideUiControlFrame,
  useUiControlFrameParticipant,
  type UiControlFrameBinding,
  type UiControlFrameOptions,
  type UiControlFrameParticipantOptions,
} from './controlFrame'
export {
  useUiTemporalRange,
  type UiTemporalBoundaryMode,
} from './temporalRange'

export { useUiNavigationPresentation } from './navigationPresentation'

export type {
  UiCollectionRow,
  UiCollectionViewProps,
  UiListViewProps,
  UiCollectionCardsViewProps,
  UiCollectionCardViewProps,
  UiCollectionCardFieldView,
  UiTableViewColumn,
  UiTableViewProps,
  UiPaginatorViewProps,
  UiPaginatorSizeSelectViewProps,
  UiPaginatorJumperViewProps,
} from './collection'

export { useUiCollectionView } from './collectionView'
export { useUiCollectionCardGrid } from './collection-card-grid'

export { useUiTableSizing } from './tableSizing'

export { useUiLoadingRegion, useUiLoadingSurface } from './loading'
export type {
  UiLoadingIndicatorViewProps,
  UiLoadingRegionViewProps,
} from './loading'

export type { UiEmptyViewProps } from './empty'

export { useUiZView } from '../stacking/view'
export { useUiZPart } from '../stacking/view'
export type { ZBinding as UiZViewBinding } from '../stacking/runtime'

export { useUiZPopup } from '../stacking/overlays'

/** Shared resolved inputs; each backend independently renders its drawer/popover surfaces. */
export interface UiOverlayViewProps {
  docked?: boolean
  drawerSizing?: import('./drawer').UiDrawerSizingBinding
  id: string
  title?: string
  name: string
  active: boolean
  mounted: boolean
  panel: boolean
  modal: boolean
  edge: import('../presentation/overlay').UiDrawerEdge
  placement: import('../presentation/overlay').UiPopoverPlacement
  align: import('../presentation/overlay').UiPopoverAlign
  closeOn: readonly import('../controls/overlay').UiOverlayCloseTrigger[]
  closeLabel: string
  pendingClose: boolean
  disabled: boolean
}
export { useUiOverlayHost, useUiOverlayView } from './overlayView'
export { useUiOverlayEscape } from './overlayEscape'

export interface UiFeedbackItemViewProps {
  id: string
  surface: 'toast' | 'notification'
  placement: import('../feedback/floating-types').UiFeedbackPlacement
  /** Authoritative clock snapshot; presentation may sample it without owning expiry. */
  timing: Readonly<{
    duration: number | null
    remaining: number | null
    startedAt: number | null
  }>
  viewportLabel: string
  kind: import('../presentation/notice').UiNoticeKind
  color?: UiThemeColor
  variant?: import('../presentation/notice').UiNoticeVariant
  title?: string
  message?: string
  details?: readonly string[]
  announcement: import('../presentation/notice').UiNoticeAnnouncement
  dismissible: boolean
  closeLabel: string
  open: boolean
  pauseOnHover: boolean
  pauseOnFocus: boolean
  pauseWhenHidden: boolean
  onPresented(): void
  onExited(): void
  onPause(reason: string, paused: boolean): void
  onDismissRequest(): void
}
export { useUiFeedbackView } from './feedbackView'

export {
  useUiCollectionFooterLayout,
  useUiCollectionFooterNavigation,
  useUiCollectionFooterCompact,
} from './collection-footer'

export type { UiCollectionHeaderViewProps } from './collection'

export {
  useUiCollectionHeaderAlignment,
  useUiCollectionHeaderField,
} from './collection-header-alignment'

export {
  useUiCollectionBadgeReorder,
  type UiCollectionBadgeReorder,
} from './collection-badge-reorder'

export interface UiFloatingViewProps {
  edge: import('../presentation/overlay').UiDrawerEdge
  position: number
  draggable: boolean
  active: boolean
  requestPosition(position: number): void
  moveLabel: string
  positionLabel: string
  doneLabel: string
}
export interface UiDrawerLayoutViewProps {
  zItems?: Readonly<Record<string, import('../stacking/runtime').ZBinding>>
  height: 'content' | 'full'
  edge: import('../presentation/overlay').UiDrawerEdge
  active: boolean
  extent: number
  measure(width: number, height: number): void
}
export { useUiDrawerResize } from './drawer'
export type { UiDrawerSizingBinding } from './drawer'
export { useUiDrawerLayoutView } from './drawerLayout'
export { useUiFloatingView } from './floatingView'

export { useUiFormFocus, useUiFallbackFocus } from './formFocus'

export { useUiTableAddRow } from './tableAddRow'
