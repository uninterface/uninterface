<script lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import { zOrderProps } from '../stacking/props'

  import { defineComponent, h, provide, ref, type PropType } from 'vue'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import View from '@uninterface/backend/UiContent.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { availableHeightKey } from '../layout/hosting'
  import { resolveContent, type UiContentProps } from '../layout/content'

  export default defineComponent({
    name: 'UiContent',
    inheritAttrs: false,
    props: {
      ...zOrderProps,
      inset: String as PropType<UiContentProps['inset']>,
      height: String as PropType<UiContentProps['height']>,
      scroll: String as PropType<UiContentProps['scroll']>,
      ariaLabel: String,
    },
    setup(props, { attrs, slots }) {
      useZComponent()
      provideStrategyView(useUiStrategyNode('content'))
      // Never pass an enclosing app's unadjusted offer through content insets.
      // Full height consumes a CSS allocation; numeric grouped offers stay separate.
      provide(availableHeightKey, ref(undefined))
      return () => {
        const view = resolveContent({ ...props, 'aria-label': props.ariaLabel })
        assertUiCapabilities(uiBackend, [
          'content.inset.v1',
          ...(view.scroll !== 'none' || view.height === 'full'
            ? ['content.scroll.v1']
            : []),
        ])
        return h(View, { ...attrs, ...view }, slots)
      }
    },
  })
</script>
