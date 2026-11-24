import { computed, inject, provide, type InjectionKey } from 'vue'

export type NavigationBoundary =
  | 'inline-start'
  | 'inline-end'
  | 'block-start'
  | 'block-end'
  | 'none'
export interface NavigationBoundaryHost {
  axis: 'vertical' | 'horizontal'
  edge: Exclude<NavigationBoundary, 'none'>
}
export const navigationBoundaryKey: InjectionKey<
  () => NavigationBoundaryHost | undefined
> = Symbol('navigation-boundary')

/** Logical ownership only: backends render the acknowledged edge. */
export function useNavigationBoundary(horizontal: () => boolean) {
  const parent = inject(navigationBoundaryKey, () => undefined)
  // Nested menus cannot borrow an unrelated root menu's boundary.
  provide(navigationBoundaryKey, () => undefined)
  return computed<NavigationBoundary>(() => {
    const host = parent()
    if (host?.axis === (horizontal() ? 'horizontal' : 'vertical')) return 'none'
    return horizontal() ? 'block-end' : 'inline-end'
  })
}
