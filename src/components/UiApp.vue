<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const strategyNode = useUiStrategyNode('app')
  provideStrategyView(strategyNode)
  import { provide, ref, watchEffect } from 'vue'
  import View from '@uninterface/backend/UiApp.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { availableHeightKey, type UiAppHosting } from '../layout/hosting'

  const props = withDefaults(
    defineProps<UiZOrderProps & { hosting?: UiAppHosting }>(),
    {
      hosting: 'document',
    },
  )
  const availableHeight = ref<number>()
  provide(availableHeightKey, availableHeight)
  watchEffect(() => {
    if (!['document', 'viewport'].includes(props.hosting))
      throw new Error('UiApp: unsupported hosting.')
    assertUiCapabilities(uiBackend, [
      'app.root.v1',
      ...(props.hosting === 'viewport' ? ['hosting.viewport.v1'] : []),
    ])
    availableHeight.value = props.hosting === 'viewport' ? 0 : undefined
  })
</script>

<template>
  <View
    :hosting="hosting"
    @available-height="availableHeight = $event"
  >
    <slot />
  </View>
</template>
