<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  defineOptions({
    inheritAttrs: false,
    uiInputFrame: defineUiInputFrameContract({ role: 'editor' }),
  })
  import {
    defineUiInputFrameContract,
    useUiInputFrameParticipant,
  } from '../input-frame/participation'
  import type { UiInputProjection } from '../input-frame/projection'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const strategyNode = useUiStrategyNode('text-editor')
  provideStrategyView(strategyNode)
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import {
    computed,
    ref,
    watch,
    watchEffect,
    onDeactivated,
    onActivated,
    onScopeDispose,
  } from 'vue'
  import { passwordShortcut } from '../controls/password'
  import { useMessagesWhen } from '../i18n/messages'
  import UiSuggestions from './UiSuggestions.vue'
  import type { UiTextSuggestionsBinding } from '../search/control'
  import type { SuggestionSlotProps } from '../search/suggestionContent'
  import View from '@uninterface/backend/UiTextInput.vue'
  import type { UiFocusHandle } from '../backend'
  import { focusControl } from './internal/focus'
  import { controlBinding, useField } from '../controls/context'
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        inputmode?: 'text' | 'decimal'
        autocomplete?: string
        disabled?: boolean
        readonly?: boolean
        type?: 'text' | 'password' | 'search'
        minWidthCharacters?: number
        maxWidthCharacters?: number
        projection?: UiInputProjection
        suggestions?: UiTextSuggestionsBinding<any>
        multiline?: boolean
        passwordReveal?: boolean
        passwordRevealed?: boolean
        passwordRevealShortcut?: string | null
      }
    >(),
    {
      inputmode: 'text',
      autocomplete: 'off',
      type: 'text',
      passwordReveal: undefined,
      passwordRevealed: undefined,
    },
  )
  defineSlots<{
    suggestion(props: SuggestionSlotProps<any>): any
  }>()
  const emit = defineEmits<{ 'update:passwordRevealed': [value: boolean] }>()
  const localRevealed = ref(false)
  const revealEnabled = computed(
    () =>
      props.type === 'password' &&
      props.passwordReveal !== false &&
      (props.passwordReveal === true ||
        props.passwordRevealed !== undefined ||
        typeof props.passwordRevealShortcut === 'string'),
  )
  const messages = useMessagesWhen(() => revealEnabled.value, 'password')
  const revealed = computed(
    () =>
      revealEnabled.value &&
      !binding.value.disabled &&
      (props.passwordRevealed ?? localRevealed.value),
  )
  const shortcut = computed(() =>
    passwordShortcut(props.passwordRevealShortcut),
  )
  watchEffect(() => {
    void shortcut.value
    if (
      props.suggestions &&
      (!['text', 'search'].includes(props.type) || props.multiline)
    )
      throw new Error('Suggestions require single-line text input.')
    if (
      (props.passwordReveal === true ||
        props.passwordRevealed !== undefined ||
        typeof props.passwordRevealShortcut === 'string') &&
      props.type !== 'password'
    )
      throw new Error(
        'Password reveal is only supported by a password UiTextInput.',
      )
    if (revealEnabled.value)
      assertUiCapabilities(uiBackend, ['input.text.password-reveal.v1'])
  })
  function toggleReveal() {
    if (!revealEnabled.value || binding.value.disabled) return
    const next = !revealed.value
    if (props.passwordRevealed === undefined) localRevealed.value = next
    emit('update:passwordRevealed', next)
  }
  function revealKeydown(event: KeyboardEvent) {
    if (
      !revealEnabled.value ||
      binding.value.disabled ||
      !shortcut.value?.(event)
    )
      return
    event.preventDefault()
    event.stopPropagation()
    toggleReveal()
  }
  const reveal = computed(() =>
    revealEnabled.value && messages.ready.value
      ? {
          shown: revealed.value,
          label: revealed.value
            ? messages.value.hidePassword
            : messages.value.showPassword,
          toggle: toggleReveal,
          keydown: revealKeydown,
        }
      : undefined,
  )
  const validMode = computed(
    () =>
      ['text', 'password', 'search'].includes(props.type) &&
      !(props.multiline && props.type !== 'text'),
  )
  const view = ref<UiFocusHandle>()
  const participant = useUiInputFrameParticipant({
    projection: () => props.projection,
    disabled: () => Boolean(props.disabled),
    readonly: () => Boolean(props.readonly),
    focus: () => focusControl(view, () => binding.value.disabled),
  })
  const context = participant ? undefined : useField()
  const binding = computed(
    () =>
      participant?.binding.value ??
      controlBinding(context!.value, props.disabled),
  )
  const effectiveReadonly = computed(
    () => participant?.readonly.value ?? Boolean(props.readonly),
  )
  const value = computed(
    () => participant?.value.value ?? context!.value.field.state.input,
  )
  watchEffect(() => {
    if (participant && props.multiline)
      throw new Error('UiInputFrame supports single-line text editors only.')
    for (const key of ['minWidthCharacters', 'maxWidthCharacters'] as const) {
      const width = props[key]
      if (width === undefined) continue
      if (!participant || props.multiline)
        throw new Error(
          `UiTextInput ${key} requires a single-line editor inside UiInputFrame.`,
        )
      if (!Number.isSafeInteger(width) || width < 1)
        throw new Error(`UiTextInput ${key} must be a positive integer.`)
      assertUiCapabilities(uiBackend, [
        key === 'minWidthCharacters'
          ? 'input.frame.min-width.v1'
          : 'input.frame.sizing.v1',
      ])
    }
    if (
      props.minWidthCharacters !== undefined &&
      props.maxWidthCharacters !== undefined &&
      props.minWidthCharacters > props.maxWidthCharacters
    )
      throw new Error(
        'UiTextInput minWidthCharacters must not exceed maxWidthCharacters.',
      )
    if (!participant && props.projection)
      throw new Error('UiTextInput projection requires UiInputFrame.')
  })
  watch(
    () => [revealEnabled.value, binding.value.disabled],
    () => {
      if (!revealEnabled.value || binding.value.disabled)
        localRevealed.value = false
    },
  )
  let active = true
  onScopeDispose(() => {
    active = false
  })
  onActivated(() => {
    active = true
  })
  onDeactivated(() => {
    active = false
    localRevealed.value = false
  })
  defineExpose({
    focus: () => focusControl(view, () => binding.value.disabled),
  })
  function update(value: string) {
    if (!binding.value.disabled && !effectiveReadonly.value)
      return participant
        ? participant.update(value)
        : context!.value.field.set(value)
  }
  assertUiCapabilities(uiBackend, ['input.text.v1', 'control.focus.v1'])
  watch(
    () => [props.type, props.multiline, props.readonly],
    () => {
      if (!['text', 'password', 'search'].includes(props.type))
        throw new Error('UiTextInput: unsupported type.')
      if (props.multiline && props.type !== 'text')
        throw new Error(`UiTextInput: ${props.type} cannot be multiline.`)
      assertUiCapabilities(uiBackend, [
        ...(props.type === 'password' ? ['input.text.password.v1'] : []),
        ...(props.type === 'search' ? ['input.text.search.v1'] : []),
        ...(props.multiline ? ['input.text.multiline.v1'] : []),
        ...(props.readonly ? ['input.text.readonly.v1'] : []),
      ])
    },
    { immediate: true, flush: 'sync' },
  )
  async function acceptSuggestion(item: unknown) {
    if (!props.suggestions || binding.value.disabled || effectiveReadonly.value)
      return
    const suggestions = props.suggestions
    const text = suggestions.text(item)
    if (text === value.value) return
    await update(text)
    if (
      !active ||
      props.suggestions !== suggestions ||
      value.value !== text ||
      binding.value.disabled ||
      effectiveReadonly.value
    )
      return
    suggestions.syncQuery(text)
    if (!participant) await context!.value.field.validate()
  }
  let editorDraft:
    | { value: string; binding: UiTextSuggestionsBinding }
    | undefined
  function updateSuggestionDraft(draft: string) {
    const suggestions = props.suggestions
    if (
      suggestions &&
      draft !== value.value &&
      !binding.value.disabled &&
      !effectiveReadonly.value
    ) {
      editorDraft = { value: draft, binding: suggestions }
    }
    const result = update(draft)
    if (value.value !== draft) editorDraft = undefined
    return result
  }
  watch(
    [() => value.value, () => props.suggestions],
    ([value, suggestions]) => {
      // A toolkit can write the draft before the host's input listener runs.
      // The host owns that query, including when it defers input during IME.
      const fromEditor =
        editorDraft !== undefined &&
        editorDraft.value === value &&
        editorDraft.binding === suggestions
      editorDraft = undefined
      if (
        !fromEditor &&
        suggestions &&
        suggestions.status !== 'disposed' &&
        suggestions.query !== value
      )
        suggestions.syncQuery(value)
    },
    { flush: 'post', immediate: true },
  )
  function blur() {
    if (!participant && !binding.value.disabled)
      return context!.value.field.validate()
  }
