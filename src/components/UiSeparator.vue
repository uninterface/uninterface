<script lang="ts">
  import { defineComponent } from 'vue'
  import { layoutSeparator } from '../layout/separator'

  export default /* @__PURE__ */ Object.assign(
    defineComponent({
      name: 'UiSeparator',
      setup(): () => null {
        throw new Error(
          'UiSeparator must be a direct UiLayout or UiFlowLayout child.',
        )
      },
    }),
    { [layoutSeparator]: true },
  )
</script>
