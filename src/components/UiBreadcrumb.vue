<script lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import { zOrderProps } from '../stacking/props'

  import { defineComponent, type PropType } from 'vue'
  import type { UiLinkBinding } from '../navigation/control'
  export default defineComponent({
    name: 'UiBreadcrumb',
    props: {
      ...zOrderProps,
      href: String,
      binding: Object as PropType<UiLinkBinding>,
      disabled: Boolean,
    },
    setup(): () => null {
      throw new Error(
        'UiBreadcrumb must be a direct declaration inside UiBreadcrumbs.',
      )
    },
  })
</script>
