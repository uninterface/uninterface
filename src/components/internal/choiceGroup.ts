import { requireUiText, resolveUiText } from '../../text/source'
import { computed, ref, watch } from 'vue'
import { controlBinding, useField } from '../../controls/context'
import { choiceKeys } from '../../controls/choices'
import type { UiEntryControl } from '../../entries/control'
import type { UiChoiceGroupViewProps, UiFocusHandle } from '../../backend'
import { useMessages } from '../../i18n/messages'
import { focusControl } from './focus'

export interface ChoiceGroupProps {
  control: UiEntryControl
  disabled?: boolean
  autoLoad?: boolean
  orientation?: 'vertical' | 'horizontal'
}

export function useChoiceGroup(
  props: ChoiceGroupProps,
  multiple: boolean,
  fieldKind: 'group' | 'single' = 'group',
) {
  const context = useField()
  const messages = useMessages('entries')
  const view = ref<UiFocusHandle>()
  const binding = computed(() => {
    if (fieldKind === 'group' && !context.value.group)
      throw new Error('Choice groups require UiField group.')
    if (fieldKind === 'single' && context.value.group)
      throw new Error(
        'UiSegmentedSelect requires an ordinary UiField without group.',
      )
    return controlBinding(context.value, props.disabled)
  })
  const selected = computed(() =>
    choiceKeys(context.value.field.state.input, multiple),
  )
  const collection = computed(() => props.control.collection())
  const candidates = computed(() =>
    collection.value.entries.map((entry) => {
      if (entry.kind && entry.kind !== 'item')
        throw new Error('Choice groups support flat item entries only.')
      if (props.control.selectionFor(entry.key))
        throw new Error(
          'Choice group selection belongs to its field, not an entry selection scope.',
        )
      return entry
    }),
  )
  watch(
    () => [props.control, props.autoLoad] as const,
    ([control, autoLoad]) => {
      if (autoLoad !== false) return control.load()
    },
    { immediate: true },
  )
  const presentation = computed<UiChoiceGroupViewProps>(() => {
    const state = collection.value.status
    const pending = state === 'loading' || state === 'refreshing'
    const options = candidates.value.map((entry) => ({
      key: entry.key,
      label: requireUiText(
        entry.label,
        `Entry ${entry.key} requires a text label.`,
      ),
      description: resolveUiText(entry.description),
      disabled: Boolean(entry.disabled),
      selected: selected.value.includes(entry.key),
    }))
    if (
      props.orientation !== undefined &&
      !['vertical', 'horizontal'].includes(props.orientation)
    )
      throw new Error('Invalid choice group orientation.')
    return {
      binding: binding.value,
      label: context.value.label,
      orientation: props.orientation ?? 'vertical',
      options,
      retained: selected.value
        .filter((key) => !options.some((option) => option.key === key))
        .map((key) => ({
          key,
          label: resolveUiText(props.control.describe(key)?.label) ?? key,
        })),
      unavailableLabel:
        state === 'ready' ? messages.value.selectionUnavailable : '',
      available: state === 'ready',
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
                : !options.length
                  ? messages.value.entriesEmpty
                  : '',
      },
    }
  })
  async function choose(key: string) {
    if (binding.value.disabled || collection.value.status !== 'ready') return
    const option = candidates.value.find((entry) => entry.key === key)
    if (!option || option.disabled) return
    const keys = selected.value
    if (!multiple && keys[0] === key) return
    const value = multiple
      ? keys.includes(key)
        ? keys.filter((value) => value !== key)
        : [...keys, key]
      : key
    const field = context.value.field
    await field.set(value)
    await field.validate()
  }
  function blur() {
    if (!binding.value.disabled) return context.value.field.validate()
  }
  return {
    messagesReady: messages.ready,
    view,
    presentation,
    choose,
    blur,
    focus: () => focusControl(view, () => binding.value.disabled),
  }
}
