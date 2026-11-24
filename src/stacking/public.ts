import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useUiZOrder as participate, useZRuntime, zReference } from './runtime'
import { useUiZView } from './view'
import type { UiZOrder, UiZReference } from './authoring'
/** Give a reusable/native composition one outward identity without adding a DOM wrapper. */
export function useUiZOrder(
  order: MaybeRefOrGetter<UiZOrder | undefined> = undefined,
) {
  const result = participate(() => toValue(order))
  useUiZView({ binding: result.binding })
  return Object.freeze({
    handle: result.handle,
    resolved: result.resolved,
    snapshot: result.snapshot,
    describe: () => describe(result.binding.runtime, result.handle),
  })
}
function describe(
  runtime: ReturnType<typeof useZRuntime>,
  handle: import('./model').UiZHandle,
) {
  const declaration = runtime.bindings.get(handle)?.order()
  const pendingComparisons = [
    ...(declaration?.above ?? []),
    ...(declaration?.below ?? []),
  ].filter((reference) => {
    const target = zReference(runtime, reference)
    return !target || !runtime.domain.describe(target)
  }).length
  return { ...runtime.browser.describe(handle), pendingComparisons }
}
/** Setup-time access to app-local reference lookup and application-lifetime layer extension. */
export function useUiStacking() {
  const runtime = useZRuntime()
  return Object.freeze({
    resolve: (reference: UiZReference) => zReference(runtime, reference),
    describe: (reference: UiZReference) => {
      const handle = zReference(runtime, reference)
      return handle ? describe(runtime, handle) : undefined
    },
    fromElement: (element: Element) => runtime.browser.lookup(element),
    registerLayer: (
      name: string,
      relationship: { above?: readonly string[]; below?: readonly string[] },
    ) => runtime.layers.register(name, relationship),
    snapshot: computed(() => runtime.snapshot.value),
  })
}
