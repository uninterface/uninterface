import { h } from 'vue'
import Part from '@uninterface/backend/CollectionHeaderPart.vue'
import UiButton from '../../components/UiButton.vue'
import UiIcon from '../../components/UiIcon.vue'
import type { UiCollectionHeaderViewContext } from '../header'

/** The business binding owns clearing and availability; the header owns placement. */
export function resetAction(context: UiCollectionHeaderViewContext) {
  return context.reset
    ? h(
        Part,
        { key: 'reset', name: 'reset' },
        {
          default: () =>
            h(
              UiButton,
              {
                binding: context.reset,
                variant: 'icon',
                'data-ui-collection-reset': '',
              },
              {
                icon: () => h(UiIcon, { name: 'reset' }),
                default: () => context.resetLabel,
              },
            ),
        },
      )
    : null
}
