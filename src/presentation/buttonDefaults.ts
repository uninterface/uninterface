import {
  getCurrentInstance,
  inject,
  provide,
  type ComponentInternalInstance,
  type InjectionKey,
} from 'vue'
import type { UiButtonVariant } from './button'

export const buttonDefaultScopeKey: InjectionKey<{
  owner: ComponentInternalInstance
  variant: UiButtonVariant
}> = Symbol('button-default-scope')

export const buttonDefaultVariantKey: InjectionKey<
  UiButtonVariant | undefined
> = Symbol('button-default-variant')

/** Only direct authored buttons participate; opaque component interiors do not. */
export function provideButtonDefault() {
  const scope = inject(buttonDefaultScopeKey, undefined)
  provide(
    buttonDefaultVariantKey,
    scope?.owner === getCurrentInstance()?.parent ? scope?.variant : undefined,
  )
}
