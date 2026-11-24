<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  import View from '@uninterface/backend/UiInputFrameSpacer.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import {
    defineUiInputFrameContract,
    useUiInputFrameParticipant,
  } from '../input-frame/participation'
  defineOptions({
    inheritAttrs: false,
    uiInputFrame: defineUiInputFrameContract({ role: 'content' }),
  })
  defineProps<UiZOrderProps>()
  useZComponent()
  if (!useUiInputFrameParticipant())
    throw new Error('UiInputFrameSpacer requires UiInputFrame participation.')
  assertUiCapabilities(uiBackend, ['input.frame.sizing.v1'])
</script>
<template><View /></template>
