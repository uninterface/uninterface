<script lang="ts">
  import {
    defineComponent,
    h,
    effectScope,
    provide,
    ref,
    useId,
    type PropType,
    type SlotsType,
    type VNode,
  } from 'vue'
  import { collectionFilterPanel } from '../collection/panels/filter-panel'
  import { collectionSortPanel } from '../collection/panels/sort-panel'
  import type {
    UiCollectionPanelAdaptation,
    UiCollectionFilterPanelContext,
    UiCollectionSortPanelContext,
  } from '../collection/panels'
  import type { UiCollectionSortBinding } from '../collection/sort'
  import type { UiButtonBinding } from '../bindings/button'
  import View from '@uninterface/backend/UiCollectionHeader.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { hasRegionContent } from '../layout/regions'
  import { availableHeightKey } from '../layout/hosting'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import { uiCollectionHeaderPresentationQuery } from '../strategy/collection-header'
  import {
    collectionHeaderLongRow,
    collectionHeaderNarrowExpandable,
  } from '../collection/header-adaptations'
  import type {
    UiCollectionHeaderPart,
    UiCollectionHeaderViewContext,
    UiCollectionHeaderContext,
  } from '../collection/header'
  import type {
    UiFilterPresentationContext,
    UiCollectionFilterBinding,
  } from '../collection/filter'
  import UiCollectionFilter from './UiCollectionFilter.vue'
  import { useZComponent } from '../stacking/runtime'
  import { zOrderProps } from '../stacking/props'
  import { useUiResponsive } from '../environment/context'
  import { useMessages } from '../i18n/messages'
  import {
    filterHostKey,
    defaultFilterPresentation,
  } from '../collection/filter-context'

  // Opaque business components inherit context without forwarding it. No session ownership.
  const QueryContext = defineComponent({
    props: {
      presentation: {
        type: Object as PropType<UiFilterPresentationContext>,
        required: true,
      },
      nodes: { type: Array as PropType<VNode[]>, required: true },
    },
    setup(props) {
      provide(filterHostKey, {
        get presentation() {
          return props.presentation
        },
        register: () => () => {},
      })
      return () => props.nodes
    },
  })
  const FilterPanelView = defineComponent({
    props: {
      context: {
        type: Object as PropType<UiCollectionFilterPanelContext>,
        required: true,
      },
      adaptation: {
        type: Object as PropType<
          UiCollectionPanelAdaptation<UiCollectionFilterPanelContext>
        >,
        required: true,
      },
    },
    setup: (props) => () => props.adaptation.view(props.context),
  })
  const defineSortPanel = defineComponent({
    props: {
      binding: {
        type: Object as PropType<UiCollectionSortBinding>,
        required: true,
      },
      adaptation: {
        type: Object as PropType<
          UiCollectionPanelAdaptation<UiCollectionSortPanelContext>
        >,
        required: true,
      },
    },
    setup: (props) => () => props.adaptation.view({ binding: props.binding }),
  })
  const names = ['search', 'actions', 'filters', 'sort', 'info'] as const
  type Part = (typeof names)[number]
  export default defineComponent({
    name: 'UiCollectionHeader',
    inheritAttrs: false,
    props: {
      ...zOrderProps,
      queryLabel: String,
      sortBinding: Object as PropType<UiCollectionSortBinding>,
      filterBindings: Array as PropType<readonly UiCollectionFilterBinding[]>,
      filterPanel: {
        type: Object as PropType<
          UiCollectionPanelAdaptation<UiCollectionFilterPanelContext>
        >,
        default: () => collectionFilterPanel,
      },
      sortPanel: {
        type: Object as PropType<
          UiCollectionPanelAdaptation<UiCollectionSortPanelContext>
        >,
        default: () => collectionSortPanel,
      },
      activeFilterCount: { type: Number, default: 0 },
      activeSortCount: Number,
      filterLabel: String,
      sortLabel: String,
      resetLabel: String,
      reset: Object as PropType<UiButtonBinding>,
    },
    slots: Object as SlotsType<Partial<Record<Part, () => VNode[]>>>,
    setup(props, { attrs, slots }) {
      useZComponent()
      const strategy = useUiStrategyNode('collection-header')
      provideStrategyView(strategy)
      provide(availableHeightKey, ref(undefined))
      assertUiCapabilities(uiBackend, ['collection.header.v1'])
      const messages = useMessages('collections')
      const { context } = useUiResponsive()
      const id = `collection-header-${useId()}`
      const lifetime = effectScope()
      const states = new Map<symbol, unknown>()
      function state<T>(key: symbol, initialize: () => T): T {
        if (!states.has(key)) states.set(key, lifetime.run(initialize))
        return states.get(key) as T
      }
      return () => {
        if (!messages.ready.value) return null
        for (const name of ['activeFilterCount', 'activeSortCount'] as const)
          if (
            props[name] !== undefined &&
            (!Number.isSafeInteger(props[name]) || props[name]! < 0)
          )
            throw new Error(
              `UiCollectionHeader ${name} must be a nonnegative safe integer.`,
            )
        if (props.reset && props.reset.type !== 'button')
          throw new Error(
            'UiCollectionHeader reset requires an ordinary action button binding.',
          )
        // Evaluate each business slot once, within render; keep opaque descendants opaque.
        const nodes: Partial<Record<Part, VNode[]>> = {}
        for (const name of names) {
          const value = slots[name]?.() ?? []
          if (hasRegionContent(value)) nodes[name] = value
        }
        if (!nodes.filters && props.filterBindings?.length)
          nodes.filters = props.filterBindings.map((binding) =>
            h(UiCollectionFilter, { key: binding.key, binding }),
          )
        if (props.sortBinding && props.sortBinding.target !== 'collection-sort')
          throw new Error(
            'UiCollectionHeader requires a collection-sort binding.',
          )
        if (props.sortBinding?.fields.length && !nodes.sort)
          nodes.sort = [
            h(defineSortPanel, {
              binding: props.sortBinding,
              adaptation: props.sortPanel,
            }),
          ]
        const selectionContext: UiCollectionHeaderContext = Object.freeze({
          environment: context.value,
          parts: Object.freeze(Object.keys(nodes) as Part[]),
          activeFilterCount: props.activeFilterCount,
          activeSortCount:
            props.activeSortCount ?? props.sortBinding?.sort.length ?? 0,
        })
        const selected = strategy.resolve(
          uiCollectionHeaderPresentationQuery,
          (value) =>
            typeof value === 'function' ||
            (!!value && typeof value.view === 'function'),
          selectionContext,
        )
        const adaptation =
          selected.status === 'answered' && typeof selected.value !== 'function'
            ? selected.value
            : context.value === 'mobile'
              ? collectionHeaderNarrowExpandable
              : collectionHeaderLongRow
        if (!Object.keys(nodes).length && !props.reset) return null
        const renderRaw = (
          part: Part,
          presentation = defaultFilterPresentation,
        ) =>
          nodes[part]
            ? h(QueryContext, { key: part, nodes: nodes[part]!, presentation })
            : null
        const filterContext = {
          bindings: props.filterBindings,
          render: (presentation: UiFilterPresentationContext) =>
            renderRaw('filters', presentation),
        }
        // Search joins visible desktop fields; badge/sort-only headers keep it compact.
        const searchPresentation: UiFilterPresentationContext =
          context.value !== 'mobile' &&
          nodes.filters &&
          props.filterPanel === collectionFilterPanel
            ? defaultFilterPresentation
            : { ...defaultFilterPresentation, usage: 'header-search' }
        const viewContext: UiCollectionHeaderViewContext = {
          ...selectionContext,
          id,
          queryLabel: props.queryLabel ?? messages.value.collectionQuery,
          filterLabel: props.filterLabel ?? messages.value.collectionFilters,
          sortLabel: props.sortLabel ?? messages.value.collectionSort,
          resetLabel: props.resetLabel ?? messages.value.collectionReset,
          reset: props.reset,
          state,
          renderPanel: (part) =>
            part === 'filters'
              ? props.filterPanel === collectionFilterPanel
                ? // Match long-row's direct keyed Part → QueryContext path so
                  // widening an expanded default panel retains its editor/focus.
                  collectionFilterPanel.view(filterContext)
                : h(FilterPanelView, {
                    context: filterContext,
                    adaptation: props.filterPanel,
                  })
              : viewContext.render('sort', {
                  ...defaultFilterPresentation,
                  usage: 'filter-form',
                  container: 'panel',
                  arrangement: 'stacked',
                }),
          render: (
            part,
            presentation = part === 'search'
              ? searchPresentation
              : defaultFilterPresentation,
          ) =>
            part === 'filters' &&
            props.filterBindings &&
            props.filterPanel !== collectionFilterPanel
              ? h(FilterPanelView, {
                  context: filterContext,
                  adaptation: props.filterPanel,
                })
              : renderRaw(part, presentation),
        }
        // Render directly in the stable host boundary. Vue reconciles the returned tree;
        // swapping function identity alone does not remount retained editors.
        const presentation = adaptation.view(viewContext)
        return h(
          View,
          { ...attrs, adaptation: adaptation.name },
          {
            default: () => presentation,
          },
        )
      }
    },
  })
</script>
