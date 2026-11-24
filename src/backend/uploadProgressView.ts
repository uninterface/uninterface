import { onBeforeUnmount, onBeforeUpdate, onUpdated, ref } from 'vue'

/** Retain keyboard context when a standalone transfer changes its actions. */
export function useUiUploadProgressView() {
  const root = ref<HTMLElement>()
  let focused: Element | null = null
  let document: Document | undefined
  let retryPending = false
  let cleanup: ReturnType<typeof setTimeout> | undefined
  function clearCleanup() {
    clearTimeout(cleanup)
    cleanup = undefined
  }
  onBeforeUnmount(clearCleanup)
  onBeforeUpdate(() => {
    const element = root.value
    // The containing region coordinates its chooser and all hosted actions.
    if (!element || element.closest('[data-ui-upload-region]')) return
    const active = element.ownerDocument.activeElement
    if (!active || !element.contains(active)) return
    focused = active
    document = element.ownerDocument
    retryPending ||= active.matches('[data-upload-action=retry]')
  })
  onUpdated(() => {
    if (!focused || !document) return
    const active = document.activeElement
    if (active !== document.body && active !== focused) {
      focused = null
      retryPending = false
      return
    }
    const current = root.value
    // Retry can briefly have no rendered state while its candidate is validated.
    if (!current?.isConnected) {
      // Task failure can remove activity before the workflow publishes recovery
      // in a subsequent microtask. Keep context through that rendering gap;
      // discard it when terminal hiding survives the current event-loop turn.
      if (!retryPending && cleanup === undefined)
        cleanup = setTimeout(() => {
          cleanup = undefined
          if (!root.value?.isConnected) focused = null
        }, 0)
      return
    }
    clearCleanup()
    if (!current.contains(focused) || focused.matches(':disabled'))
      (
        current.querySelector<HTMLElement>(
          '[data-upload-action]:not(:disabled)',
        ) ?? current
      ).focus()
    focused = null
    retryPending = false
  })
  return { root }
}
