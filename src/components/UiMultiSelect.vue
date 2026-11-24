<script setup lang="ts">
  import { requireUiText, resolveUiText } from '../text/source'
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { computed, ref, watch } from 'vue'
  import View from '@uninterface/backend/UiMultiSelect.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import { controlBinding, useField } from '../controls/context'
  import {
    multiSelectKeys,
    reconcileMultiSelection,
  } from '../controls/multiple-selection'
  import { focusControl } from './internal/focus'
  import { useMessages } from '../i18n/messages'
  import type { UiEntryControl } from '../entries/control'
  import type { UiEntry } from '../entries/types'
  import type {
    UiFocusHandle,
    UiMultiSelectViewProps,
    UiSelectOption,
  } from '../backend'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        control: UiEntryControl
        placeholder?: string
        disabled?: boolean
        autoLoad?: boolean
      }
    >(),
    { autoLoad: true },
  )
  assertUiCapabilities(uiBackend, [
    'input.select.multiple.v1',
    'control.focus.v1',
  ])
  provideStrategyView(useUiStrategyNode('selection-editor'))
  const field = useField()
  const messages = useMessages('entries')
  const view = ref<UiFocusHandle>()
  const binding = computed(() => controlBinding(field.value, props.disabled))
  const value = computed(() => multiSelectKeys(field.value.field.state.input))
  const collection = computed(() => props.control.collection())
  const candidates = computed(() => {
    const result: UiSelectOption[] = []
    function visit(entries: readonly UiEntry[], group?: string) {
      for (const entry of entries) {
        if (entry.kind === 'separator') continue
        if (entry.kind === 'submenu')
          throw new Error(
            'UiMultiSelect does not support hierarchical selection.',
          )
        if (entry.kind === 'group') {
          if (group !== undefined)
            throw new Error('UiMultiSelect supports one group level.')
          visit(
            entry.entries,
            requireUiText(
              entry.label,
              `Entry ${entry.key} requires a text label.`,
            ),
          )
        } else {
          if (props.control.selectionFor(entry.key))
            throw new Error(
              'UiMultiSelect selection belongs to its field, not an entry selection scope.',
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
  watch(
    () => [props.control, props.autoLoad] as const,
    ([control, autoLoad]) => {
      if (autoLoad) return control.load()
    },
    { immediate: true },
  )
  const presentation = computed<UiMultiSelectViewProps>(() => {
    const state = collection.value.status
    const ready = state === 'ready'
    const pending = state === 'loading' || state === 'refreshing'
    const options = ready ? [...candidates.value] : []
    for (const key of value.value) {
      if (options.some((option) => option.value === key)) continue
      const label = resolveUiText(props.control.describe(key)?.label) ?? key
      options.push({
        value: key,
        label: ready
          ? `${label} — ${messages.value.selectionUnavailable}`
          : label,
        disabled: !ready,
      })
    }
    return {
      binding: binding.value,
      value: value.value,
      options,
      placeholder: props.placeholder,
      available: ready,
      clearLabel: messages.value.clearSelection,
      clearable:
        ready &&
        !binding.value.disabled &&
        value.value.some(
          (key) =>
            !candidates.value.find((option) => option.value === key)?.disabled,
        ),
      status: {
        state,
        pending,
        message:
          state === 'idle'
            ? messages.value.entriesNotLoaded
            : pending
              ? messages.value.entriesLoading
              : state === 'error'
                ? messages.value.entriesFailed
                : !candidates.value.length
                  ? messages.value.entriesEmpty
                  : '',
      },
    }
  })
  async function update(requested: string[]) {
    if (binding.value.disabled || collection.value.status !== 'ready') return
    const current = value.value
    const next = reconcileMultiSelection(current, requested, candidates.value)
    if (
      next.length === current.length &&
      next.every((key, index) => key === current[index])
    )
      return
    const control = field.value.field
    await control.set(next)
    await control.validate()
  }
  function requestLoad() {
    if (!binding.value.disabled && collection.value.status === 'idle')
      return props.control.load()
  }
  function blur() {
    if (!binding.value.disabled) return field.value.field.validate()
  }
  defineExpose({
    focus: () => focusControl(view, () => binding.value.disabled),
  })
  const messagesReady = messages.ready
</script>
<template>
  <View
    v-if="messagesReady"
    ref="view"
    v-bind="{ ...$attrs, ...presentation }"
    @update="update"
    @clear="update([])"
    @request-load="requestLoad"
    @blur="blur"
  />
</template>
