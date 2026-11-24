import { createRunControl } from './internal/run'
import type {
  RunControl,
  RunSession,
  RunResult,
  RunOptions,
  RunCloseRequest,
  RunCancelReason,
} from './internal/run'
export type UiOverlayCloseTrigger =
  | 'close-button'
  | 'escape'
  | 'outside'
  | 'trigger'
  | 'drag'
type ExtraReason = 'outside' | 'trigger' | 'drag'
export type UiOverlayCancelReason = RunCancelReason<ExtraReason>
export type UiOverlayControl<T = void> = RunControl<T, ExtraReason>
export type UiOverlaySession<T = void> = RunSession<T, ExtraReason>
export type UiOverlayResult<T = void> = RunResult<T, ExtraReason>
export type UiOverlayRunOptions<T = void> = RunOptions<T, ExtraReason>
export type UiOverlayCloseRequest<T = void> = RunCloseRequest<T, ExtraReason>
/** Own one reusable drawer interaction; panel expansion has its own owner. */
export function createUiDrawerControl<T = void>(): UiOverlayControl<T> {
  return createRunControl<T, ExtraReason>()
}
/** Own one reusable anchored interaction, independently of modality. */
export function createUiPopoverControl<T = void>(): UiOverlayControl<T> {
  return createRunControl<T, ExtraReason>()
}
