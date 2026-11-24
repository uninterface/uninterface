<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import {
    computed,
    getCurrentInstance,
    provide,
    ref,
    useId,
    useSlots,
    watchEffect,
  } from 'vue'
  import View from '@uninterface/backend/UiCollapsible.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import { availableHeightKey } from '../layout/hosting'
  import { assertThemeColor, type UiThemeColor } from '../presentation/theme'
  import {
    assertCollapsibleBinding,
    type UiCollapsibleBinding,
  } from '../bindings/collapsible'
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        label?: string
        modelValue?: boolean
        binding?: UiCollapsibleBinding
        disabled?: boolean
        lazy?: boolean
        color?: UiThemeColor
      }
    >(),
    { disabled: false, lazy: false, modelValue: undefined },
  )
  const emit = defineEmits<{ 'update:modelValue': [expanded: boolean] }>()
  assertUiCapabilities(uiBackend, ['collapsible.v1'])
  const supportsColor = uiBackend.capabilities.includes('collapsible.color.v1')
  const color = computed(() => {
    if (!supportsColor || props.color === undefined) return undefined
    assertThemeColor(uiBackend, props.color)
    return props.color
  })
  provideStrategyView(useUiStrategyNode('collapsible'))
  provide(availableHeightKey, ref(undefined))
  const id = useId()
  const slots = useSlots()
  const instance = getCurrentInstance()!
  const visited = ref(false)
  function resolved() {
    if (
      !slots.summary &&
      (typeof props.label !== 'string' || !props.label.trim())
    )
      throw new Error(
        'UiCollapsible requires a nonempty label or a summary slot.',
      )
    if (props.binding) {
      assertCollapsibleBinding(props.binding)
      if (
        props.modelValue !== undefined ||
        instance.vnode.props?.['onUpdate:modelValue']
      )
        throw new Error(
          'UiCollapsible: binding owns expansion; do not also supply v-model or its update listener.',
        )
      return {
        expanded: props.binding.expanded,
        disabled: props.disabled || props.binding.disabled,
      }
    }
    if (typeof props.modelValue !== 'boolean')
      throw new Error('UiCollapsible requires a boolean v-model or a binding.')
    return { expanded: props.modelValue, disabled: props.disabled }
  }
  const presentation = computed(resolved)
  watchEffect(() => {
    if (!props.lazy || presentation.value.expanded) visited.value = true
  })
  const mounted = computed(() => !props.lazy || visited.value)
  function requestExpanded(expanded: boolean) {
    const state = resolved()
    if (state.disabled || expanded === state.expanded) return
    if (props.binding) props.binding.requestExpanded(expanded)
    else emit('update:modelValue', expanded)
  }
</script>
<template>
  <View
    v-bind="resolved()"
    :trigger-id="`${id}-trigger`"
    :panel-id="`${id}-panel`"
    :mounted="mounted"
    :color="color"
    @update:expanded="requestExpanded"
  >
    <template #summary>
      <slot
        name="summary"
        :expanded="presentation.expanded"
        :disabled="presentation.disabled"
      >
        {{ label }}
      </slot>
    </template>
    <slot />
  </View>
</template>
