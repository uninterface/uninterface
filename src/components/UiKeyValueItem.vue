<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { inject } from 'vue'
  import View from '@uninterface/backend/UiKeyValueItem.vue'
  import { keyValueListKey } from '../presentation/key-value'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  defineProps<UiZOrderProps & { label: string }>()
  if (!inject(keyValueListKey, false))
    throw new Error('UiKeyValueItem requires UiKeyValueList.')
  provideStrategyView(useUiStrategyNode('key-value-item'))
</script>
<template>
  <View :label="label"><slot /></View>
</template>
