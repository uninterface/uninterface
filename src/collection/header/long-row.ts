import { h, shallowRef } from 'vue'
import Flow from '@uninterface/backend/CollectionHeaderFlow.vue'
import Part from '@uninterface/backend/CollectionHeaderPart.vue'
import type {
  UiCollectionHeaderAdaptation,
  UiCollectionHeaderViewContext,
} from '../header'
import { querySurface } from './coordination'
import { resetAction } from './reset'

const allocationKey = Symbol('collection-header-actions')

/** Actual Vue composition. The native-backed pieces handle only their own surface. */
export function CollectionHeaderLongRow(
  context: UiCollectionHeaderViewContext,
) {
  const placement = context.state(allocationKey, () =>
    shallowRef<'filters' | 'sort' | 'after'>('filters'),
  )
  const query = querySurface(context)
  query.arrangement = 'long-row'
  const hasQueryEditors =
    context.parts.includes('sort') || context.parts.includes('filters')
  const actions = () =>
    context.parts.includes('actions') &&
    h(
      Part,
      {
        key: 'actions',
        name: 'actions',
        separate: true,
        row: placement.value === 'after',
      },
      { default: () => context.render('actions') },
    )
  return h(
    Flow,
    {
      alignEditors: true,
      placeActions: (value: 'filters' | 'sort' | 'after') => {
        placement.value = value
      },
    },
    {
      default: () => [
        context.parts.includes('search') &&
          h(
            Part,
            { key: 'search', name: 'search' },
            { default: () => context.render('search') },
          ),
        hasQueryEditors &&
          h(
            Part,
            {
              key: 'query',
              query: true,
              contents: true,
              id: `${context.id}-query`,
              'aria-label': context.queryLabel,
              element: (value: HTMLElement | undefined) => {
                query.element.value = value
              },
            },
            {
              default: () => [
                context.parts.includes('filters') &&
                  h(
                    Part,
                    { key: 'filters', name: 'filters', contents: true },
                    { default: () => context.render('filters') },
                  ),
                resetAction(context),
                placement.value === 'filters' && actions(),
                context.parts.includes('sort') &&
                  placement.value === 'sort' &&
                  h(Part, {
                    key: 'sort-break',
                    lineBreak: true,
                    'aria-hidden': 'true',
                  }),
                context.parts.includes('sort') &&
                  h(
                    Part,
                    {
                      key: 'sort',
                      name: 'sort',
                      row: placement.value !== 'sort',
                      stacked: true,
                      style:
                        placement.value === 'sort'
                          ? { inlineSize: 'max-content' }
                          : undefined,
                    },
                    { default: () => context.render('sort') },
                  ),
                placement.value !== 'filters' && actions(),
              ],
            },
          ),
        !hasQueryEditors && resetAction(context),
        !hasQueryEditors && actions(),
        context.parts.includes('info') &&
          h(
            Part,
            { key: 'info', name: 'info', row: true },
            { default: () => context.render('info') },
          ),
      ],
    },
  )
}

export const collectionHeaderLongRow: UiCollectionHeaderAdaptation =
  /* @__PURE__ */ Object.freeze({
    name: 'long-row',
    view: CollectionHeaderLongRow,
  })
