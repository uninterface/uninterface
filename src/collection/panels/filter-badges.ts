import { h } from 'vue'
import FilterBadges from './CollectionFilterBadges.vue'
import type {
  UiCollectionPanelAdaptation,
  UiCollectionFilterPanelContext,
} from '../panels'
export const collectionFilterBadges: UiCollectionPanelAdaptation<UiCollectionFilterPanelContext> =
  /* @__PURE__ */ Object.freeze({
    name: 'filter-badges',
    view: (context: UiCollectionFilterPanelContext) => {
      if (!context.bindings)
        throw new Error(
          'collectionFilterBadges requires explicit filter bindings.',
        )
      return h(FilterBadges, { bindings: context.bindings })
    },
  })
