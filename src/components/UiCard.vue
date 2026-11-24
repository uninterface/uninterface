<script lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import { zOrderProps } from '../stacking/props'

  import {
    defineComponent,
    h,
    provide,
    ref,
    type PropType,
    type SlotsType,
    type VNode,
  } from 'vue'
  import { useMessages } from '../i18n/messages'
  import View from '@uninterface/backend/UiCard.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import { uiHierarchyLevelQuery } from '../strategy/common'
  import { uiCardPresentationQuery } from '../strategy/card'
  import {
    isCardPresentation,
    resolveCardPresentation,
  } from '../presentation/card'
  import { assertThemeColor, type UiThemeColor } from '../presentation/theme'
  import {
    hierarchyLevels,
    type UiHierarchyLevel,
  } from '../presentation/hierarchy'
  import { availableHeightKey } from '../layout/hosting'
  import { hasRegionContent } from '../layout/regions'

  export default defineComponent({
    name: 'UiCard',
    inheritAttrs: false,
    props: {
      ...zOrderProps,
      loading: Boolean,
      level: Number as PropType<UiHierarchyLevel>,
      color: {
        type: String as PropType<UiThemeColor | null>,
        default: undefined,
      },
    },
    slots: Object as SlotsType<{
      header?: () => VNode[]
      title?: () => VNode[]
      description?: () => VNode[]
      default?: () => VNode[]
      layout?: () => VNode[]
      footer?: () => VNode[]
      'top-end'?: () => VNode[]
    }>,
    setup(props, { slots, attrs }) {
      useZComponent()
      assertUiCapabilities(uiBackend, [
        'card.v1',
        'loading.region.v1',
        'strategy.hierarchy-level.v1',
        'card.color.v1',
        'strategy.card-presentation.v1',
      ])
      const messages = useMessages()
      const node = useUiStrategyNode('card')
      provideStrategyView(node)
      const preference = node.query(uiHierarchyLevelQuery, hierarchyLevels)
      const presentation = node.query(
        uiCardPresentationQuery,
        isCardPresentation,
      )
      // A content-height frame cannot pass an unchanged outer height to its body.
      provide(availableHeightKey, ref(undefined))
      return () => {
        if (props.level !== undefined && !hierarchyLevels.includes(props.level))
          throw new Error(
            `UiCard: unsupported hierarchy level ${String(props.level)}.`,
          )
        const level =
          props.level ??
          (preference.value.status === 'answered' ? preference.value.value : 0)
        const treatment = resolveCardPresentation(
          presentation.value.status === 'answered'
            ? presentation.value.value
            : {},
        )[level]
        const color = props.color === undefined ? treatment.color : props.color
        if (color !== null) assertThemeColor(uiBackend, color)
        const bodyLayout = slots.layout !== undefined
        const body = slots.default?.() ?? []
        if (bodyLayout && hasRegionContent(body))
          throw new Error('UiCard: use either the default or layout body slot.')
        const content = bodyLayout ? slots.layout?.() : body
        const header = slots.header?.() ?? []
        const title = slots.title?.() ?? []
        const description = slots.description?.() ?? []
        const footer = slots.footer?.() ?? []
        const topEnd = slots['top-end']?.() ?? []
        return h(
          View,
          {
            ...attrs,
            level,
            color,
            treatment,
            bodyLayout,
            loading: props.loading,
            loadingLabel: messages.value.loadingIndicator,
          },
          {
            default: () => content,
            ...(hasRegionContent(header) ? { header: () => header } : {}),
            ...(!hasRegionContent(header) && hasRegionContent(title)
              ? { title: () => title }
              : {}),
            ...(!hasRegionContent(header) && hasRegionContent(description)
              ? { description: () => description }
              : {}),
            ...(hasRegionContent(footer) ? { footer: () => footer } : {}),
            ...(hasRegionContent(topEnd) ? { 'top-end': () => topEnd } : {}),
          },
        )
      }
    },
  })
</script>
