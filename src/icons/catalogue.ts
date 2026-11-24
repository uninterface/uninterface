import { inject, type Component, type InjectionKey } from 'vue'
import type { UiThemeColor } from '../presentation/theme'

export const uiIconNames = Object.freeze([
  'add',
  'edit',
  'delete',
  'save',
  'cancel',
  'confirm',
  'search',
  'refresh',
  'copy',
  'upload',
  'download',
  'close',
  'menu',
  'menu-item',
  'more',
  'more-horizontal',
  'more-vertical',
  'previous',
  'next',
  'expand',
  'collapse',
  'info',
  'success',
  'warning',
  'error',
  'show',
  'hide',
  'create',
  'remove',
  'reset',
  'clear',
  'retry',
  'home',
  'help',
  'bookmark',
  'location',
  'globe',
  'calendar',
  'time',
  'file',
  'image',
  'attachment',
  'email',
  'filter',
  'sort',
  'sort-ascending',
  'sort-descending',
  'move-up',
  'move-down',
  'arrow-up',
  'arrow-down',
  'arrow-left',
  'arrow-right',
  'first',
  'last',
  'link',
  'external-link',
  'settings',
] as const)
export type UiIconName = (typeof uiIconNames)[number] | (string & {})
export interface UiIconDefinition {
  component: Component
  mirrorInRtl?: boolean
  /** A multicolor asset may explicitly select authored tone variants. */
  tones?: Readonly<Partial<Record<UiThemeColor, Component>>>
}
export type UiIconCatalogue = Readonly<Record<string, UiIconDefinition>>
// Keep application intent separately from artwork identity and public entries.
const explicitNames = new WeakMap<UiIconCatalogue, ReadonlySet<string>>()
export function getIconOverride(catalogue: UiIconCatalogue, name: string) {
  return explicitNames.get(catalogue)?.has(name) ? catalogue[name] : undefined
}
export const iconsKey: InjectionKey<UiIconCatalogue> =
  Symbol('uninterface.icons')
export function useIconCatalogue() {
  const catalogue = inject(iconsKey)
  if (!catalogue) throw new Error('Install Uninterface before using icons.')
  return catalogue
}
export function assembleIcons(
  defaults: UiIconCatalogue,
  overrides: UiIconCatalogue = {},
): UiIconCatalogue {
  const result = Object.assign(
    Object.create(null),
    defaults,
    overrides,
  ) as Record<string, UiIconDefinition>
  for (const name of uiIconNames) {
    if (!result[name]?.component)
      throw new Error(`Missing required icon: ${name}`)
  }
  for (const [name, definition] of Object.entries(result)) {
    if (!name || !definition?.component)
      throw new Error(`Invalid icon definition: ${name}`)
    result[name] = Object.freeze({
      ...definition,
      tones: definition.tones && Object.freeze({ ...definition.tones }),
    })
  }
  explicitNames.set(result, new Set(Object.keys(overrides)))
  return Object.freeze(result)
}
