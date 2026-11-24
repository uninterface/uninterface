import { h, nextTick, ref, shallowRef } from 'vue'
import Flow from '@uninterface/backend/CollectionHeaderFlow.vue'
import Part from '@uninterface/backend/CollectionHeaderPart.vue'
import UiButton from '../../components/UiButton.vue'
import UiIcon from '../../components/UiIcon.vue'
import type {
  UiCollectionHeaderAdaptation,
  UiCollectionHeaderViewContext,
} from '../header'
import { defaultFilterPresentation } from '../filter-context'
import { querySurface } from './coordination'
import { resetAction } from './reset'

const disclosureKey = Symbol('collection-header-disclosure')
const searchPresentation = {
  ...defaultFilterPresentation,
  usage: 'header-search',
}
type Panel = 'filters' | 'sort'

/** One query panel at a time, ahead of collection actions. */
export function CollectionHeaderNarrowExpandable(
  context: UiCollectionHeaderViewContext,
) {
  const state = context.state(disclosureKey, () => ({
    expanded: ref<Panel>(),
    switching: false,
    filters: shallowRef<InstanceType<typeof UiButton>>(),
    sort: shallowRef<InstanceType<typeof UiButton>>(),
  }))
  const query = querySurface(context)
  if (query.arrangement === 'long-row') state.expanded.value = undefined
  query.arrangement = 'narrow-expandable'
  const active = query.element.value?.ownerDocument.activeElement
  const focusedPart = (['filters', 'sort'] as const).find((part) =>
    query.element.value
      ?.querySelector(`[data-header-part="${part}"]`)
      ?.contains(active ?? null),
  )
  if (
    !state.switching &&
    focusedPart &&
    state.expanded.value !== focusedPart &&
    context.parts.includes(focusedPart)
  )
    void nextTick(() => state[focusedPart].value?.focus())
  const queryId = `${context.id}-query`
  const label = (part: Panel) =>
    part === 'filters' ? context.filterLabel : context.sortLabel
  const trigger = (part: Panel) => {
    if (!context.parts.includes(part)) return null
    const expanded = state.expanded.value === part
    const count =
      part === 'filters' ? context.activeFilterCount : context.activeSortCount
    return h(
      Part,
      { key: `${part}Trigger`, name: `${part}Trigger` },
      {
        default: () =>
          h(
            UiButton,
            {
              ref: state[part],
              variant: 'icon',
              'aria-expanded': expanded,
              'aria-controls': expanded ? queryId : undefined,
              'aria-label': label(part) + (count ? ` (${count})` : ''),
              color: count ? 'primary' : undefined,
              'data-ui-collection-query-toggle': part,
              'data-ui-collection-query-active': count ? '' : undefined,
              onClick: () => {
                const restore = query.element.value?.contains(
                  query.element.value.ownerDocument.activeElement,
                )
                state.switching = true
                state.expanded.value = expanded ? undefined : part
                void nextTick(() => {
                  state.switching = false
                  if (restore) void state[part].value?.focus()
                })
              },
            },
            {
              icon: () =>
                h(UiIcon, { name: part === 'filters' ? 'filter' : 'sort' }),
              default: () => label(part) + (count ? ` (${count})` : ''),
            },
          ),
      },
    )
  }
  const panel = state.expanded.value
  return h(
    Flow,
    { alignEditors: false },
    {
      default: () => [
        context.parts.includes('search') &&
          h(
            Part,
            { key: 'search', name: 'search', grow: true },
            { default: () => context.render('search', searchPresentation) },
          ),
        trigger('filters'),
        trigger('sort'),
        resetAction(context),
        panel &&
          context.parts.includes(panel) &&
          h(
            Part,
            {
              key: 'query',
              query: true,
              row: true,
              stacked: true,
              id: queryId,
              'aria-label': label(panel),
              element: (value: HTMLElement | undefined) => {
                query.element.value = value
              },
            },
            {
              default: () =>
                panel === 'filters'
                  ? context.renderPanel('filters')
                  : h(
                      Part,
                      { key: panel, name: panel, stacked: true },
                      { default: () => context.renderPanel(panel) },
                    ),
            },
          ),
        context.parts.includes('actions') &&
          h(
            Part,
            { key: 'actions', name: 'actions', row: true },
            { default: () => context.render('actions') },
          ),
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

export const collectionHeaderNarrowExpandable: UiCollectionHeaderAdaptation =
  /* @__PURE__ */ Object.freeze({
    name: 'narrow-expandable',
    view: CollectionHeaderNarrowExpandable,
  })
