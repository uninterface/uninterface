<script lang="ts">
  import { useUiZView } from '../stacking/view'
  import { useZComponent } from '../stacking/runtime'
  import { zLayoutProps } from '../stacking/props'

  import {
    defineComponent,
    h,
    type PropType,
    type SlotsType,
    type VNode,
  } from 'vue'
  import UiLayout from './UiLayout.vue'
  import type { UiFlowLayoutProps } from '../layout/flow'

  export default defineComponent({
    name: 'UiFlowLayout',
    inheritAttrs: false,
    props: {
      ...zLayoutProps,
      direction: String as PropType<UiFlowLayoutProps['direction']>,
      align: String as PropType<UiFlowLayoutProps['align']>,
      width: String as PropType<UiFlowLayoutProps['width']>,
      height: String as PropType<UiFlowLayoutProps['height']>,
      wrap: { type: Boolean, default: undefined },
      scroll: String as PropType<UiFlowLayoutProps['scroll']>,
      ariaLabel: String,
    },
    slots: Object as SlotsType<{ default?: () => VNode[] }>,
    setup(props, { slots, attrs }) {
      useZComponent()
      useUiZView({ self: true })
      return () => {
        if ('division' in attrs)
          throw new Error(
            'UiFlowLayout: content allocation is fixed; use UiLayout for division.',
          )
        if (Object.keys(slots).some((name) => name !== 'default'))
          throw new Error('UiFlowLayout: only the default slot is supported.')
        return h(
          UiLayout,
          {
            ...attrs,
            ...props,
            zOrder: undefined,
            division: 'content',
            'aria-label': props.ariaLabel,
          },
          slots,
        )
      }
    },
  })
</script>
