import { inject, type InjectionKey } from 'vue'

export const overlayEscapeKey: InjectionKey<(event: KeyboardEvent) => void> =
  Symbol('ui-overlay-escape')

/** Route Escape past a closed native widget that would otherwise swallow it. */
export function useUiOverlayEscape() {
  return inject(overlayEscapeKey, undefined)
}
