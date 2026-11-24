<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { watchEffect } from 'vue'
  import View from '@uninterface/backend/UiFilePreview.vue'
  import type { UiFileDescriptor } from '../files/control'
  import { useFilePreview } from './internal/filePreview'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        file: UiFileDescriptor
        alt?: string
        presentation?: 'tile' | 'row'
        thumbnail?: boolean
      }
    >(),
    { presentation: 'tile' },
  )
  watchEffect(() => {
    if (!['tile', 'row'].includes(props.presentation))
      throw new Error('UiFilePreview presentation must be tile or row.')
  })
  const url = useFilePreview(() => props.file)
  assertUiCapabilities(uiBackend, ['file.preview.v1'])
</script>
<template>
  <View
    :name="file.name"
    :presentation="presentation"
    :thumbnail="thumbnail"
    :media-type="file.mediaType"
    :size="file.size"
    :url="url"
    :image="Boolean(file.mediaType?.startsWith('image/'))"
    :alt="alt ?? file.name"
  />
</template>
