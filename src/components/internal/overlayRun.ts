import {
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onErrorCaptured,
  shallowRef,
  watch,
  type Ref,
} from 'vue'
import { attachRunPresentation } from '../../controls/internal/run'
import type {
  UiOverlayControl,
  UiOverlaySession,
  UiOverlayCloseTrigger,
} from '../../controls/overlay'
import type { UiModalViewHandle } from '../../backend'

/** Shared run/view attachment; presentation and owned business resources stay separate. */
export function useOverlayRun<T>(
  control: () => UiOverlayControl<T>,
  view: Ref<UiModalViewHandle | undefined>,
  closeOn: () => readonly UiOverlayCloseTrigger[],
) {
  const session = shallowRef<UiOverlaySession<T>>()
  let detach: (() => Promise<void>) | undefined
  function attach(owner: UiOverlayControl<T>) {
    let presented: UiOverlaySession<T> | undefined
    let mountedView: UiModalViewHandle | undefined
    const release = attachRunPresentation(owner, {
      async open(current) {
        session.value = presented = current
        await nextTick()
        if (!view.value || session.value !== current)
          throw new Error('Overlay view was removed during opening.')
        mountedView = view.value
        if (!current.signal.aborted) await mountedView.open()
      },
      async close() {
        try {
          await mountedView?.close()
        } finally {
          if (session.value === presented) session.value = undefined
          mountedView = undefined
          await nextTick()
        }
      },
    })
    detach = () => {
      detach = undefined
      return release()
    }
  }
  watch(
    control,
    (owner, _, cleanup) => {
      attach(owner)
      cleanup(() => {
        void detach?.()
      })
    },
    { immediate: true },
  )
  onActivated(() => {
    if (!detach) attach(control())
  })
  onDeactivated(() => {
    void detach?.()
  })
  onBeforeUnmount(() => {
    void detach?.()
  })
  onErrorCaptured((error) => {
    control().state.session?.fail(error)
    return false
  })
  return {
    session,
    cancel(reason: UiOverlayCloseTrigger) {
      if (closeOn().includes(reason) && !control().state.pendingClose)
        void session.value?.cancel(reason)
    },
    fail(error: unknown) {
      session.value?.fail(error)
    },
  }
}
