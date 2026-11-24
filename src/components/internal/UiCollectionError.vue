<script setup lang="ts">
  import UiNotice from '../UiNotice.vue'
  import UiButton from '../UiButton.vue'
  defineProps<{
    message: string
    retryLabel: string
    canRetry: boolean
    retry(): Promise<boolean>
  }>()
</script>
<template>
  <UiNotice
    kind="error"
    announcement="off"
    data-ui-collection-error
  >
    {{ message }}
    <template #actions>
      <UiButton
        :disabled="!canRetry"
        @click="retry"
      >
        {{ retryLabel }}
      </UiButton>
    </template>
  </UiNotice>
</template>
