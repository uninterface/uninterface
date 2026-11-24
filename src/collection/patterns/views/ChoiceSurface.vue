<script setup lang="ts">
  import UiStrategy from '../../../components/UiStrategy.vue'
  import UiField from '../../../components/UiField.vue'
  import UiLayout from '../../../components/UiLayout.vue'
  import UiButton from '../../../components/UiButton.vue'
  import { uiFieldLabels } from '../../../strategy/common'
  import { useMessages } from '../../../i18n/messages'
  import { resolveUiText } from '../../../text/source'
  import type {
    UiFilterViewContext,
    UiChoiceFilterEditorBinding,
  } from '../types'
  defineProps<{
    context: UiFilterViewContext<UiChoiceFilterEditorBinding<any>>
    group?: boolean
  }>()
  const messages = useMessages('collections')
  const messagesReady = messages.ready
</script>
<template>
  <UiStrategy
    v-if="messagesReady"
    :use="context.presentation.labelProvided ? uiFieldLabels('hidden') : []"
  >
    <UiField
      :field="context.editor.field"
      :label="context.binding.label"
      :disabled="context.binding.disabled"
      :group="group"
    >
      <slot />
    </UiField>
    <UiLayout
      v-if="context.binding.editing.commit === 'explicit'"
      direction="horizontal"
      wrap
    >
      <UiButton
        :disabled="context.binding.disabled"
        :loading="context.binding.validating"
        color="success"
        @click="context.submit()"
      >
        {{ resolveUiText(context.editor.applyLabel) ?? messages.filterApply }}
      </UiButton>
      <UiButton
        :disabled="!context.binding.canClear"
        color="danger"
        variant="text"
        @click="context.clear()"
      >
        {{ resolveUiText(context.editor.clearLabel) ?? messages.filterClear }}
      </UiButton>
    </UiLayout>
  </UiStrategy>
</template>
