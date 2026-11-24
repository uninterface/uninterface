import { h } from 'vue'
import Part from '@uninterface/backend/CollectionHeaderPart.vue'
import type {
  UiCollectionPanelAdaptation,
  UiCollectionFilterPanelContext,
} from '../panels'
import { defaultFilterPresentation } from '../filter-context'

const presentation = Object.freeze({
  ...defaultFilterPresentation,
  usage: 'filter-form',
  container: 'panel' as const,
  arrangement: 'stacked' as const,
})
export const collectionFilterPanel: UiCollectionPanelAdaptation<UiCollectionFilterPanelContext> =
  /* @__PURE__ */ Object.freeze({
    name: 'filter-panel',
    view: (context: UiCollectionFilterPanelContext) =>
      h(
        Part,
        {
          key: 'filters',
          name: 'filters',
          stacked: true,
          'data-ui-collection-filter-panel': '',
        },
        { default: () => context.render(presentation) },
      ),
  })
