import { h } from 'vue'
import {
  UiLayout,
  type UiCollectionPanelAdaptation,
  type UiCollectionFilterPanelContext,
  type UiFilterPresentationContext,
} from '@uninterface/uninterface'

const presentation: UiFilterPresentationContext = Object.freeze({
  usage: 'filter-row',
  container: 'inline',
  labelProvided: false,
  summaryProvided: false,
  arrangement: 'single-row',
  submission: 'individual',
})

// Example policy: even inside a disclosure, render filters as a wrapping row.
// This arranges the supplied filters; it does not change their internal views.
export const inlineFilters: UiCollectionPanelAdaptation<UiCollectionFilterPanelContext> =
  Object.freeze({
    name: 'application-inline-filters',
    view: (context: UiCollectionFilterPanelContext) =>
      h(
        UiLayout,
        {
          direction: 'horizontal',
          wrap: true,
          align: 'baseline',
        },
        {
          default: () => context.render(presentation),
        },
      ),
  })