</script>
<template>
  <UiSuggestions
    v-if="suggestions"
    :binding="suggestions"
    :disabled="binding.disabled || effectiveReadonly"
    :engagement="participant?.setEngaged"
    @accept="acceptSuggestion"
  >
    <template #host="{ host }">
      <View
        v-if="validMode"
        v-bind="{ ...$attrs, ...host }"
        ref="view"
        :binding="binding"
        :value="value"
        :frame="participant?.frame"
        :min-width-characters="minWidthCharacters"
        :max-width-characters="maxWidthCharacters"
        :description-binding="participant?.descriptionBinding.value"
        :aria-label="participant?.label.value"
        :inputmode="inputmode"
        :autocomplete="autocomplete"
        :type="revealed ? 'text' : type"
        :reveal="reveal"
        :multiline="multiline"
        :readonly="effectiveReadonly"
        @update="updateSuggestionDraft"
        @blur="blur"
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
    v-else-if="validMode"
    v-bind="$attrs"
    ref="view"
    :binding="binding"
    :value="value"
    :frame="participant?.frame"
    :min-width-characters="minWidthCharacters"
    :max-width-characters="maxWidthCharacters"
    :description-binding="participant?.descriptionBinding.value"
    :aria-label="participant?.label.value"
    :inputmode="inputmode"
    :autocomplete="autocomplete"
    :type="revealed ? 'text' : type"
    :reveal="reveal"
    :multiline="multiline"
    :readonly="effectiveReadonly"
    @update="update"
    @blur="blur"
  />
</template>
