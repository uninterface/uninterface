<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import View from '@uninterface/backend/UiSegmentedSelect.vue'
  import { useChoiceGroup, type ChoiceGroupProps } from './internal/choiceGroup'
  defineOptions({ inheritAttrs: false })
  provideStrategyView(useUiStrategyNode('selection-editor'))
  const props = withDefaults(defineProps<UiZOrderProps & ChoiceGroupProps>(), {
    autoLoad: true,
    orientation: 'horizontal',
  })
  assertUiCapabilities(uiBackend, [
    'input.segmented-select.v1',
    'control.focus.v1',
  ])
  const { view, presentation, choose, blur, focus, messagesReady } =
    useChoiceGroup(props, false, 'single')
  defineExpose({ focus })
</script>
<template>
  <View
    v-if="messagesReady"
    ref="view"
    v-bind="{ ...$attrs, ...presentation }"
    @choose="choose"
    @blur="blur"
  />
</template>
