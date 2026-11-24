import type { UiButtonBinding } from '../bindings/button'
import type { UiFieldControl } from '../controls/field'
import type { UiMessageDescriptor } from '../i18n/types'
import type {
  UiFileDescriptor,
  UiUploadController,
  UiUploadProgressValue,
  UiUploadStatus,
  UiUploadTask,
} from './control'
export type UiUploadIssue = string | UiMessageDescriptor
export type UiUploadFailureStage = 'validation' | 'upload' | 'delivery'

export interface UiUploadDeliveryContext {
  // Stable across delivery retries for one successful acquisition.
  readonly deliveryId: string
}

export type UiUploadDestination<H, M = unknown> =
  | {
      field: UiFieldControl<UiFileDescriptor<H, M> | null>
      receive?: never
    }
  | {
      field?: never
      receive: (
        file: UiFileDescriptor<H, M>,
        context: UiUploadDeliveryContext,
      ) => undefined
    }

export interface UiUploadRegionOptions {
  validateFile?: (
    file: UiFileDescriptor<File>,
    context: { readonly signal: AbortSignal },
  ) => UiUploadIssue | null | Promise<UiUploadIssue | null>
  retry?: boolean
  // Optional reactive getters; omitted means false, false and true.
  disabled?: () => boolean
  readonly?: () => boolean
  canCancel?: () => boolean
  // Omission uses safe localized fallback messages, never String(error).
  describeError?: (error: unknown, stage: UiUploadFailureStage) => UiUploadIssue
}

export type UiUploadRegionPhase =
  | 'ready'
  | 'validating'
  | 'uploading'
  | 'delivering'
  | 'occupied'
  | 'delivery-failed'
  | 'disposed'

export type UiUploadOutcome<H, M = unknown> =
  | { status: 'completed'; file: UiFileDescriptor<H, M> }
  | { status: 'rejected'; issue: UiUploadIssue }
  | { status: 'failed'; stage: UiUploadFailureStage; issue: UiUploadIssue }
  | { status: 'blocked' | 'cancelled' | 'superseded' }

export interface UiUploadRegionState<H, M = unknown> {
  readonly phase: UiUploadRegionPhase
  readonly file: UiFileDescriptor<H, M> | null
  readonly candidate: UiFileDescriptor<File> | null
  // Observe without exposing task.retry() as a workflow bypass.
  readonly task: Pick<UiUploadTask<H, M>, 'state' | 'result'> | null
  readonly pendingResult: UiFileDescriptor<H, M> | null
  readonly issue: UiUploadIssue | null
  readonly failureStage: UiUploadFailureStage | null
  readonly busy: boolean
  readonly canAcquire: boolean
  readonly canCancel: boolean
  readonly canRetry: boolean
  readonly canRetryDelivery: boolean
  readonly canRemove: boolean
}

export interface UiUploadRegionControl<H, M = unknown> {
  readonly state: UiUploadRegionState<H, M>
  readonly bindings: {
    readonly region: UiUploadRegionBinding
    readonly progress: UiUploadProgressBinding
    readonly cancelButton: UiButtonBinding
    readonly retryButton: UiButtonBinding
    readonly retryDeliveryButton: UiButtonBinding
    readonly removeButton: UiButtonBinding
  }
  acquire(files: readonly File[]): Promise<UiUploadOutcome<H, M>>
  retry(): Promise<UiUploadOutcome<H, M>>
  retryDelivery(): Promise<UiUploadOutcome<H, M>>
  cancel(): boolean
  remove(): Promise<boolean>
  // Explicit recovery decision; never deletes the uploaded resource.
  releaseResult(): boolean
  dispose(): void
}

export interface UiUploadAcquisitionGuard {
  readonly revision: number
  // Live local restrictions; checked again after async validation.
  readonly available: () => boolean
}

export type UiUploadRegionRole = 'retained' | 'service'
export type UiUploadRegionAction =
  | 'cancel'
  | 'retry'
  | 'retryDelivery'
  | 'remove'

export interface UiUploadRegionBinding {
  readonly target: 'upload-region'
  readonly phase: UiUploadRegionPhase
  // Derived from destination ownership, not another author-selected mode.
  readonly role: UiUploadRegionRole
  readonly file: UiFileDescriptor | null
  // Non-null when this workflow supports upload, including before a task starts.
  readonly progress: UiUploadProgressBinding | null
  readonly actions: Readonly<
    Partial<Record<UiUploadRegionAction, UiButtonBinding>>
  >
  readonly revision: number
  readonly canAcquire: boolean
  readonly busy: boolean
  readonly occupied: boolean
  readonly fileName: string | null
  readonly issue: UiUploadIssue | null
  acquire(
    files: readonly File[],
    guard: UiUploadAcquisitionGuard,
  ): Promise<UiUploadOutcome<unknown>>
}

export interface UiUploadProgressBinding {
  readonly target: 'upload-progress'
  readonly status: UiUploadStatus | 'idle'
  readonly fileName: string | null
  readonly progress: Readonly<UiUploadProgressValue> | null
  readonly issue: UiUploadIssue | null
  readonly cancelButton: UiButtonBinding | null
  readonly retryButton: UiButtonBinding | null
}

export interface UiUploadRegionProps {
  binding: UiUploadRegionBinding
  accept?: string
  capture?: 'user' | 'environment'
  disabled?: boolean
  readonly?: boolean
  extent?: 'compact' | 'regular' | 'large' | 'fill'
  // Omission selects the role defaults described below.
  progress?: boolean
  preview?: boolean
  previewAlt?: string
  // A selection set, not action order or placement. Omission includes supported actions.
  actions?: readonly UiUploadRegionAction[]
}

export interface UiUploadProgressProps {
  binding: UiUploadProgressBinding
  cancel?: boolean
  retry?: boolean
  announcement?: 'off' | 'polite'
}
