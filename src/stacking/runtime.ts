import { zForwardKey } from './forward'
import {
  computed,
  getCurrentInstance,
  inject,
  isRef,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  shallowRef,
  watch,
  type InjectionKey,
  type Ref,
  type VNode,
  type ComponentInternalInstance,
} from 'vue'
import { useZDomain } from './context'
import { createZLayers } from './layers'
import { createZBrowser } from './browser'
import {
  UiZOrderError,
  type UiZHandle,
  type UiZOrder as ResolvedOrder,
  type ZRegistration,
} from './model'
import type { UiZOrder, UiZReference } from './authoring'
import type { ZDomain } from './domain'

interface Runtime {
  domain: ZDomain
  layers: ReturnType<typeof createZLayers>
  browser: ReturnType<typeof createZBrowser>
  snapshot: Ref<ZDomain['snapshot']>
  registry: Ref<number>
  registryId: number
  refs: WeakMap<object, UiZHandle>
  bindings: WeakMap<UiZHandle, ZBinding>
  /** Backend roots remain physical hosts even when their identity has no rank. */
  physicalRoots: Map<UiZHandle, Set<() => readonly HTMLElement[]>>
  page?: UiZHandle
}
export const componentBindings = new WeakMap<
  ComponentInternalInstance,
  ZBinding
>()
const runtimes = new WeakMap<ZDomain, Runtime>()
export const zParentContext: InjectionKey<() => UiZHandle | undefined> =
  Symbol('z-parent')
export const zSurfaceContext: InjectionKey<() => UiZHandle | undefined> =
  Symbol('z-surface')
