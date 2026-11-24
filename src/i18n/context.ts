import { inject, type InjectionKey } from 'vue'
import type { UiI18nControl, UiI18nDefinition, UiI18nTranslator } from './types'
export const i18nKey: InjectionKey<UiI18nControl> = Symbol('uninterface.i18n')

function messageBuilder<Key extends string>(
  namespace: string,
): UiI18nTranslator<Key>['msg'] {
  if (!namespace.trim())
    throw new Error('A translation namespace must be nonempty.')
  return (key, params) => ({ namespace, key, params })
}

function translator<Key extends string>(
  control: UiI18nControl,
  msg: UiI18nTranslator<Key>['msg'],
): UiI18nTranslator<Key> {
  return {
    i18n: control,
    t: (key, params) => control.text(msg(key, params)),
    lt: (key, params) => control.lt(msg(key, params)),
    msg,
  }
}

/** Define vocabulary once; acquire the owning application only when the hook runs. */
export function defineUiI18n<Key extends string = string>(
  namespace: string,
): UiI18nDefinition<Key> {
  const msg = messageBuilder<Key>(namespace)
  return {
    msg,
    useI18n: () => translator(useUiI18n(), msg),
  }
}

export function useUiI18n(): UiI18nControl
export function useUiI18n<Key extends string = string>(
  namespace: string,
): UiI18nTranslator<Key>
export function useUiI18n(
  namespace?: string,
): UiI18nControl | UiI18nTranslator {
  const control = inject(i18nKey)
  if (!control)
    throw new Error(
      'Install Uninterface through createUiApplication before using localized components.',
    )
  if (namespace === undefined) return control
  return translator(control, messageBuilder(namespace))
}
