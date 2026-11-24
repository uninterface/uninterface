import type { VNodeChild } from 'vue'
import type {
  UiFilterPresentationContext,
  UiCollectionFilterBinding,
} from './filter'
import type { UiCollectionSortBinding } from './sort'

/** A reusable presentation implementation; the host owns placement and disclosure. */
export interface UiCollectionPanelAdaptation<Context> {
  readonly name: string
  readonly view: (context: Context) => VNodeChild
}
export interface UiCollectionFilterPanelContext {
  /** Enumerated eligible filters for presentations such as badge lists. */
  readonly bindings?: readonly UiCollectionFilterBinding[]
  /** Render the supplied non-search filters once, with inherited editor context. */
  render(presentation: UiFilterPresentationContext): VNodeChild
}
export interface UiCollectionSortPanelContext {
  readonly binding: UiCollectionSortBinding
}
