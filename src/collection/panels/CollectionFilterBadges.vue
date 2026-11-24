<script setup lang="ts">
  import {
    computed,
    nextTick,
    onScopeDispose,
    ref,
    shallowRef,
    watch,
  } from 'vue'
  import Badge from '@uninterface/backend/CollectionQueryBadge.vue'
  import Editor from '@uninterface/backend/CollectionFilterEditor.vue'
  import UiLayout from '../../components/UiLayout.vue'
  import UiStrategy from '../../components/UiStrategy.vue'
  import UiMenu from '../../components/UiMenu.vue'
  import UiButton from '../../components/UiButton.vue'
  import UiIcon from '../../components/UiIcon.vue'
  import UiPopover from '../../components/UiPopover.vue'
  import UiCollectionFilter from '../../components/UiCollectionFilter.vue'
  import { uiLayoutDensity } from '../../strategy/common'
  import { createUiEntryControl } from '../../entries/control'
  import { createUiPopoverControl } from '../../controls/overlay'
  import { useMessages } from '../../i18n/messages'
  import type {
    UiCollectionFilterBinding,
    UiFilterPresentationContext,
  } from '../filter'
  const props = defineProps<{
    bindings: readonly UiCollectionFilterBinding[]
  }>()
  const messages = useMessages('collections')
  const compact = uiLayoutDensity(-1)
  const popup = createUiPopoverControl()
  const selected = shallowRef<UiCollectionFilterBinding>()
  const addButton = ref<InstanceType<typeof UiButton>>()
  type FocusHandle = { focus(): void }
  const editor = ref<FocusHandle>()
  const badges = new Map<string, FocusHandle>()
  function badgeRef(key: string, value: unknown) {
    if (value) badges.set(key, value as FocusHandle)
    else badges.delete(key)
  }
  const filters = computed(() => {
    const keys = new Set<string>()
    for (const binding of props.bindings) {
      if (keys.has(binding.key))
        throw new Error(`Duplicate filter badge key: ${binding.key}`)
      keys.add(binding.key)
    }
    return props.bindings.filter((binding) => binding.available)
  })
  const active = computed(() =>
    filters.value.filter((binding) => binding.active),
  )
  const available = computed(() =>
    filters.value.filter((binding) => !binding.active),
  )
  const canAdd = computed(() =>
    available.value.some((binding) => !binding.disabled),
  )
  const entries = createUiEntryControl(() =>
    available.value.map((binding) => ({
      key: binding.key,
      label: binding.label,
      disabled: binding.disabled,
    })),
  )
  watch(
    () =>
      available.value.map((binding) => [
        binding.key,
        binding.label,
        binding.disabled,
      ]),
    () => {
      void entries.refresh()
    },
  )
  watch(
    () =>
      selected.value &&
      (!props.bindings.includes(selected.value) ||
        !selected.value.available ||
        selected.value.disabled),
    (unavailable) => {
      if (unavailable) void popup.state.session?.cancel()
    },
  )
  const presentation: UiFilterPresentationContext = Object.freeze({
    usage: 'filter-badge',
    container: 'popover',
    labelProvided: true,
    summaryProvided: false,
    arrangement: 'stacked',
    submission: 'individual',
  })
  let disposed = false
  async function choose(key: string) {
    // The popup menu closes and restores its host first. Opening the editor in
    // that same turn lets the old menu steal the new editor's focus.
    await nextTick()
    await nextTick()
    const binding = available.value.find((filter) => filter.key === key)
    if (
      disposed ||
      !binding ||
      binding.disabled ||
      popup.state.phase !== 'idle'
    )
      return
    selected.value = binding
    const result = await popup.run({
      opened() {
        // Native surface entry/focus restoration has finished; backend owns
        // selection of the first actual editor target.
        editor.value?.focus()
      },
      beforeClose(request) {
        if (
          request.status === 'cancelled' &&
          ['escape', 'outside', 'trigger', 'close-button', 'cancel'].includes(
            request.reason,
          )
        )
          selected.value?.discard()
        return true
      },
      teardown() {
        selected.value = undefined
      },
    })
    // The last accepted criterion disables Add. Keep keyboard completion in
    // this group without overriding an outside click's chosen destination.
    if (
      !disposed &&
      !canAdd.value &&
      (result.status === 'completed' ||
        (result.status === 'cancelled' &&
          ['escape', 'trigger', 'close-button'].includes(result.reason)))
    ) {
      const target = binding.canClear
        ? binding
        : active.value.find((item) => item.canClear)
      if (target) badges.get(target.key)?.focus()
    }
  }
  function applied() {
    if (selected.value?.editing.commit === 'explicit')
      void popup.state.session?.complete()
  }
  async function remove(binding: UiCollectionFilterBinding) {
    if (!binding.canClear) return
    binding.clear()
    await nextTick()
    void addButton.value?.focus()
  }
  onScopeDispose(() => {
    disposed = true
    entries.dispose()
    void popup.dispose()
  })
  const messagesReady = messages.ready
</script>
<template>
  <UiStrategy
    v-if="messagesReady"
    :use="compact"
  >
    <UiPopover
      :control="popup"
      :title="selected?.label ?? messages.collectionAddFilter"
      data-ui-filter-badge-popover
    >
      <template #host="{ buttonTrigger: editorTrigger, anchor }">
        <UiLayout
          direction="horizontal"
          width="content"
          wrap
          align="center"
          role="group"
          :aria-label="messages.collectionFilters"
          data-ui-collection-filter-badges
        >
          <Badge
            v-for="binding in active"
            :key="binding.key"
            :ref="(value: unknown) => badgeRef(binding.key, value)"
            v-bind="selected?.key === binding.key ? anchor : {}"
            :label="`${binding.label}: ${binding.summary.text}`"
            :remove-label="`${binding.label}: ${messages.collectionRemoveFilter}`"
            :disabled="!binding.canClear"
            :data-ui-filter-badge="binding.key"
            @remove="remove(binding)"
          >
            <span>{{ binding.label }}: {{ binding.summary.text }}</span>
            <template #remove><UiIcon name="close" /></template>
          </Badge>

          <UiMenu
            :control="entries"
            mode="popup"
            :aria-label="messages.collectionAddFilter"
            @activate="choose"
          >
            <template #host="{ buttonTrigger: menuTrigger }">
              <UiButton
                ref="addButton"
                v-bind="
                  popup.state.phase === 'idle'
                    ? { ...editorTrigger, ...menuTrigger }
                    : editorTrigger
                "
                variant="text"
                :disabled="!canAdd && popup.state.phase === 'idle'"
              >
                <template #icon><UiIcon name="add" /></template>
                {{ messages.collectionAddFilter }}
              </UiButton>
            </template>
          </UiMenu>
        </UiLayout>
      </template>
      <Editor
        v-if="selected"
        ref="editor"
        data-ui-filter-badge-editor
        :key="selected.key"
      >
        <UiCollectionFilter
          :binding="selected"
          :presentation="presentation"
          @applied="applied"
        />
      </Editor>
    </UiPopover>
  </UiStrategy>
</template>
