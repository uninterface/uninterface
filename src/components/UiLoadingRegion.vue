<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import View from '@uninterface/backend/UiLoadingRegion.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useMessages } from '../i18n/messages'
  import type { UiLoadingSurface } from '../loading/surface'
  defineProps<UiZOrderProps & { surface: UiLoadingSurface; loading: boolean }>()
  assertUiCapabilities(uiBackend, ['loading.region.v1'])
  provideStrategyView(useUiStrategyNode('loading-region'))
  const messages = useMessages()
</script>
<template>
  <View
    :surface="surface"
    :loading="loading"
    :label="messages.loadingIndicator"
  >
    <template
      v-if="$slots.default"
      #default
    >
      <slot />
    </template>
  </View>
</template>
