<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { computed, onDeactivated, ref, useId, useSlots } from 'vue'
  import { uiBackend } from '@uninterface/backend'
  import View from '@uninterface/backend/UiInputFrame.vue'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { controlBinding, useField } from '../controls/context'
  import type { UiFocusHandle } from '../backend'
  import {
    provideInputFrameBoundary,
    renderInputFrameContent,
    type InputFrameOwner,
  } from '../input-frame/participation'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  defineOptions({ inheritAttrs: false })
  const node = useUiStrategyNode('input-frame')
  provideStrategyView(node)
  const props = defineProps<
    UiZOrderProps & { disabled?: boolean; readonly?: boolean }
  >()
  const emit = defineEmits<{ focus: []; blur: [] }>()
  const field = useField()
  provideInputFrameBoundary()
  const slots = useSlots()
  const id = 'ui-frame-' + useId()
  const descriptionBinding = computed(() =>
    controlBinding(field.value, props.disabled),
  )
  const binding = computed(() => ({
    ...controlBinding(field.value, props.disabled),
    id,
  }))
  const readonly = computed(() => Boolean(props.readonly))
  const view = ref<UiFocusHandle>()
  const focused = ref(false)
  async function focus() {
    if (binding.value.disabled) return false
    return view.value?.focus() ?? null
  }
  const owner: InputFrameOwner = {
    field,
    bind: (disabled) => controlBinding(field.value, disabled),
    disabled: computed(() => binding.value.disabled),
    readonly,
    targets: new Map(),
  }
  function Content() {
    const scope = {
      disabled: binding.value.disabled,
      readonly: readonly.value,
      focus,
    }
    return renderInputFrameContent(
      [
        ...(slots.leading?.(scope) ?? []),
        ...(slots.default?.(scope) ?? []),
        ...(slots.trailing?.(scope) ?? []),
      ],
      owner,
    )
  }
  function enter() {
    if (!focused.value) {
      focused.value = true
      emit('focus')
    }
  }
  async function leave() {
    if (!focused.value) return
    focused.value = false
    emit('blur')
    if (!binding.value.disabled) await field.value.field.validate()
  }
  onDeactivated(() => {
    focused.value = false
  })
  defineExpose({ focus })
  assertUiCapabilities(uiBackend, [
    'input.frame.v1',
    'input.frame.cooperation.v1',
    'control.focus.v1',
  ])
</script>
<template>
  <View
    ref="view"
    v-bind="$attrs"
    :binding="binding"
    :description-binding="descriptionBinding"
    :label="field.label"
    :readonly="readonly"
    :dirty="field.field.dirty.value"
    :focus-editor="async () => null"
    @enter="enter"
    @leave="leave"
  >
    <Content />
  </View>
</template>
