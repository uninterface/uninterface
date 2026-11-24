<script lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import { zOrderProps } from '../stacking/props'

  import { defineComponent, h, type SlotsType, type VNode } from 'vue'
  import { computed, inject, provide, type PropType } from 'vue'
  import {
    useNavigationBoundary,
    navigationBoundaryKey,
    type NavigationBoundaryHost,
  } from '../navigation/boundary'
  import View from '@uninterface/backend/UiNavbar.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'

  const NavigationContent = defineComponent({
    props: {
      boundary: {
        type: Object as PropType<NavigationBoundaryHost>,
        required: true,
      },
    },
    setup(props, { slots }) {
      provide(navigationBoundaryKey, () => props.boundary)
      return () => slots.default?.()
    },
  })

  export default defineComponent({
    name: 'UiNavbar',
    inheritAttrs: false,
    slots: Object as SlotsType<{
      brand?: () => VNode[]
      default?: () => VNode[]
      actions?: () => VNode[]
    }>,
    setup(_, { attrs, slots }) {
      assertUiCapabilities(uiBackend, ['navbar.v1'])
      const host = inject(navigationBoundaryKey, () => undefined)
      const orientation = computed(() => host()?.axis ?? 'horizontal')
      const boundary = useNavigationBoundary(
        () => orientation.value === 'horizontal',
      )
      const contentBoundary = computed<NavigationBoundaryHost>(() => ({
        axis: orientation.value,
        edge: host()?.edge ?? 'block-end',
      }))
      return () =>
        h(
          View,
          {
            ...attrs,
            'data-navigation-boundary': boundary.value,
            'data-navbar-orientation': orientation.value,
          },
          {
            ...slots,
            default: slots.default
              ? () =>
                  h(
                    NavigationContent,
                    { boundary: contentBoundary.value },
                    { default: slots.default },
                  )
              : undefined,
          },
        )
    },
  })
</script>
