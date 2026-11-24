<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  defineProps<UiZOrderProps>()
  useZComponent()
  import { provide } from 'vue'
  import View from '@uninterface/backend/UiKeyValueList.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { keyValueListKey } from '../presentation/key-value'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  assertUiCapabilities(uiBackend, ['key-value.v1'])
  provide(keyValueListKey, true)
  provideStrategyView(useUiStrategyNode('key-value-list'))
</script>
<template>
  <View><slot /></View>
</template>
