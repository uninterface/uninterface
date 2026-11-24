import type { VNode, VNodeChild } from 'vue'
import type { UiButtonBinding } from '../bindings/button'
import type { UiResponsiveContext } from '../environment/context'
import type { UiFilterPresentationContext } from './filter'

export type UiCollectionHeaderPart =
  | 'search'
  | 'filters'
  | 'sort'
  | 'actions'
  | 'info'

export interface UiCollectionHeaderContext {
  readonly environment: UiResponsiveContext
  readonly parts: readonly UiCollectionHeaderPart[]
  readonly activeFilterCount: number
  readonly activeSortCount: number
}

/** Runtime services for a Vue render implementation; no prescribed layout tree. */
export interface UiCollectionHeaderViewContext
  extends UiCollectionHeaderContext {
  readonly id: string
  readonly queryLabel: string
  readonly filterLabel: string
  readonly sortLabel: string
  readonly resetLabel: string
  readonly reset?: UiButtonBinding
  /** Render a provided slot once, optionally supplying its filter presentation context. */
  render(
    part: UiCollectionHeaderPart,
    presentation?: UiFilterPresentationContext,
  ): VNode | null
  /** Present a supplied query part using its selected reusable panel adaptation. */
  renderPanel(part: 'filters' | 'sort'): VNodeChild
  /** Lazy state belongs to this header mount, shared by implementations using the same symbol. */
  state<T>(key: symbol, initialize: () => T): T
}

/** A presentation is implemented as a Vue render function, not a layout description. */
export interface UiCollectionHeaderAdaptation {
  readonly name: string
  readonly view: (context: UiCollectionHeaderViewContext) => VNodeChild
}

export type UiCollectionHeaderSelection =
  | UiCollectionHeaderAdaptation
  | ((
      context: UiCollectionHeaderContext,
    ) => UiCollectionHeaderAdaptation | undefined)
