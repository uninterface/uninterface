<script setup lang="ts">
  import { computed } from 'vue'
  import View from '@uninterface/backend/UiProgressBar.vue'
  import { uiBackend } from '@uninterface/backend'
  import { useZComponent } from '../stacking/runtime'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { assertThemeColor } from '../presentation/theme'
  import {
    resolveProgressBar,
    type UiProgressBarProps,
  } from '../presentation/progress'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'

  useZComponent()
  // Vue normalizes kebab-case prop names before exposing the props object.
  const props = defineProps<UiProgressBarProps>()
  const normalized = props as unknown as {
    ariaLabel: string
    ariaValuetext?: string
  }
  const resolved = computed(() => {
    const bar = resolveProgressBar({
      ...props,
      'aria-label': normalized.ariaLabel,
      'aria-valuetext': normalized.ariaValuetext,
    })
    assertThemeColor(uiBackend, bar.color)
    return bar
  })
  provideStrategyView(useUiStrategyNode('progress-bar'))
  assertUiCapabilities(uiBackend, ['progress.bar.v1'])
</script>
<template>
  <View v-bind="resolved" />
</template>
