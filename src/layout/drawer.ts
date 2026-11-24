import type { ComputedRef, InjectionKey } from 'vue'
import type { UiDrawerEdge } from '../presentation/overlay'

export type UiDrawerMode = 'modal' | 'panel' | 'docked'
export type UiDrawerExtent =
  | number
  | `${number}px`
  | `${number}rem`
  | `${number}em`
  | `${number}%`
export interface UiDrawerSizingProps {
  preferredExtent?: UiDrawerExtent
  minExtent?: UiDrawerExtent
  maxExtent?: UiDrawerExtent
  resizable?: boolean
  resizeLabel?: import('../text/source').UiTextSource
}
export function floatingPosition(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1)
    throw new Error('UiFloating position must be between zero and one.')
  return value
}
export function drawerLength(
  value: UiDrawerExtent,
  available: number,
  font = 16,
  root = 16,
) {
  if (typeof value === 'number') {
    if (Number.isFinite(value) && value > 0) return value
  } else {
    const match = /^(\d+(?:\.\d+)?|\.\d+)(px|rem|em|%)$/.exec(value)
    if (
      match &&
      Number.isFinite(+match[1]) &&
      +match[1] > 0 &&
      (match[2] !== '%' || +match[1] <= 100)
    ) {
      const resolved =
        +match[1] *
        { px: 1, rem: root, em: font, '%': available / 100 }[match[2]]!
      if (Number.isFinite(resolved)) return resolved
    }
  }
  throw new Error(
    'Drawer extents require a positive length or percentage up to 100%.',
  )
}
export function resolveDrawerExtent(
  props: UiDrawerSizingProps,
  available: number,
  preferred?: number,
  font = 16,
  root = 16,
) {
  const min =
    props.minExtent === undefined
      ? 0
      : drawerLength(props.minExtent, available, font, root)
  const max =
    props.maxExtent === undefined
      ? Infinity
      : drawerLength(props.maxExtent, available, font, root)
  if (min > max && min <= available)
    throw new Error('UiDrawer minExtent exceeds maxExtent.')
  const upper = Math.max(0, Math.min(max, available))
  const lower = Math.min(min, upper)
  const target =
    preferred ??
    drawerLength(props.preferredExtent ?? '24rem', available, font, root)
  return {
    extent: Math.max(lower, Math.min(target, upper)),
    min: lower,
    max: upper,
  }
}
export interface DrawerHostState {
  edge: UiDrawerEdge
  active: boolean
  extent: number
}
export const drawerHostKey: InjectionKey<{
  available: ComputedRef<{ width: number; height: number; minMain: number }>
  register(id: string, state: ComputedRef<DrawerHostState>): () => void
}> = Symbol('uninterface.drawer-layout')
