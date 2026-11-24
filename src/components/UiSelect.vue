<script setup lang="ts">
  import { requireUiText, resolveUiText } from '../text/source'
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const strategyNode = useUiStrategyNode('selection-editor')
  provideStrategyView(strategyNode)
  import { computed, ref, watch } from 'vue'
  import UiSuggestions from './UiSuggestions.vue'
  import SearchInput from '@uninterface/backend/UiTextInput.vue'
  import type { UiSearchBinding } from '../search/control'
  import type { SuggestionSlotProps } from '../search/suggestionContent'
  import View from '@uninterface/backend/UiSelect.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { focusControl } from './internal/focus'
  import type { UiFocusHandle, UiSelectOption } from '../backend'
  import type { UiEntryControl } from '../entries/control'
  import type { UiEntry } from '../entries/types'
  import { controlBinding, useField } from '../controls/context'
  import { useMessages } from '../i18n/messages'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        control?: UiEntryControl
        search?: UiSearchBinding<any>
        placeholder?: string
        autoLoad?: boolean
        disabled?: boolean
      }
    >(),
    { autoLoad: true },
  )
  defineSlots<{
    suggestion(props: SuggestionSlotProps<any>): any
  }>()
  assertUiCapabilities(uiBackend, [
    'control.focus.v1',
    'input.select.single.v1',
    'input.select.source.v1',
  ])
  watch(
    () => [props.control, props.search],
    () => {
      if (Boolean(props.control) === Boolean(props.search))
        throw new Error('UiSelect requires either control or search, not both.')
    },
    { immediate: true },
  )
  const context = useField()
  const view = ref<UiFocusHandle>()
  const binding = computed(() => controlBinding(context.value, props.disabled))
  defineExpose({
    focus: () => focusControl(view, () => binding.value.disabled),
  })
  const messages = useMessages('entries')
  watch(
    () => [props.control, props.autoLoad] as const,
    ([control, autoLoad]) => {
      if (autoLoad && control) return control.load()
    },
    { immediate: true },
  )
  const collection = computed(
    () =>
      props.control?.collection() ?? {
        entries: [],
        status: 'idle' as const,
        error: null,
        query: '',
      },
  )
  const candidates = computed(() => {
    const result: UiSelectOption[] = []
    function visit(entries: readonly UiEntry[], group?: string) {
      for (const entry of entries) {
        if (entry.kind === 'separator') continue
        if (entry.kind === 'submenu')
          throw new Error('UiSelect does not support hierarchical selection.')
        if (entry.kind === 'group') {
          if (group !== undefined)
            throw new Error('UiSelect supports one group level.')
          visit(
            entry.entries,
            requireUiText(
              entry.label,
              `Entry ${entry.key} requires a text label.`,
            ),
          )
        } else {
          if (props.control?.selectionFor(entry.key))
            throw new Error(
              'UiSelect selection belongs to its field, not an entry selection scope.',
            )
          result.push({
            value: entry.key,
            label: requireUiText(
              entry.label,
              `Entry ${entry.key} requires a text label.`,
            ),
            disabled: entry.disabled,
            group,
          })
        }
      }
    }
    visit(collection.value.entries)
    return result
  })
  const options = computed(() => {
    const result =
      collection.value.status === 'ready' ? [...candidates.value] : []
    if (!result.some((option) => option.value === ''))
      result.unshift({
        value: '',
        label: props.placeholder ?? '',
        hidden: true,
        disabled: true,
      })
    const value = context.value.field.state.input as string
    if (value && !result.some((option) => option.value === value)) {
      const label =
        resolveUiText(props.control?.describe(value)?.label) ?? value
      result.unshift({ value, label, hidden: true, disabled: true })
    }
    return result
  })
  const status = computed(() => {
    const state = collection.value
    const pending = state.status === 'loading' || state.status === 'refreshing'
    return {
      state: state.status,
      pending,
      message:
        state.status === 'idle'
          ? messages.value.entriesNotLoaded
          : pending
            ? messages.value.entriesLoading
            : state.status === 'error'
              ? messages.value.entriesFailed
              : state.status === 'ready' && !candidates.value.length
                ? messages.value.entriesEmpty
                : '',
    }
  })
  async function update(value: string) {
    if (binding.value.disabled || collection.value.status !== 'ready') return
    const option = options.value.find((candidate) => candidate.value === value)
    if (!option || option.disabled || option.hidden) return
    const field = context.value.field
    await field.set(value)
    await field.validate()
  }
  function requestLoad() {
    if (binding.value.disabled || collection.value.status !== 'idle') return
    return props.control?.load()
  }
  const searchText = ref('')
  function restoreSearchText() {
    const value = context.value.field.state.input
    const search = props.search
    const label = search?.describe(value) ?? value
    searchText.value = label
    if (search && search.status !== 'disposed' && search.query !== label) {
      search.syncQuery(label)
    }
  }
  watch(
    [() => context.value.field.state.input, () => props.search],
    restoreSearchText,
    { immediate: true },
  )
  async function chooseSearch(item: unknown) {
    const search = props.search
    const found = search?.results.find((result) => result.item === item)
    if (!found || !search?.isCurrent(found) || binding.value.disabled) return
    const field = context.value.field
    searchText.value = found.label
    search.syncQuery(found.label)
    await field.set(found.key)
    await field.validate()
  }
  function searchBlur() {
    restoreSearchText()
    blur()
  }
  function blur() {
    if (!binding.value.disabled) return context.value.field.validate()
  }
  const messagesReady = messages.ready
</script>
<template>
  <template v-if="messagesReady">
    <UiSuggestions
      v-if="search"
      :binding="search"
      :disabled="binding.disabled"
      @accept="chooseSearch"
    >
      <template #host="{ host }">
        <SearchInput
          ref="view"
          v-bind="{ ...$attrs, ...host }"
          :binding="binding"
          :value="searchText"
          type="text"
          inputmode="text"
          autocomplete="off"
          @update="searchText = $event"
          @blur="searchBlur"
        />
      </template>
      <template
        v-if="$slots.suggestion"
        #suggestion="scope"
      >
        <slot
          name="suggestion"
          v-bind="scope"
        />
      </template>
    </UiSuggestions>
    <View
      v-else
      ref="view"
      v-bind="$attrs"
      :binding="binding"
      :value="context.field.state.input"
      :options="options"
      :available="collection.status === 'ready' && candidates.length > 0"
      :status="status"
      @request-load="requestLoad"
      @update="update"
      @blur="blur"
    />
  </template>
</template>
