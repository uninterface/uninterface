<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const strategyNode = useUiStrategyNode('field')
  provideStrategyView(strategyNode)
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { computed, provide, ref, useId } from 'vue'
  import View from '@uninterface/backend/UiField.vue'
  import type { UiFieldControl } from '../controls/field'
  import { isolateInputFrameField } from '../input-frame/participation'
  import { fieldKey, checkableFieldKey } from '../controls/context'
  import { useIssueText, useMessages } from '../i18n/messages'
  const props = defineProps<
    UiZOrderProps & {
      field: UiFieldControl<any, any>
      label: string
      help?: string
      required?: boolean
      disabled?: boolean
      group?: boolean
    }
  >()
  isolateInputFrameField()
  const id = `ui-${useId()}`
  const checkableCount = ref(0)
  provide(checkableFieldKey, {
    register() {
      checkableCount.value++
      return () => {
        checkableCount.value--
      }
    },
  })
  const messages = useMessages()
  const issue = useIssueText(() => props.field.state.issue)
  const description = computed(
    () =>
      [props.help ? `${id}-help` : '', issue.value ? `${id}-issue` : '']
        .filter(Boolean)
        .join(' ') || undefined,
  )
  provide(
    fieldKey,
    computed(() => ({
      field: props.field,
      id,
      describedBy: description.value,
      label: props.label,
      group: props.group,
      required: props.required,
      disabled: props.disabled,
    })),
  )
  assertUiCapabilities(uiBackend, ['field.feedback.v1'])
</script>
<template>
  <View
    :binding="{
      id,
      label,
      help,
      issue,
      validating: field.state.validating,
      describedBy: description,
      requiredLabel: required ? messages.required : undefined,
      group,
      checkable: checkableCount > 0,
    }"
  >
    <slot />
  </View>
</template>
