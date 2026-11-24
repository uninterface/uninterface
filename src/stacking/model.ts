/** Pure ordering model: no framework, DOM, or toolkit dependencies. */
export type UiZBand = 'surface' | 'layer' | 'group' | 'local'
export interface UiZHandle {
  readonly id: symbol
  readonly domain: symbol
  readonly label: string
}
export type UiZOrder = {
  band?: UiZBand
  parent?: UiZHandle
} & (
  | { position?: number; above?: never; below?: never }
  | {
      position?: never
      above?: readonly UiZHandle[]
      below?: readonly UiZHandle[]
    }
)
export interface ZRegistration {
  /** Identity-only until explicitly ordered or referenced. */
  readonly passive?: boolean
  readonly handle: UiZHandle
  readonly band: UiZBand
  readonly parent?: UiZHandle
  readonly order?: UiZOrder
  /** Authored sequence, or opening sequence for surfaces. Never a CSS value. */
  readonly sequence?: number
  readonly source: string
}
export interface ZSlot {
  readonly band: UiZBand
  readonly depth: number
  readonly width: number
}
export interface ZResolved {
  readonly band: UiZBand
  readonly parent?: UiZHandle
  readonly order?: UiZOrder
  readonly sequence?: number
  readonly materialized: boolean
  readonly handle: UiZHandle
  readonly chain: readonly UiZHandle[]
  readonly digits: readonly number[]
  readonly value: number
  /** Constraint-derived elevation, before sequence tie-breaking. Presentation only. */
  readonly elevation: number
  readonly pending: readonly UiZHandle[]
  readonly source: string
}
export interface ZSnapshot {
  readonly version: number
  readonly slots: readonly ZSlot[]
  readonly entries: readonly ZResolved[]
}
export class UiZOrderError extends Error {
  constructor(
    readonly code:
      | 'declaration'
      | 'domain'
      | 'parent'
      | 'scope'
      | 'cycle'
      | 'budget'
      | 'realization'
      | 'disposed',
    message: string,
    readonly sources: readonly string[] = [],
  ) {
    super(
      `Uninterface z-order: ${message}${sources.length ? ` (${sources.join(', ')})` : ''}`,
    )
    this.name = 'UiZOrderError'
  }
}
export const zBands: readonly UiZBand[] = ['surface', 'layer', 'group', 'local']
