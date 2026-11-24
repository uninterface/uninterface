import { inject, onBeforeUnmount, watch } from 'vue'
import { useZRuntime, zParentContext, zPage } from './runtime'
import type { UiZHandle } from './model'
/** Component-owned local paint target, with an explicit native host. */
export function useZLocalTarget(
  target: () => HTMLElement | undefined,
  host: () => HTMLElement | null | undefined,
  source: string,
) {
  const runtime = useZRuntime(),
    parent = inject(zParentContext, () => undefined)
  let handle: UiZHandle | undefined,
    attachment: ReturnType<typeof runtime.browser.attach> | undefined
  const release = () => {
    attachment?.release()
    attachment = undefined
    if (handle && runtime.domain.describe(handle))
      runtime.domain.transact({ remove: [handle] })
    handle = undefined
  }
  watch(
    [target, host],
    ([element, host]) => {
      release()
      if (!element?.isConnected || !host) return
      handle = runtime.domain.handle(source)
      runtime.domain.transact({
        put: [
          {
            handle,
            band: 'local',
            parent: parent() ?? runtime.layers.layer(zPage(runtime), 'content'),
            source,
          },
        ],
      })
      try {
        attachment = runtime.browser.attach({
          handle,
          element,
          host,
          mode: 'css',
        })
      } catch (error) {
        release()
        throw error
      }
    },
    { flush: 'post' },
  )
  onBeforeUnmount(release)
}
