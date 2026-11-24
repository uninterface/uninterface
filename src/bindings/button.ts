import {
  getCurrentInstance,
  shallowReactive,
  toRaw,
  type ComputedRef,
  type InjectionKey,
} from 'vue'

/** A reactive, read-only projection for a button, independent of its owner. */
export interface UiButtonBinding {
  readonly target: 'button'
  readonly type: 'button' | 'submit' | 'reset'
  readonly disabled: boolean
  /** Displays activity and prevents button activation while true. */
  readonly loading: boolean
  /** Ordinary actions only; native submit/reset use their associated form. */
  readonly activate?: () => void | Promise<void>
}

/** Private view dispatch hook; bindings remain independent of their producer. */
export const buttonActivationKey: InjectionKey<
  (
    binding: UiButtonBinding,
    invoke: () => void | Promise<void>,
    event: MouseEvent,
  ) => void | Promise<void>
> = Symbol('uninterface.button-activation')

// Scoped producers can require a matching logical host without teaching the
// button about the producer's control type. Metadata is not a render prop.
const scopes = new WeakMap<UiButtonBinding, symbol>()
export const buttonBindingScopeKey: InjectionKey<
  ComputedRef<symbol | undefined>
> = Symbol('uninterface.buttonBindingScope')

export function scopeButtonBinding(binding: UiButtonBinding, scope: symbol) {
  scopes.set(binding, scope)
  return binding
}

export function buttonBindingScope(binding: UiButtonBinding) {
  return scopes.get(toRaw(binding))
}

// Associations belong to a Vue application, never to a process-wide ID namespace.
// Only mounted logical hosts register; the backend renders the native association.
const hostRegistries = new WeakMap<
  object,
  Map<string, { scope: symbol; owner: symbol }>
>()
export function useButtonBindingHosts() {
  const app = getCurrentInstance()!.appContext
  let hosts = hostRegistries.get(app)
  if (!hosts) {
    hosts = shallowReactive(new Map())
    hostRegistries.set(app, hosts)
  }
  return hosts
}

export function assertButtonBinding(
  binding: UiButtonBinding,
  scope?: symbol,
  checkScope = true,
) {
  if (
    binding.target !== 'button' ||
    !['button', 'submit', 'reset'].includes(binding.type) ||
    typeof binding.disabled !== 'boolean' ||
    typeof binding.loading !== 'boolean' ||
    (binding.activate !== undefined && typeof binding.activate !== 'function')
  )
    throw new Error('UiButton: incompatible button binding.')
  if (binding.activate && binding.type !== 'button')
    throw new Error(
      'UiButton: native submit/reset bindings cannot also activate a callback.',
    )
  const requiredScope = buttonBindingScope(binding)
  if (checkScope && requiredScope !== undefined && requiredScope !== scope)
    throw new Error('UiButton: binding requires its matching control host.')
}
