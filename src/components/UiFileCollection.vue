<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import View from '@uninterface/backend/UiFileCollection.vue'
  import UiFilePreview from './UiFilePreview.vue'
  import type { UiFileDescriptor } from '../files/control'
  import { useMessages } from '../i18n/messages'
  import { watchEffect } from 'vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  const props = defineProps<
    UiZOrderProps & {
      files: readonly UiFileDescriptor[]
      removable?: boolean
      disabled?: boolean
    }
  >()
  const emit = defineEmits<{
    'update:files': [files: UiFileDescriptor[]]
    remove: [file: UiFileDescriptor]
  }>()
  const messages = useMessages('files')
  watchEffect(() => {
    if (
      props.files.some((file) => !file.key) ||
      new Set(props.files.map((file) => file.key)).size !== props.files.length
    )
      throw new Error('File collection keys must be nonempty and unique.')
  })
  function remove(key: string) {
    if (props.disabled || !props.removable) return
    const file = props.files.find((file) => file.key === key)
    if (file) {
      emit('remove', file)
      emit(
        'update:files',
        props.files.filter((file) => file.key !== key),
      )
    }
  }
  assertUiCapabilities(uiBackend, ['file.collection.v1'])
  const messagesReady = messages.ready
</script>
<template>
  <View
    v-if="messagesReady"
    :files="files"
    :removable="removable ?? false"
    :disabled="disabled ?? false"
    :remove="remove"
    :remove-label="messages.removeFile"
  >
    <template #default="{ file }">
      <slot :file="file"><UiFilePreview :file="file" /></slot>
    </template>
  </View>
</template>
