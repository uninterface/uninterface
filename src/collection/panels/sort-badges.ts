import { h } from 'vue'
import SortBadges from './CollectionSortBadges.vue'
import type {
  UiCollectionPanelAdaptation,
  UiCollectionSortPanelContext,
} from '../panels'
export const collectionSortBadges: UiCollectionPanelAdaptation<UiCollectionSortPanelContext> =
  /* @__PURE__ */ Object.freeze({
    name: 'sort-badges',
    view: (context: UiCollectionSortPanelContext) =>
      h(SortBadges, { binding: context.binding }),
  })
