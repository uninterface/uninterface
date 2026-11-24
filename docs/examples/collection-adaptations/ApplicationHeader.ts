import { defineComponent, h, type PropType } from 'vue'
import {
  UiLayout,
  UiButton,
  UiIcon,
  type UiCollectionHeaderAdaptation,
  type UiCollectionHeaderViewContext,
  type UiFilterPresentationContext,
} from '@uninterface/uninterface'

const row: UiFilterPresentationContext = Object.freeze({
  usage: 'filter-row',
  container: 'inline',
  labelProvided: false,
  summaryProvided: false,
  arrangement: 'single-row',
  submission: 'individual',
})
const search: UiFilterPresentationContext = Object.freeze({
  ...row,
  usage: 'header-search',
})

// This application presentation keeps query controls visible and gives actions
// their own following row. It adds no disclosure or business-state owner.
const ApplicationHeader = defineComponent({
  props: {
    context: {
      type: Object as PropType<UiCollectionHeaderViewContext>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const context = props.context
      const has = (part: (typeof context.parts)[number]) =>
        context.parts.includes(part)
      return h(
        UiLayout,
        {},
        {
          default: () => [
            (has('search') || has('filters') || context.reset) &&
              h(
                UiLayout,
                { direction: 'horizontal', wrap: true, align: 'baseline' },
                {
                  default: () => [
                    has('search') &&
                      context.render('search', has('filters') ? row : search),
                    has('filters') && context.render('filters', row),
                    context.reset &&
                      h(
                        UiButton,
                        { binding: context.reset, variant: 'icon' },
                        {
                          icon: () => h(UiIcon, { name: 'reset' }),
                          default: () => context.resetLabel,
                        },
                      ),
                  ],
                },
              ),
            has('sort') && context.renderPanel('sort'),
            has('actions') &&
              h(
                UiLayout,
                { direction: 'horizontal', wrap: true },
                {
                  default: () => context.render('actions'),
                },
              ),
            has('info') && context.render('info'),
          ],
        },
      )
    }
  },
})

// Stable object: two strategies returning it agree, even with different selectors.
export const applicationHeader: UiCollectionHeaderAdaptation = Object.freeze({
  name: 'application-visible-query',
  view: (context: UiCollectionHeaderViewContext) =>
    h(ApplicationHeader, { context }),
})
