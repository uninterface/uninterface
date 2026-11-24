import type { VNodeChild } from 'vue'
import type {
  UiFeedbackHandle,
  UiFeedbackMessage,
  UiFeedbackMessageSource,
} from './routing'

export type UiFeedbackPlacement =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
export type UiFeedbackOverflow = 'queue' | 'dismiss-oldest' | 'reject'
export interface UiFeedbackTargetOptions {
  /** Milliseconds of presented, unpaused time; null persists. */
  duration?: number | null
  maxVisible?: number | null
  overflow?: UiFeedbackOverflow
  maxPending?: number | null
  pendingOverflow?: 'reject' | 'dismiss-oldest'
  placement?: UiFeedbackPlacement
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
  pauseWhenHidden?: boolean
}
export type UiFeedbackPhase = 'queued' | 'visible' | 'closing' | 'closed'
export type UiFeedbackCloseReason =
  | 'dismissed'
  | 'timeout'
  | 'overflow'
  | 'rejected'
  | 'reset'
  | 'disposed'
  | 'presentation-error'
export interface UiFloatingFeedbackHandle extends UiFeedbackHandle {
  readonly id: string
  readonly phase: UiFeedbackPhase
  readonly reason: UiFeedbackCloseReason | undefined
  /** Settles after native exit cleanup (or immediately when never presented). */
  readonly closed: Promise<UiFeedbackCloseReason>
}
export interface UiFeedbackContentContext {
  readonly item: UiFloatingFeedbackHandle
  readonly feedback: UiFeedbackMessage
  dismiss(): void
}
export interface UiFeedbackSendOptions {
  duration?: number | null
  /** A per-delivery Vue slot. Called only while the item is presented. */
  content?: (context: UiFeedbackContentContext) => VNodeChild
}
export interface UiFloatingFeedbackTarget {
  readonly kind: 'toast' | 'notification'
  readonly state: {
    readonly items: readonly UiFloatingFeedbackHandle[]
    readonly queued: number
    readonly visible: number
  }
  reset(): void
  dispose(): void
}
export interface UiFloatingFeedbackRoute {
  send(
    message: UiFeedbackMessageSource,
    options?: UiFeedbackSendOptions,
  ): UiFloatingFeedbackHandle
  reset(): void
  dispose(): void
}
