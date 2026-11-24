import { h } from 'vue'
import SortSelect from './CollectionSortSelect.vue'
import type {
  UiCollectionPanelAdaptation,
  UiCollectionSortPanelContext,
} from '../panels'

/** A field/no-sort selector for a source restricted to one sort rule. */
export const collectionSortSelect: UiCollectionPanelAdaptation<UiCollectionSortPanelContext> =
  /* @__PURE__ */ Object.freeze({
    name: 'sort-select',
    view: (context: UiCollectionSortPanelContext) =>
      h(SortSelect, { binding: context.binding }),
  })
