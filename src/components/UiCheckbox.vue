<script setup lang="ts">
  import { useCheckableField } from '../controls/context'
  useCheckableField()
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const strategyNode = useUiStrategyNode('boolean-editor')
  provideStrategyView(strategyNode)
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { computed, ref, watchEffect } from 'vue'
  import { checkboxValue } from '../controls/choices'
  import type { UiFocusHandle } from '../backend'
  import { focusControl } from './internal/focus'
  import View from '@uninterface/backend/UiCheckbox.vue'
  import { controlBinding, useField } from '../controls/context'
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        disabled?: boolean
        binary?: boolean
        tristate?: boolean
        cycleIndeterminate?: boolean
      }
    >(),
    { binary: undefined, tristate: undefined, cycleIndeterminate: false },
  )
  const tristate = computed(() => {
    if (props.binary !== undefined && props.tristate !== undefined)
      throw new Error('UiCheckbox accepts either binary or tristate, not both.')
    return props.tristate ?? props.binary === false
  })
  watchEffect(() => {
    if (props.cycleIndeterminate && !tristate.value)
      throw new Error('UiCheckbox cycleIndeterminate requires tristate values.')
    if (tristate.value)
      assertUiCapabilities(uiBackend, ['input.checkbox.tristate.v1'])
  })
  const context = useField()
  const value = computed(() =>
    checkboxValue(context.value.field.state.input, tristate.value),
  )
  const view = ref<UiFocusHandle>()
  const binding = computed(() => controlBinding(context.value, props.disabled))
  defineExpose({
    focus: () => focusControl(view, () => binding.value.disabled),
  })
  async function update(next: boolean) {
    if (binding.value.disabled) return
    const field = context.value.field
    await field.set(
      props.cycleIndeterminate
        ? value.value === false
          ? true
          : value.value === true
            ? 'indeterminate'
            : false
        : next,
    )
    await field.validate()
  }
  assertUiCapabilities(uiBackend, ['input.checkbox.v1', 'control.focus.v1'])
</script>
<template>
  <View
    ref="view"
    :binding="binding"
    :value="value"
    @update="update"
  />
</template>
