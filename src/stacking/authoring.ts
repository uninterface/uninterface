import type { UiZBand, UiZHandle } from './model'
/** An issued handle, registered component instance, or a Vue template ref containing either. */
export type UiZReference = object | null | undefined
export type UiZOrder = {
  band?: UiZBand
  parent?: UiZReference
  layer?: string
} & (
  | { position?: number; above?: never; below?: never }
  | {
      position?: never
      above?: readonly UiZReference[]
      below?: readonly UiZReference[]
    }
)
export type UiZPartSelector = string | number | UiZReference
export type UiZPartOrder = { band?: UiZBand } & (
  | { position?: number; above?: never; below?: never }
  | {
      position?: never
      above?: readonly UiZPartSelector[]
      below?: readonly UiZPartSelector[]
    }
)
export type UiZParts =
  | Readonly<Record<string, UiZPartOrder>>
  | readonly { part: UiZPartSelector; order: UiZPartOrder }[]
export interface UiZOrderProps {
  zOrder?: UiZOrder
}
export interface UiZLayoutProps extends UiZOrderProps {
  zParts?: UiZParts
}
export type { UiZBand, UiZHandle }
