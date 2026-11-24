<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { computed, inject, ref, useId, useAttrs, watchEffect } from 'vue'
  import View from '@uninterface/backend/UiDateInput.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { fieldKey, controlBinding } from '../controls/context'
  import { useMessages } from '../i18n/messages'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import type {
    UiTemporalInputBinding,
    UiTemporalValue,
  } from '../temporal/control'
  import type { UiTemporalPresentation } from '../temporal/presentation'
  import type { UiFocusHandle } from '../backend'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiZOrderProps & {
      binding: UiTemporalInputBinding<any>
      disabled?: boolean
      readonly?: boolean
      dateFormatWish?: 'YMD' | 'DMY' | 'MDY'
      presentation?: UiTemporalPresentation
    }
  >()
  const context = inject(fieldKey, undefined),
    id = useId(),
    attrs = useAttrs(),
    messages = useMessages('temporal'),
    view = ref<UiFocusHandle>()
  watchEffect(() => {
    if (props.binding.kind !== 'date')
      throw new Error('UiDateInput requires a date binding.')
    if (context && context.value.field !== props.binding.field)
      throw new Error('Temporal binding and UiField must share the same field.')
  })
  const viewBinding = computed(() =>
    context
      ? {
          ...controlBinding(context.value, props.disabled),
          disabled:
            props.binding.disabled ||
            Boolean(props.disabled) ||
            Boolean(context.value.disabled),
        }
      : {
          id,
          disabled: props.binding.disabled || Boolean(props.disabled),
          invalid: !!props.binding.field.state.issue,
          validating: props.binding.field.state.validating,
        },
  )
  async function update(value: UiTemporalValue) {
    if (!viewBinding.value.disabled && !props.readonly)
      await props.binding.set(value)
  }
  defineExpose({ focus: () => view.value?.focus() ?? Promise.resolve(null) })
  provideStrategyView(useUiStrategyNode('date-editor'))
  assertUiCapabilities(uiBackend, ['input.temporal.v1'])
  const messagesReady = messages.ready
</script>
<template>
  <View
    v-if="messagesReady"
    ref="view"
    v-bind="attrs"
    :binding="viewBinding"
    :label="context?.label ?? String(attrs['aria-label'] ?? '')"
    kind="date"
    :value="binding.field.state.input"
    :options="binding.options"
    :presentation="presentation"
    :date-format-wish="dateFormatWish"
    :readonly="readonly ?? false"
    :display="binding.display"
    :candidate="binding.candidate"
    :eligible="binding.eligible"
    :update="update"
    :blur="binding.validate"
    :start-label="messages.rangeStart"
    :end-label="messages.rangeDateEnd"
    :open-label="messages.openBoundary"
    :clear-label="messages.clearSelection"
  />
</template>
