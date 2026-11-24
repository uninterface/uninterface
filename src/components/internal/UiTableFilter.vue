<script setup lang="ts">
  import {
    computed,
    ref,
    onScopeDispose,
    provide,
    watch,
    type Component,
  } from 'vue'
  import UiPopover from '../UiPopover.vue'
  import Editor from '@uninterface/backend/CollectionFilterEditor.vue'
  const editor = ref<{ focus(): void }>()
  import { createUiPopoverControl } from '../../controls/overlay'
  import { useMessages } from '../../i18n/messages'
  const props = defineProps<{
    label: string
    active: boolean
    disabled: boolean
    trigger: Component
  }>()
  import { filterHostKey } from '../../collection/filter-context'
  import type { UiCollectionFilterBinding } from '../../collection/filter'
  const filters = new Set<UiCollectionFilterBinding>()
  provide(filterHostKey, {
    presentation: Object.freeze({
      usage: 'table-column',
      container: 'popover',
      labelProvided: true,
      summaryProvided: false,
      arrangement: 'stacked',
      submission: 'individual',
    }),
    register(binding) {
      filters.add(binding)
      return () => filters.delete(binding)
    },
  })
  function open() {
    return control.run({
      opened() {
        editor.value?.focus()
      },
      beforeClose(request) {
        // Removing a view for responsive relocation is not user cancellation.
        if (
          request.status === 'cancelled' &&
          ['escape', 'outside', 'trigger', 'close-button', 'cancel'].includes(
            request.reason,
          )
        ) {
          for (const filter of filters) filter.discard()
        }
        return true
      },
    })
  }
  const messages = useMessages('collections')
  const name = computed(() =>
    messages.value.tableFilterColumn.replace('{column}', props.label),
  )
  const accessibleName = computed(() =>
    props.active
      ? messages.value.tableFilterActive.replace('{column}', props.label)
      : name.value,
  )
  const control = createUiPopoverControl()
  const close = () =>
    control.state.session?.complete() ?? Promise.resolve(false)
  watch(
    () => props.disabled,
    (disabled) => {
      if (disabled) void control.state.session?.cancel()
    },
  )
  onScopeDispose(() => {
    void control.dispose()
  })
  const messagesReady = messages.ready
</script>
<template>
  <UiPopover
    v-if="messagesReady"
    :control="control"
    :aria-label="name"
    align="end"
    data-ui-column-filter-popover
  >
    <template #host="{ buttonTrigger }">
      <component
        :is="trigger"
        v-bind="buttonTrigger"
        :disabled="disabled || buttonTrigger.disabled"
        :active="active"
        :aria-label="accessibleName"
        data-ui-column-filter
        @click.stop="!disabled && open()"
        @keydown.stop
      />
    </template>
    <Editor ref="editor"><slot :close="close" /></Editor>
  </UiPopover>
</template>
