<script setup lang="ts">
  import { computed } from 'vue'
  import UiStrategy from '../../../components/UiStrategy.vue'
  import UiField from '../../../components/UiField.vue'
  import UiInputFrame from '../../../components/UiInputFrame.vue'
  import UiTextInput from '../../../components/UiTextInput.vue'
  import UiButton from '../../../components/UiButton.vue'
  import UiIcon from '../../../components/UiIcon.vue'
  import { uiFieldLabels } from '../../../strategy/common'
  import { useMessages } from '../../../i18n/messages'
  import { resolveUiText } from '../../../text/source'
  import type {
    UiFilterViewContext,
    UiSearchFilterEditorBinding,
  } from '../types'
  const props = defineProps<{
    context: UiFilterViewContext<UiSearchFilterEditorBinding>
  }>()
  const messages = useMessages('collections')
  const hidden = computed(
    () =>
      props.context.presentation.labelProvided ||
      props.context.presentation.usage === 'header-search',
  )
  function keydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.isComposing || event.keyCode === 229))
      event.preventDefault()
  }
  const messagesReady = messages.ready
</script>
<template>
  <form
    v-if="messagesReady"
    novalidate
    :aria-label="context.binding.label"
    @keydown="keydown"
    @submit.prevent.stop="context.submit()"
  >
    <UiStrategy :use="uiFieldLabels(hidden ? 'hidden' : 'show')">
      <UiField
        :field="context.editor.field"
        :label="context.binding.label"
        :disabled="context.binding.disabled"
      >
        <UiInputFrame>
          <UiIcon
            v-if="context.binding.editing.commit === 'live'"
            name="search"
          />
          <UiTextInput
            type="search"
            :min-width-characters="hidden ? 10 : 20"
            :placeholder="
              resolveUiText(context.editor.placeholder) ?? context.binding.label
            "
            enterkeyhint="search"
          />
          <template
            v-if="context.binding.editing.commit === 'explicit'"
            #trailing
          >
            <UiButton
              type="submit"
              :disabled="context.binding.disabled"
              :loading="context.binding.validating"
              variant="icon"
            >
              <template #icon><UiIcon name="search" /></template>
              {{
                resolveUiText(context.editor.searchLabel) ??
                messages.filterSearch
              }}
            </UiButton>
          </template>
        </UiInputFrame>
      </UiField>
    </UiStrategy>
  </form>
</template>
