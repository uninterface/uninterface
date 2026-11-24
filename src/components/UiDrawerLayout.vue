<script lang="ts">
  import {
    computed,
    defineComponent,
    h,
    provide,
    shallowRef,
    watchEffect,
    type PropType,
  } from 'vue'
  import { useZAllocations } from '../stacking/allocation'
  import View from '@uninterface/backend/UiDrawerLayout.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { drawerHostKey, type DrawerHostState } from '../layout/drawer'
  import type { ComputedRef } from 'vue'
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  export default defineComponent({
    name: 'UiDrawerLayout',
    inheritAttrs: false,
    props: {
      height: {
        type: String as PropType<'content' | 'full'>,
        default: 'content',
      },
      minMainExtent: { type: Number, default: 96 },
      zOrder: Object as PropType<UiZOrderProps['zOrder']>,
    },
    setup(props, { slots, attrs }) {
      const z = useZComponent()
      const parts = useZAllocations(
        z.binding,
        () => ({ drawer: { above: ['main'] } }),
        ['main', 'drawer'],
      )
      provideStrategyView(useUiStrategyNode('drawer-layout'))
      assertUiCapabilities(uiBackend, ['drawer.docked.v1'])
      if (!slots.main || !slots.drawer)
        throw new Error('UiDrawerLayout requires main and drawer slots.')
      const registered = shallowRef<{
        id: string
        state: ComputedRef<DrawerHostState>
      }>()
      const metrics = shallowRef({ width: 0, height: 0 })
      provide(drawerHostKey, {
        available: computed(() => ({
          ...metrics.value,
          minMain: props.minMainExtent,
        })),
        register(id, state) {
          if (registered.value)
            throw new Error('UiDrawerLayout supports one drawer.')
          registered.value = { id, state }
          return () => {
            if (registered.value?.id === id) registered.value = undefined
          }
        },
      })
      const state = computed(() => registered.value?.state.value)
      watchEffect(() => {
        if (!Number.isFinite(props.minMainExtent) || props.minMainExtent < 0)
          throw new Error('UiDrawerLayout minMainExtent must be nonnegative.')
        if (!['content', 'full'].includes(props.height))
          throw new Error('Unsupported UiDrawerLayout height.')
      })
      function measure(width: number, height: number) {
        metrics.value = { width, height }
      }
      return () => {
        const zItems = parts.sync([
          { key: 'main', name: 'main' },
          { key: 'drawer', name: 'drawer' },
        ])
        return h(
          View,
          {
            ...attrs,
            height: props.height,
            edge: state.value?.edge ?? 'end',
            active: state.value?.active ?? false,
            extent: state.value?.extent ?? 0,
            measure,
            zItems,
          },
          {
            main: () => parts.wrap('main', slots.main!()),
            drawer: () => parts.wrap('drawer', slots.drawer!()),
          },
        )
      }
    },
  })
</script>
