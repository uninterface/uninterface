<script setup lang="ts">
  import { nextTick, onScopeDispose, ref, watch } from 'vue'
  import UiMenu from '../../components/UiMenu.vue'
  import UiButton from '../../components/UiButton.vue'
  import UiIcon from '../../components/UiIcon.vue'
  import { createUiEntryControl } from '../../entries/control'
  import { useMessages } from '../../i18n/messages'
  const props = defineProps<{
    label: string
    index: number
    count: number
    disabled: boolean
    move: (offset: number) => Promise<unknown>
  }>()
  const messages = useMessages('collections')
  const trigger = ref<InstanceType<typeof UiButton>>()
  const entries = createUiEntryControl(() => [
    {
      key: 'earlier',
      label: messages.value.collectionSortEarlier,
      disabled: props.disabled || props.index <= 0,
    },
    {
      key: 'later',
      label: messages.value.collectionSortLater,
      disabled:
        props.disabled || props.index < 0 || props.index >= props.count - 1,
    },
  ])
  watch(
    () => [props.index, props.count, props.disabled, messages.value],
    () => void entries.refresh(),
  )
  async function move(key: string) {
    const offset = key === 'earlier' ? -1 : key === 'later' ? 1 : 0
    if (
      !offset ||
      props.disabled ||
      props.index < 0 ||
      props.index + offset < 0 ||
      props.index + offset >= props.count
    )
      return
    await props.move(offset)
    await nextTick()
    // The keyed criterion may move while the menu restores focus.
    void trigger.value?.focus()
  }
  onScopeDispose(() => entries.dispose())
  const messagesReady = messages.ready
</script>
<template>
  <UiMenu
    v-if="messagesReady"
    :control="entries"
    mode="popup"
    :aria-label="`${label}: ${messages.collectionSortPriority}`"
    @activate="move"
  >
    <template #host="{ buttonTrigger }">
      <UiButton
        ref="trigger"
        v-bind="buttonTrigger"
        variant="icon"
        :disabled="disabled || count < 2"
        data-ui-sort-priority-menu
      >
        <template #icon><UiIcon name="more-vertical" /></template>
        {{ label }}: {{ messages.collectionSortPriority }}
      </UiButton>
    </template>
  </UiMenu>
</template>
