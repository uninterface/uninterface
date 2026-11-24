<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { ref } from 'vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useMessages } from '../i18n/messages'
  import { useFileInput, type FileInputProps } from './internal/fileInput'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import type { UiFileDescriptor } from '../files/control'
  import type { UiFocusHandle } from '../backend'
  defineOptions({ inheritAttrs: false })
  import View from '@uninterface/backend/UiFileInput.vue'
  const props = defineProps<UiZOrderProps & FileInputProps>()
  const emit = defineEmits<{
    'update:file': [file: UiFileDescriptor<File> | null]
    reject: [issue: string]
  }>()
  const view = ref<UiFocusHandle>(),
    messages = useMessages('files')
  const state = useFileInput(props, emit)
  defineExpose({ focus: () => view.value?.focus() ?? Promise.resolve(null) })
  provideStrategyView(useUiStrategyNode('file-editor'))
  assertUiCapabilities(uiBackend, ['input.file.v1'])
  const messagesReady = messages.ready
</script>
<template>
  <View
    v-if="messagesReady"
    ref="view"
    v-bind="$attrs"
    :binding="state.binding.value"
    :label="state.label.value"
    :file="state.file.value"
    :readonly="readonly ?? false"
    :accept="accept"
    :capture="capture"
    :pending="state.pending.value"
    :rejection="state.rejection.value"
    :choose-label="messages.chooseFile"
    :clear-label="messages.clearFile"
    :select="state.select"
    :clear="state.clear"
  />
</template>
