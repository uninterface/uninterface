<script setup lang="ts">
  import {
    computed,
    ref,
    nextTick,
    onBeforeUnmount,
    onDeactivated,
    watch,
  } from 'vue'
  import UiField from '../../../components/UiField.vue'
  import UiStrategy from '../../../components/UiStrategy.vue'
  import { uiFieldLabels, uiValidationFailure } from '../../../strategy/common'
  import { createUiInputProjection } from '../../../input-frame/projection'
  import { useMessages } from '../../../i18n/messages'
  import { resolveUiText } from '../../../text/source'
  import type {
    UiFilterViewContext,
    UiRangeFilterEditorBinding,
  } from '../types'
  const props = defineProps<{
    context: UiFilterViewContext<UiRangeFilterEditorBinding<any>>
  }>()
  const messages = useMessages('collections')
  const form = ref<HTMLFormElement>()
  const minimum = createUiInputProjection(
    props.context.editor.field,
    'minimum',
    {
      label: () =>
        resolveUiText(props.context.editor.minimumLabel) ??
        messages.value.filterMinimum,
    },
  )
  const maximum = createUiInputProjection(
    props.context.editor.field,
    'maximum',
    {
      label: () =>
        resolveUiText(props.context.editor.maximumLabel) ??
        messages.value.filterMaximum,
    },
  )
  const presentation = computed(() => [
    ...(props.context.presentation.labelProvided
      ? [uiFieldLabels('hidden')]
      : []),
    ...(props.context.presentation.container === 'popover'
      ? [uiValidationFailure('show-tooltip')]
      : []),
  ])
  const explicitPopup = computed(
    () =>
      ['table-column', 'filter-badge'].includes(
        props.context.presentation.usage,
      ) && props.context.presentation.container === 'popover',
  )
  const completeOnExit = computed(
    () =>
      props.context.binding.editing.commit === 'explicit' &&
      !explicitPopup.value,
  )
  let exitTimer: ReturnType<typeof setTimeout> | undefined
  let mounted = true
  let completion = 0
  function cancelExit() {
    clearTimeout(exitTimer)
    exitTimer = undefined
  }
  onBeforeUnmount(() => {
    mounted = false
    completion++
    cancelExit()
  })
  onDeactivated(() => {
    completion++
    cancelExit()
  })
  watch(
    completeOnExit,
    () => {
      completion++
      cancelExit()
    },
    { flush: 'sync' },
  )
  function focusout(event: FocusEvent) {
    const root = form.value
    if (!completeOnExit.value || !root) return
    if (event.relatedTarget && root.contains(event.relatedTarget as Node))
      return
    cancelExit()
    // Let native focus restoration and disclosure/reset actions finish first.
    // View removal is hiding, not an implicit commit of the retained draft.
    exitTimer = setTimeout(() => {
      exitTimer = undefined
      if (
        !mounted ||
        !root.isConnected ||
        !completeOnExit.value ||
        root.contains(root.ownerDocument.activeElement) ||
        !props.context.binding.dirty
      )
        return
      void submit(false)
    }, 0)
  }
  function keydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.isComposing || event.keyCode === 229)) {
      event.preventDefault()
      return
    }
    if (
      props.context.binding.editing.commit !== 'explicit' ||
      event.key !== 'Enter' ||
      event.isComposing ||
      event.keyCode === 229 ||
      event.defaultPrevented ||
      !(event.target instanceof HTMLInputElement)
    )
      return
    // With two text inputs and no submit button, HTML implicit submission is
    // not guaranteed. Handle only these range inputs, leaving Clear native.
    event.preventDefault()
    event.stopPropagation()
    void submit()
  }
  async function submit(recoverFocus = true) {
    cancelExit()
    const revision = ++completion
    if (
      (await props.context.submit()) === 'invalid' &&
      recoverFocus &&
      mounted &&
      revision === completion
    ) {
      await nextTick()
      form.value?.querySelector<HTMLElement>('input')?.focus()
    }
  }
  const messagesReady = messages.ready
</script>
<template>
  <form
    v-if="messagesReady"
    ref="form"
    novalidate
    :aria-label="context.binding.label"
    @submit.prevent.stop="submit()"
    @focusout="focusout"
    @focusin="cancelExit"
    @keydown="keydown"
  >
    <UiStrategy :use="presentation">
      <UiField
        :field="context.editor.field"
        :label="context.binding.label"
        :disabled="context.binding.disabled"
        group
      >
        <slot
          :minimum-placeholder="
            resolveUiText(context.editor.minimumPlaceholder) ??
            messages.filterMinimum
          "
          :maximum-placeholder="
            resolveUiText(context.editor.maximumPlaceholder) ??
            messages.filterMaximum
          "
          :apply-label="
            resolveUiText(context.editor.applyLabel) ?? messages.filterApply
          "
          :clear-label="
            resolveUiText(context.editor.clearLabel) ?? messages.filterClear
          "
          :minimum="minimum"
          :maximum="maximum"
        />
      </UiField>
    </UiStrategy>
  </form>
</template>
