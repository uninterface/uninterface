import { shallowReactive, type Component, type InjectionKey } from 'vue'

// Application-owned mount infrastructure. No presentation imports: unused
// targets and native feedback components remain tree-shakeable.
export function createFeedbackRegistry() {
  const entries = shallowReactive(new Map<symbol, Component>())
  const releases = new Map<symbol, () => void>()
  let disposed = false
  return {
    entries,
    add(view: Component, dispose: () => void) {
      if (disposed) throw new Error('Feedback application is disposed.')
      const key = Symbol('feedback destination')
      entries.set(key, view)
      releases.set(key, dispose)
      return () => {
        entries.delete(key)
        releases.delete(key)
      }
    },
    dispose() {
      disposed = true
      for (const release of [...releases.values()]) release()
      entries.clear()
      releases.clear()
    },
  }
}
export const feedbackRegistryKey: InjectionKey<
  ReturnType<typeof createFeedbackRegistry>
> = Symbol('feedback destinations')
