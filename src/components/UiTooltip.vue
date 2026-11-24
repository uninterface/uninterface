<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { computed, ref, useId, watchEffect } from 'vue'
  import View from '@uninterface/backend/UiTooltip.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import type {
    UiTooltipTrigger,
    UiTooltipPlacement,
  } from '../presentation/tooltip'
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        text?: string
        visible?: boolean
        disabled?: boolean
        trigger?: UiTooltipTrigger | readonly UiTooltipTrigger[]
        placement?: UiTooltipPlacement
      }
    >(),
    { visible: undefined, trigger: () => ['hover', 'focus'], placement: 'top' },
  )
  const emit = defineEmits<{ 'update:visible': [value: boolean] }>()
  const local = ref(false),
    id = useId()
  const triggers = computed(() =>
    typeof props.trigger === 'string' ? [props.trigger] : props.trigger,
  )
  watchEffect(() => {
    if (
      triggers.value.some(
        (value) => !['hover', 'focus', 'click'].includes(value),
      )
    )
      throw new Error('Unsupported tooltip trigger.')
    if (!['top', 'bottom', 'left', 'right'].includes(props.placement))
      throw new Error('Unsupported tooltip placement.')
  })
  function requestVisible(value: boolean) {
    if (props.disabled && value) return
    if (props.visible === undefined) local.value = value
    emit('update:visible', value)
  }
  provideStrategyView(useUiStrategyNode('tooltip'))
  assertUiCapabilities(uiBackend, ['tooltip.v1'])
</script>
<template>
  <View
    :id="id"
    :visible="props.visible ?? local"
    :disabled="disabled ?? false"
    :placement="placement"
    :triggers="triggers"
    :request-visible="requestVisible"
  >
    <template #host="scope">
      <slot
        name="host"
        v-bind="scope"
      />
    </template>
    <slot>{{ text }}</slot>
  </View>
</template>
