<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useId, watchEffect } from 'vue'
  import View from '@uninterface/backend/UiUploadProgress.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useUploadProgressPresentation } from './internal/uploadProgress'
  import type { UiUploadProgressProps } from '../files/region-types'
  const props = withDefaults(
    defineProps<UiZOrderProps & UiUploadProgressProps>(),
    {
      cancel: undefined,
      retry: undefined,
    },
  )
  watchEffect(() => {
    if (props.binding?.target !== 'upload-progress')
      throw new Error('UiUploadProgress requires an upload-progress binding.')
    if (props.announcement && !['off', 'polite'].includes(props.announcement))
      throw new Error('Invalid upload progress announcement.')
  })
  const issueId = `${useId()}-upload-issue`
  const resolved = useUploadProgressPresentation(
    () => props.binding,
    () => ({ ...props, issueId }),
  )
  assertUiCapabilities(uiBackend, ['upload.progress.v1', 'progress.bar.v1'])
  const messagesReady = resolved.messagesReady
</script>
<template>
  <View
    v-if="messagesReady"
    v-bind="resolved"
  />
</template>
