<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { watchEffect } from 'vue'
  import View from '@uninterface/backend/UiBadge.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { assertThemeColor, type UiThemeColor } from '../presentation/theme'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const props = withDefaults(
    defineProps<UiZOrderProps & { color?: UiThemeColor }>(),
    {
      color: 'secondary',
    },
  )
  assertUiCapabilities(uiBackend, ['badge.v1'])
  provideStrategyView(useUiStrategyNode('badge'))
  watchEffect(() => assertThemeColor(uiBackend, props.color))
</script>
<template>
  <View :color="color"><slot /></View>
</template>
