import { computed } from 'vue'
import type { UiUploadProgressBinding } from '../../files/region-types'
import type { UiUploadProgressViewProps } from '../../backend'
import { useIssueText, useMessages } from '../../i18n/messages'
import { resolveProgressBar } from '../../presentation/progress'

/** Shared transfer presentation; actions always recheck the live producer. */
export function useUploadProgressPresentation(
  binding: () => UiUploadProgressBinding,
  options: () => {
    activity?: boolean
    cancel?: boolean
    retry?: boolean
    disabled?: boolean
    readonly?: boolean
    issueId?: string
    announcement?: 'off' | 'polite'
  },
) {
  const messages = useMessages('files')
  const issue = useIssueText(() => binding()?.issue ?? null)
  const view = computed<UiUploadProgressViewProps>(() => {
    const b = binding(),
      o = options(),
      m = messages.value
    return {
      bar: resolveProgressBar({
        'aria-label': m.uploadPending,
        value: b.progress?.total ? b.progress.loaded : null,
        max: b.progress?.total || 100,
      }),
      active:
        o.activity !== false && ['queued', 'uploading'].includes(b.status),
      fileName: b.fileName,
      issue: issue.value,
      issueId: o.issueId,
      label: m.uploadPending,
      loaded: b.progress?.loaded ?? 0,
      total: b.progress?.total ?? null,
      cancelLabel: m.cancel,
      cancelAccessibleLabel: m.cancelUpload,
      canCancel:
        o.cancel !== false &&
        !o.disabled &&
        !!b.cancelButton &&
        !b.cancelButton.disabled,
      retryLabel: m.retry,
      canRetry:
        o.retry !== false &&
        ['failed', 'cancelled'].includes(b.status) &&
        !!b.retryButton &&
        !b.retryButton.disabled,
      retryDisabled: !!o.disabled || !!o.readonly || !!b.retryButton?.loading,
      announcement: o.announcement ?? 'off',
      async cancel() {
        const action = binding().cancelButton,
          current = options()
        if (
          current.cancel === false ||
          current.disabled ||
          !action ||
          action.disabled ||
          action.loading
        )
          return
        await action.activate?.()
      },
      async retry() {
        const current = options(),
          latest = binding(),
          action = latest.retryButton
        if (
          current.retry === false ||
          current.disabled ||
          current.readonly ||
          !['failed', 'cancelled'].includes(latest.status) ||
          !action ||
          action.disabled ||
          action.loading
        )
          return
        await action.activate?.()
      },
    }
  })
  return Object.assign(view, { messagesReady: messages.ready })
}
