<script lang="ts">
  import { defineComponent, h, type SlotsType, type VNode } from 'vue'
  import { createLinearLayout } from '../layout/create-linear-layout'
  import { zLayoutProps } from '../stacking/props'
  import { useZComponent } from '../stacking/runtime'
  import { useUiZView } from '../stacking/view'

  const StartEndAllocation = /* @__PURE__ */ createLinearLayout(
    'peers',
    'start-end',
  )

  export default defineComponent({
    name: 'UiStartEndLayout',
    inheritAttrs: false,
    props: zLayoutProps,
    slots: Object as SlotsType<{
      start?: () => VNode[]
      end?: () => VNode[]
    }>,
    setup(props, { attrs, slots }) {
      useZComponent()
      useUiZView({ self: true })
      return () => {
        for (const name of Object.keys(slots)) {
          if (name !== 'start' && name !== 'end')
            throw new Error(`UiStartEndLayout: unsupported slot ${name}.`)
        }
        return h(
          StartEndAllocation,
          {
            ...attrs,
            zParts: props.zParts,
            direction: 'horizontal',
            align: 'center',
            division: 'content',
            width: 'full',
            height: 'content',
            scroll: 'none',
            wrap: true,
          },
          slots,
        )
      }
    },
  })
</script>
