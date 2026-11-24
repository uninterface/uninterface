<script setup lang="ts">
  import { computed, provide, ref } from 'vue'
  import UiButton from '../UiButton.vue'
  import { collectionActionKey } from '../../collection/action-variant'
  import type { UiButtonVariant } from '../../presentation/button'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<{
    iconOnly: boolean
    defaultVariant: UiButtonVariant
  }>()
  provide(
    collectionActionKey,
    computed(() => ({ ...props })),
  )
  const button = ref<InstanceType<typeof UiButton>>()
  defineExpose({ focus: () => button.value?.focus() })
</script>
<template>
  <UiButton
    ref="button"
    v-bind="$attrs"
  >
    <slot />
    <template
      v-if="$slots.icon"
      #icon
    >
      <slot name="icon" />
    </template>
  </UiButton>
</template>
