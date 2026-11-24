import {
  computed,
  getCurrentInstance,
  inject,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  onScopeDispose,
  provide,
  shallowRef,
  watch,
  type InjectionKey,
} from 'vue'
import { createZDomain, type ZDomain } from './domain'
import {
  UiZOrderError,
  type UiZBand,
  type UiZHandle,
  type UiZOrder,
} from './model'

export const zDomainKey: InjectionKey<ZDomain> = Symbol('ui-z-domain')
const zParentKey: InjectionKey<UiZHandle> = Symbol('ui-z-parent')
const registeredComponents = new WeakMap<object, UiZHandle>()

/** Resolve registered public component identity; never traverse a component's DOM. */
export function zComponentHandle(instance: object | null | undefined) {
  return instance ? registeredComponents.get(instance) : undefined
}

export function useZDomain() {
  const instance = getCurrentInstance()
  if (!instance)
    throw new UiZOrderError('declaration', 'stacking requires component setup.')
  // Also support ordinary Vue applications without requiring a wrapper or plugin.
  let domain = inject(zDomainKey, undefined)
  if (!domain) {
    domain = createZDomain()
    instance.appContext.app.provide(zDomainKey, domain)
    instance.appContext.app.onUnmount(() => domain!.dispose())
  }
  return domain
}

/** Low-level participant harness for isolated resolver/lifecycle verification. */
export function useZParticipant(options: {
  source: string
  band?: UiZBand
  parent?: () => UiZHandle | undefined
  order?: () => UiZOrder | undefined
  /** Only component contracts establish a new ordering parent. */
  scope?: boolean
}) {
  const domain = useZDomain()
  const instance = getCurrentInstance()!
  const inherited = inject(zParentKey, undefined)
  const handle = domain.handle(options.source)
  const snapshot = shallowRef(domain.snapshot)
  const unsubscribe = domain.subscribe((value) => {
    snapshot.value = value
  })
  const active = shallowRef(false)
  if (options.scope) provide(zParentKey, handle)
  const identities = new Set<object>()
  function registerIdentity() {
    for (const identity of [
      instance.proxy,
      instance.exposed,
      instance.exposeProxy,
    ])
      if (identity) {
        registeredComponents.set(identity, handle)
        identities.add(identity)
      }
  }
  onMounted(registerIdentity)
  // onBeforeMount runs parent-first; SSR serialization never allocates or repacks.
  onBeforeMount(() => {
    registerIdentity()
    active.value = true
  })
  watch(
    () => ({
      active: active.value,
      order: options.order?.(),
      parent: options.parent ? options.parent() : inherited,
    }),
    (value) => {
      if (!value.active) return
      domain.transact({
        put: [
          {
            handle,
            source: options.source,
            band: options.band ?? 'group',
            parent: value.parent,
            order: value.order,
          },
        ],
      })
    },
    { flush: 'sync', deep: true },
  )
  let released = false
  function release() {
    if (released) return
    released = true
    active.value = false
    unsubscribe()
    for (const identity of identities) registeredComponents.delete(identity)
    if (domain.describe(handle)) domain.transact({ remove: [handle] })
  }
  onBeforeUnmount(release)
  onScopeDispose(release)
  // v-show and KeepAlive retain identities. Overlay lifetimes use independent session registrations.
  return {
    domain,
    handle,
    resolved: computed(() =>
      snapshot.value.entries.find((e) => e.handle === handle),
    ),
    snapshot: computed(() => snapshot.value),
    release,
  }
}
