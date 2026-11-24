import type { InjectionKey, Ref } from 'vue'

/** Where an application obtains its initial vertical space offer. */
export type UiAppHosting = 'document' | 'viewport'

// A local offer, not an inference from arbitrary DOM ancestors.
export const availableHeightKey: InjectionKey<
  Readonly<Ref<number | undefined>>
> = Symbol('ui-available-height')
