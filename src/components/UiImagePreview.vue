<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { watchEffect } from 'vue'
  import View from '@uninterface/backend/UiImagePreview.vue'
  import type { UiFileDescriptor } from '../files/control'
  import { useFilePreview } from './internal/filePreview'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  const props = defineProps<
    UiZOrderProps & {
      file: UiFileDescriptor
      alt?: string
      fit?: 'contain' | 'stretch'
      width?: number | string
      height?: number | string
    }
  >()
  watchEffect(() => {
    if (props.fit !== undefined && !['contain', 'stretch'].includes(props.fit))
      throw new Error('UiImagePreview fit must be contain or stretch.')
    for (const value of [props.width, props.height])
      if (typeof value === 'number' && (!Number.isFinite(value) || value < 0))
        throw new Error(
          'UiImagePreview dimensions must be nonnegative finite numbers or CSS lengths.',
        )
  })
  const url = useFilePreview(() => props.file)
  assertUiCapabilities(uiBackend, ['image.preview.v1'])
</script>
<template>
  <View
    :url="url"
    :alt="alt ?? file.name"
    :fit="fit ?? 'contain'"
    :width="width"
    :height="height"
  />
</template>
