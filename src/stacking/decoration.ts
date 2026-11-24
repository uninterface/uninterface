import { onBeforeUnmount } from 'vue'
import type { ZBinding } from './runtime'
/** A layout's interactive boundary paints after its allocations, under its outward scope. */
export function useZDecoration(owner: ZBinding) {
  let binding: ZBinding | undefined
  const release = () => {
    if (binding?.resolved())
      owner.runtime.domain.transact({ remove: [binding.handle] })
    binding = undefined
  }
  onBeforeUnmount(release)
  return (active: boolean) => {
    if (active && !binding && owner.resolved()) {
      const handle = owner.runtime.domain.handle(
        `${owner.handle.label}:resizers`,
      )
      owner.runtime.domain.transact({
        put: [
          { handle, parent: owner.handle, band: 'local', source: handle.label },
        ],
      })
      binding = {
        ...owner,
        handle,
        order: () => undefined,
        resolved: () => owner.runtime.domain.describe(handle),
      }
    }
    if (!active) release()
    return binding
  }
}
