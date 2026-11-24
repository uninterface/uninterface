import type { UiButtonBinding } from '../bindings/button'
import type { UiUploadTask } from './control'
import type { UiUploadProgressBinding, UiUploadIssue } from './region-types'

/** A projection only: observing a task never acquires its lifetime. */
export function createUiUploadProgressBinding<H, M = unknown>(
  task: UiUploadTask<H, M>,
  options: {
    canCancel?: () => boolean
    cancelButton?: UiButtonBinding
    retryButton?: UiButtonBinding
    describeError?: (error: unknown) => UiUploadIssue
  } = {},
): UiUploadProgressBinding {
  const active = () => ['queued', 'uploading'].includes(task.state.status)
  const cancelButton: UiButtonBinding = Object.freeze({
    target: 'button',
    type: 'button',
    loading: false,
    get disabled() {
      return (
        (options.cancelButton ? options.cancelButton.disabled : !active()) ||
        options.canCancel?.() === false ||
        !!options.cancelButton?.loading
      )
    },
    activate() {
      if (cancelButton.disabled) return
      if (options.cancelButton) return options.cancelButton.activate?.()
      task.cancel()
    },
  })
  return Object.freeze({
    target: 'upload-progress',
    get status() {
      return task.state.status
    },
    get fileName() {
      return task.state.file.name
    },
    get progress() {
      return task.state.progress
    },
    get issue() {
      if (task.state.status !== 'failed') return null
      try {
        return (
          options.describeError?.(task.state.error) ?? {
            namespace: 'uninterface',
            key: 'uploadFailed',
          }
        )
      } catch {
        return { namespace: 'uninterface', key: 'uploadFailed' }
      }
    },
    cancelButton,
    // The producer owns replacement of the task and live retry permission.
    retryButton: options.retryButton ?? null,
  })
}
