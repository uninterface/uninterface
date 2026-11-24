<script lang="ts">
  import {
    defineComponent,
    h,
    provide,
    ref,
    type SlotsType,
    type VNode,
  } from 'vue'
  import View from '@uninterface/backend/UiCollectionFooter.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { hasRegionContent } from '../layout/regions'
  import { availableHeightKey } from '../layout/hosting'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import { useZComponent } from '../stacking/runtime'
  import { zOrderProps } from '../stacking/props'

  export default defineComponent({
    name: 'UiCollectionFooter',
    inheritAttrs: false,
    props: zOrderProps,
    slots: Object as SlotsType<{
      info?: () => VNode[]
      size?: () => VNode[]
      paginator?: () => VNode[]
      jumper?: () => VNode[]
    }>,
    setup(_props, { attrs, slots }) {
      useZComponent()
      provideStrategyView(useUiStrategyNode('collection-footer'))
      provide(availableHeightKey, ref(undefined))
      assertUiCapabilities(uiBackend, ['collection.footer.v1'])
      return () => {
        const content: Record<string, () => VNode[]> = {}
        for (const name of ['info', 'size', 'paginator', 'jumper'] as const) {
          const nodes = slots[name]?.() ?? []
          if (hasRegionContent(nodes)) content[name] = () => nodes
        }
        return Object.keys(content).length ? h(View, attrs, content) : null
      }
    },
  })
</script>
