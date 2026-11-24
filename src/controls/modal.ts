import { createRunControl } from './internal/run'
import type {
  RunControl,
  RunSession,
  RunResult,
  RunOptions,
  RunCloseRequest,
  RunCancelReason,
} from './internal/run'
export { attachRunPresentation as attachModalPresentation } from './internal/run'
export type UiModalCloseTrigger = 'close-button' | 'escape' | 'backdrop'
export type UiModalCancelReason = RunCancelReason
export type UiModalResult<T> = RunResult<T>
export type UiModalCloseRequest<T> = RunCloseRequest<T>
export type UiModalSession<T> = RunSession<T>
export type UiModalRunOptions<T> = RunOptions<T>
export type UiModalControl<T> = RunControl<T>
export function createUiModalControl<T>(): UiModalControl<T> {
  return createRunControl<T>()
}
