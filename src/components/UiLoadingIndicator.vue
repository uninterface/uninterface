<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  defineProps<UiZOrderProps>()
  useZComponent()
  import View from '@uninterface/backend/UiLoadingIndicator.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useMessages } from '../i18n/messages'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  assertUiCapabilities(uiBackend, ['loading.indicator.v1'])
  provideStrategyView(useUiStrategyNode('loading-indicator'))
  const messages = useMessages()
</script>
<template>
  <View :label="messages.loadingIndicator"><slot /></View>
</template>
