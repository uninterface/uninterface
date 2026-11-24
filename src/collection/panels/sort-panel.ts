import { h } from 'vue'
import SortSelect from './CollectionSortSelect.vue'
import SortPanel from './CollectionSortPanel.vue'
import type {
  UiCollectionPanelAdaptation,
  UiCollectionSortPanelContext,
} from '../panels'

export const collectionSortPanel: UiCollectionPanelAdaptation<UiCollectionSortPanelContext> =
  /* @__PURE__ */ Object.freeze({
    name: 'sort-panel',
    view: (context: UiCollectionSortPanelContext) =>
      h(context.binding.mode === 'single' ? SortSelect : SortPanel, {
        binding: context.binding,
      }),
  })
