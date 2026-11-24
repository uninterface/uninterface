<script lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import { zOrderProps } from '../stacking/props'

  import { defineComponent, type SlotsType, type VNode } from 'vue'
  /** Logical declaration consumed by UiTabs; the backend renders the trigger. */
  export default defineComponent({
    name: 'UiTab',
    props: {
      ...zOrderProps,
      value: { type: String, required: true },
      disabled: Boolean,
    },
    slots: Object as SlotsType<{
      default: (state: { selected: boolean; disabled: boolean }) => VNode[]
    }>,
    setup(): () => null {
      throw new Error(
        'UiTab must be a direct declaration inside UiTabs (fragments and v-for are supported).',
      )
    },
  })
</script>
