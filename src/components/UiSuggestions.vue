<script setup lang="ts" generic="T = unknown">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'

  import { computed, ref, shallowRef, useId, watch } from 'vue'
  import View from '@uninterface/backend/UiSuggestions.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type { UiSearchBinding, UiSearchResult } from '../search/control'
  import {
    suggestionLabelParts,
    type SuggestionSlotProps,
  } from '../search/suggestionContent'
  import { useMessages } from '../i18n/messages'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const props = defineProps<
    UiZOrderProps & {
      binding: UiSearchBinding<T>
      engagement?: (value: boolean) => void
      disabled?: boolean
    }
  >()
  const emit = defineEmits<{ accept: [item: T] }>()
  defineSlots<{
    host(props: { host: Record<string, unknown> }): any
    suggestion(props: SuggestionSlotProps<T>): any
  }>()
  const id = useId(),
    messages = useMessages('entries')
  provideStrategyView(useUiStrategyNode('suggestions'))
  assertUiCapabilities(uiBackend, ['suggestions.v1'])
  const engaged = ref(false)
  const retained = shallowRef<readonly UiSearchResult<T>[]>([])
  const pending = computed(() =>
    ['waiting', 'loading'].includes(props.binding.status),
  )
  watch(
    [
      () => props.binding,
      () => props.binding.status,
      () => props.binding.results,
      engaged,
    ],
    ([binding, status, results, open], [previous]) => {
      // Keep a display snapshot only while this popup is showing results.
      if (open && status === 'ready') retained.value = results
      else if (!open || binding !== previous || !pending.value)
        retained.value = []
    },
  )
  function setEngagement(open: boolean) {
    engaged.value = open
    props.engagement?.(open)
  }
  const showProgress = ref(false)
  watch(
    [() => props.binding, () => props.binding.status === 'loading'],
    ([, loading], _, onCleanup) => {
      showProgress.value = false
      if (!loading) return
      const timer = setTimeout(() => {
        showProgress.value = true
      }, 300)
      onCleanup(() => clearTimeout(timer))
    },
    { immediate: true },
  )
  const status = computed(() =>
    props.binding.status === 'error'
      ? messages.value.entriesFailed
      : props.binding.status === 'loading' && showProgress.value
        ? retained.value.length
          ? messages.value.entriesUpdating
          : messages.value.entriesLoading
        : props.binding.status === 'ready' &&
            !props.binding.results.length &&
            !props.binding.hasMatches
          ? messages.value.suggestionsEmpty
          : '',
  )
  const displayedResults = computed(() =>
    pending.value
      ? retained.value.map((result) => ({ ...result, disabled: true }))
      : props.binding.results,
  )
  const candidates = computed(
    () =>
      new Map(
        displayedResults.value.map((result) => [
          result.key,
          { result, labelParts: suggestionLabelParts(result) },
        ]),
      ),
  )
  function suggestionProps(key: string, active: boolean) {
    const candidate = candidates.value.get(key)!
    const { item, label, disabled } = candidate.result
    return { item, label, disabled, active, labelParts: candidate.labelParts }
  }
  function accept(key: string) {
    const item = props.binding.results.find((item) => item.key === key)
    if (!props.disabled && item && props.binding.isCurrent(item))
      emit('accept', item.item)
  }
  useZComponent()
  const messagesReady = messages.ready
</script>
<template>
  <View
    v-if="messagesReady"
    :id="id"
    :engagement="setEngagement"
    :results="displayedResults"
    :status="binding.status"
    :pending="pending"
    :message="status"
    :label="messages.suggestions"
    :disabled="disabled ?? false"
    :query="binding.setQuery"
    :refresh="binding.refresh"
    :accept="accept"
  >
    <template #host="scope">
      <slot
        name="host"
        v-bind="scope"
      />
    </template>
    <template #suggestion="{ item, active }">
      <slot
        name="suggestion"
        v-bind="suggestionProps(item.key, active)"
      >
        <template
          v-for="(part, index) in candidates.get(item.key)?.labelParts"
          :key="index"
        >
          <mark v-if="part.matched">{{ part.text }}</mark>
          <template v-else>{{ part.text }}</template>
        </template>
      </slot>
    </template>
  </View>
</template>
