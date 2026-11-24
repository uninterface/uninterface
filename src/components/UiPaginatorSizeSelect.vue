<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { computed } from 'vue'
  import View from '@uninterface/backend/UiPaginatorSizeSelect.vue'
  import { uiBackend } from '@uninterface/backend'
  import type { UiPaginatorBinding } from '../bindings/list'
  import type { UiPaginatorSizeSelectViewProps } from '../backend/collection'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useMessages } from '../i18n/messages'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiZOrderProps & {
      binding: UiPaginatorBinding
      ariaLabel?: string
    }
  >()
  provideStrategyView(useUiStrategyNode('paginator-size-select'))
  assertUiCapabilities(uiBackend, ['paginator.size-select.v1'])
  const messages = useMessages('collections')
  const view = computed<UiPaginatorSizeSelectViewProps>(() => {
    const b = props.binding
    if (b.target !== 'paginator')
      throw new Error('UiPaginatorSizeSelect requires a paginator binding.')
    return {
      label: props.ariaLabel?.trim() || messages.value.pageSize,
      value: b.requested.size,
      options: b.pageSizes.map((value) => ({
        value,
        label: messages.value.pageSizeOption.replace('{count}', String(value)),
      })),
      disabled: b.pending || !b.canChangeSize || b.pageSizes.length === 0,
      pending: b.pending,
      select: (size) =>
        b.pending ||
        !b.canChangeSize ||
        !b.pageSizes.includes(size) ||
        size === b.requested.size
          ? Promise.resolve(false)
          : b.setPageSize(size),
    }
  })
  const messagesReady = messages.ready
</script>
<template>
  <View
    v-if="messagesReady"
    v-bind="{ ...$attrs, ...view }"
  />
</template>
