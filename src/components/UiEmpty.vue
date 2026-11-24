<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  defineProps<UiZOrderProps>()
  useZComponent()
  import type { VNode } from 'vue'
  import View from '@uninterface/backend/UiEmpty.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useMessages } from '../i18n/messages'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  assertUiCapabilities(uiBackend, ['empty.v1'])
  provideStrategyView(useUiStrategyNode('empty'))
  const messages = useMessages()
  defineSlots<{
    default?(): VNode[]
    icon?(): VNode[]
    actions?(): VNode[]
  }>()
</script>
<template>
  <View :label="messages.emptyMessage">
    <template #default><slot /></template>
    <template
      v-if="$slots.icon"
      #icon
    >
      <slot name="icon" />
    </template>
    <template
      v-if="$slots.actions"
      #actions
    >
      <slot name="actions" />
    </template>
  </View>
</template>
