<script setup lang="ts">
  import { useCheckableField } from '../controls/context'
  useCheckableField()
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const strategyNode = useUiStrategyNode('switch-editor')
  provideStrategyView(strategyNode)
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { computed, ref } from 'vue'

  import type { UiFocusHandle } from '../backend'
  import { focusControl } from './internal/focus'
  import View from '@uninterface/backend/UiSwitch.vue'
  import { controlBinding, useField } from '../controls/context'
  const props = defineProps<
    UiZOrderProps & { disabled?: boolean; readonly?: boolean }
  >()
  const context = useField()
  const value = computed(() => {
    const value = context.value.field.state.input
    if (typeof value !== 'boolean')
      throw new Error(
        'UiSwitch requires a boolean editing value; use a codec for business values.',
      )
    return value
  })
  const view = ref<UiFocusHandle>()
  const binding = computed(() => controlBinding(context.value, props.disabled))
  defineExpose({
    focus: () => focusControl(view, () => binding.value.disabled),
  })
  async function update(value: boolean) {
    if (binding.value.disabled || props.readonly) return
    const field = context.value.field
    await field.set(value)
    await field.validate()
  }
  assertUiCapabilities(uiBackend, ['input.switch.v1', 'control.focus.v1'])
</script>
<template>
  <View
    ref="view"
    :binding="binding"
    :value="value"
    :readonly="readonly"
    @update="update"
  />
</template>