export const zViewContext: InjectionKey<ZBinding | undefined> = Symbol('z-view')
export interface ZBinding {
  runtime: Runtime
  handle: UiZHandle
  surface: () => UiZHandle | undefined
  order: () => UiZOrder | undefined
  resolved: () => ReturnType<ZDomain['describe']>
}
export function useZRuntime() {
  return zRuntime(useZDomain())
}
export function zRuntime(domain: ZDomain) {
  let runtime = runtimes.get(domain)
  if (!runtime) {
    const snapshot = shallowRef(domain.snapshot)
    runtime = {
      domain,
      layers: createZLayers(domain),
      browser: createZBrowser(domain),
      snapshot,
      registry: shallowRef(0),
      registryId: 0,
      refs: new WeakMap(),
      bindings: new WeakMap(),
      physicalRoots: new Map(),
    }
    domain.subscribe((value) => {
      snapshot.value = value
    })
    runtimes.set(domain, runtime)
  }
  return runtime
}
export function zReference(
  runtime: Runtime,
  ref: UiZReference,
): UiZHandle | undefined {
  runtime.registry.value
  while (isRef(ref)) ref = ref.value as UiZReference
  if (!ref) return
  if (typeof ref !== 'object')
    throw new UiZOrderError(
      'declaration',
      'reference must be a registered instance, template ref or handle.',
    )
  if ('domain' in ref && 'id' in ref) return ref as UiZHandle
  return runtime.refs.get(ref)
}
export function zOrder(
  runtime: Runtime,
  input: UiZOrder | undefined,
  surface?: UiZHandle,
): ResolvedOrder | undefined {
  if (input === undefined) return
  if (!input || typeof input !== 'object')
    throw new UiZOrderError(
      'declaration',
      'zOrder must be an ordering declaration.',
    )
  for (const list of [input.above, input.below])
    if (list !== undefined && !Array.isArray(list))
      throw new UiZOrderError('declaration', 'comparisons must be arrays.')
  if (
    input.position !== undefined &&
    (input.above !== undefined ||
      input.below !== undefined ||
      !Number.isFinite(input.position))
  )
    throw new UiZOrderError(
      'declaration',
      'use finite position OR comparisons.',
    )
  const refs = (list: readonly UiZReference[] | undefined) =>
    list?.flatMap((ref) => {
      const h = zReference(runtime, ref)
      return h ? [h] : []
    })
  if (input.layer && input.parent)
    throw new UiZOrderError('declaration', 'choose layer OR explicit parent.')
  const parent = input.layer
    ? runtime.layers.layer(surface ?? zPage(runtime), input.layer)
    : zReference(runtime, input.parent)
  if (input.parent && !parent)
    throw new UiZOrderError(
      'parent',
      'explicit ordering parent is unavailable.',
    )
  const { layer: _layer, ...declaration } = input
  return {
    ...declaration,
    parent,
    above: refs(input.above),
    below: refs(input.below),
  } as ResolvedOrder
}
export function zPage(runtime: Runtime) {
  return (runtime.page ??= runtime.layers.open('page'))
}
function identities(
  runtime: Runtime,
  instance: ComponentInternalInstance,
  handle: UiZHandle,
) {
  for (const ref of [instance.proxy, instance.exposed, instance.exposeProxy])
    if (ref) runtime.refs.set(ref, handle)
}
/** Universal outward identity. Identity-only nesting forwards until an ordering scope is needed. */
export function useUiZOrder(
  order: () => UiZOrder | undefined = () => undefined,
  options: {
    source?: string
    passive?: boolean
    parent?: () => UiZHandle | undefined
    surface?: () => UiZHandle | undefined
    provide?: boolean
  } = {},
) {
  const runtime = useZRuntime(),
    instance = getCurrentInstance()!
  const inherited = inject(zParentContext, () => undefined),
    inheritedSurface = inject(zSurfaceContext, () => runtime.page)
  const handle = runtime.domain.handle(
    options.source ?? instance.type.name ?? instance.type.__name ?? 'component',
  )
  const surface = options.surface ?? inheritedSurface
  const resolved = () => {
    runtime.snapshot.value
    return runtime.domain.describe(handle)
  }
  const binding: ZBinding = { runtime, handle, surface, order, resolved }
  runtime.bindings.set(handle, binding)
  if (options.provide !== false) {
    provide(zParentContext, () => handle)
    provide(zViewContext, binding)
  }
  let mounted = false,
    disposed = false,
    last = ''
  function update() {
    if (!mounted || disposed) return
    const declaration = zOrder(runtime, order(), surface())
    const parent = options.parent
      ? options.parent()
      : (inherited() ?? runtime.layers.layer(zPage(runtime), 'content'))
    const record: ZRegistration = {
      handle,
      band: 'group',
      parent,
      order: declaration,
      passive: options.passive !== false,
      source: handle.label,
    }
    // Reactive component refs can settle after mount. Avoid snapshot feedback transactions.
    const signature = JSON.stringify([
      declaration !== undefined,
      declaration?.band,
      declaration?.position,
      declaration?.above?.map((h) => runtimeIds(runtime, h)),
      declaration?.below?.map((h) => runtimeIds(runtime, h)),
      runtimeIds(runtime, declaration?.parent),
      runtimeIds(runtime, parent),
      record.passive,
    ])
    if (signature === last) return
    const wasRegistered = Boolean(runtime.domain.describe(handle))
    runtime.domain.transact({ put: [record] })
    last = signature
    if (!wasRegistered && instance.isMounted) runtime.registry.value++
  }
  onBeforeMount(() => {
    mounted = true
    identities(runtime, instance, handle)
    update()
  })
  onMounted(() => {
    identities(runtime, instance, handle)
    runtime.registry.value++
  })
  onUpdated(() => {
    identities(runtime, instance, handle)
  })
  watch(
    () => [
      mounted ? zOrder(runtime, order(), surface()) : order(),
      runtime.registry.value,
      options.parent?.(),
      inherited(),
      surface(),
    ],
    update,
    { flush: 'post' },
  )
  onBeforeUnmount(() => {
    disposed = true
    if (runtime.domain.describe(handle))
      runtime.domain.transact({ remove: [handle] })
    // Preserve the mapping of destroyed refs to their unavailable identity; never retarget replacements.
    runtime.registry.value++
  })
  componentBindings.set(instance, binding)
  return {
    handle,
    binding,
    resolved: computed(resolved),
    snapshot: computed(() => runtime.snapshot.value),
    update,
  }
}
const idMaps = new WeakMap<Runtime, WeakMap<UiZHandle, number>>()
export function runtimeIds(runtime: Runtime, handle: UiZHandle | undefined) {
  if (!handle) return 0
  let ids = idMaps.get(runtime)
  if (!ids) idMaps.set(runtime, (ids = new WeakMap()))
  if (!ids.has(handle)) ids.set(handle, ++runtime.registryId)
  return ids.get(handle)
}

export function useZComponent() {
  const instance = getCurrentInstance()!
  const forward = inject(zForwardKey, undefined)
  provide(zForwardKey, undefined)
  if (forward) {
    componentBindings.set(instance, forward)
    provide(zViewContext, forward)
    provide(zParentContext, () => forward.handle)
    onMounted(() => {
      identities(forward.runtime, instance, forward.handle)
      forward.runtime.registry.value++
    })
    return {
      handle: forward.handle,
      binding: forward,
      resolved: computed(forward.resolved),
      snapshot: computed(() => forward.runtime.snapshot.value),
      update: () => {},
    }
  }
  return useUiZOrder(() => instance.props.zOrder as UiZOrder | undefined, {
    passive: !['UiTable', 'UiList', 'UiCollectionView', 'UiFileInput'].includes(
      instance.type.__name ?? instance.type.name ?? '',
    ),
  })
}
