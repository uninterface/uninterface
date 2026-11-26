import { onDeactivated, ref, watchPostEffect, type Ref } from 'vue'

type FeedbackField = (event: PointerEvent) => (() => void) | undefined
const documents = new WeakMap<Document, ReturnType<typeof trackPointer>>()

function trackPointer(document: Document) {
  const fields = new Map<HTMLElement, FeedbackField>()
  let pointerId: number | undefined
  let released = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const restore = new Set<() => void>()

  function finish() {
    clearTimeout(timer)
    pointerId = undefined
    released = false
    for (const release of restore) release()
    restore.clear()
  }

  function down(event: PointerEvent) {
    if (event.button !== 0 || event.isPrimary === false) return
    finish()
    for (
      let field = document.activeElement;
      field;
      field = field.parentElement
    ) {
      const release = fields.get(field as HTMLElement)?.(event)
      if (release) restore.add(release)
    }
    if (restore.size) pointerId = event.pointerId
  }
  function up(event: PointerEvent) {
    if (!restore.size || event.pointerId !== pointerId) return
    released = true
    // A release outside the target may produce no click. Also allow time for a
    // touch compatibility click before feedback re-enters the layout.
    timer = setTimeout(finish, 500)
  }
  function click() {
    if (!released) return
    clearTimeout(timer)
    // Run after the native click and its default action.
    timer = setTimeout(finish, 0)
  }
  function cancel(event: PointerEvent) {
    if (event.pointerId === pointerId) finish()
  }
  document.addEventListener('pointerdown', down, true)
  document.addEventListener('pointerup', up, true)
  document.addEventListener('pointercancel', cancel, true)
  document.addEventListener('click', click, true)
  document.defaultView?.addEventListener('blur', finish)

  return {
    fields,
    forget(release: () => void) {
      restore.delete(release)
      if (!restore.size) finish()
    },
    dispose() {
      finish()
      document.removeEventListener('pointerdown', down, true)
      document.removeEventListener('pointerup', up, true)
      document.removeEventListener('pointercancel', cancel, true)
      document.removeEventListener('click', click, true)
      document.defaultView?.removeEventListener('blur', finish)
    },
  }
}

/** Hold newly added feedback out of the layout through an outgoing press. */
export function useFieldFeedbackTiming(
  target: Ref<unknown>,
  issue: () => string | null | undefined,
  showHelp: () => boolean,
) {
  const deferred = ref(false)
  const previousHelp = ref(false)
  watchPostEffect((cleanup) => {
    const value = target.value as HTMLElement | { $el: HTMLElement } | undefined
    const field = value && '$el' in value ? value.$el : value
    if (!field?.ownerDocument || field.nodeType !== 1) return
    const document = field.ownerDocument
    const tracker = documents.get(document) ?? trackPointer(document)
    documents.set(document, tracker)
    const release = () => {
      deferred.value = false
    }
    tracker.fields.set(field, (event) => {
      if (issue() || event.composedPath().includes(field)) return
      previousHelp.value = showHelp()
      deferred.value = true
      return release
    })
    cleanup(() => {
      release()
      tracker.forget(release)
      tracker.fields.delete(field)
      if (!tracker.fields.size) {
        tracker.dispose()
        documents.delete(document)
      }
    })
  })
  onDeactivated(() => {
    deferred.value = false
  })
  return { deferred, previousHelp }
}
