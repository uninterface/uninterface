import type { ComputedRef, InjectionKey } from 'vue'
import type { UiButtonVariant } from '../presentation/button'

export type UiCollectionActionVariant = 'bordered' | 'soft' | 'text'

/** Private content intent; surfaces continue to be resolved at the button node. */
export const collectionActionKey: InjectionKey<
  ComputedRef<{
    iconOnly: boolean
    defaultVariant: UiButtonVariant
  }>
> = Symbol('collection.action')
