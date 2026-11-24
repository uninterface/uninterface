import type { UiListBinding } from '../../bindings/list'

/** A view reports geometry; only this coordinator may spend automatic intent. */
export function createListContinuation(
  binding: UiListBinding<unknown, any, any>,
) {
  let generation = binding.generation
  let successful = 0
  let episode = 0
  let pending = false
  let near = false
  let visible = false
  let disposed = false
  function renew() {
    episode++
    successful = 0
  }
  function sync() {
    if (generation !== binding.generation) {
      generation = binding.generation
      renew()
    }
  }
  return {
    observe(value: { visible: boolean; near: boolean; renewed?: boolean }) {
      sync()
      if (value.visible) {
        if ((!near && value.near) || value.renewed) renew()
        near = value.near
      }
      visible = value.visible
    },
    async request() {
      sync()
      if (
        disposed ||
        pending ||
        !visible ||
        !near ||
        successful >= 3 ||
        !binding.canLoadMore
      )
        return false
      pending = true
      const started = episode
      const version = generation
      try {
        const accepted = await binding.loadMore()
        sync()
        if (accepted && version === generation && started === episode)
          successful++
        return accepted
      } finally {
        pending = false
      }
    },
    dispose() {
      disposed = true
    },
  }
}
