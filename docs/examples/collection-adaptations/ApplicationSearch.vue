<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
  import {
    UiField,
    UiInputFrame,
    UiTextInput,
    UiButton,
    UiStrategy,
    uiFieldLabels,
    type UiFilterViewContext,
    type UiSearchFilterEditorBinding,
    type UiTextSource,
  } from '@uninterface/uninterface'

  const props = defineProps<{
    context: UiFilterViewContext<UiSearchFilterEditorBinding>
  }>()
  const input = ref<InstanceType<typeof UiTextInput>>()
  const text = (value: UiTextSource | undefined, fallback: string) =>
    typeof value === 'function' ? value() : (value ?? fallback)
  const labels = computed(() =>
    uiFieldLabels(
      props.context.presentation.labelProvided ||
        props.context.presentation.usage === 'header-search'
        ? 'hidden'
        : 'show',
    ),
  )
  let mounted = true
  let submission = 0
  onBeforeUnmount(() => {
    mounted = false
    submission++
  })

  async function submit() {
    if (
      props.context.binding.disabled ||
      props.context.binding.editing.commit !== 'explicit'
    )
      return
    const revision = ++submission
    // Use the host operation, not binding.commit(): it also emits applied,
    // which lets column/badge hosts complete their popup interaction.
    const result = await props.context.submit()
    if (result === 'invalid' && mounted && revision === submission) {
      await nextTick()
      if (mounted && revision === submission) void input.value?.focus()
    }
  }
  function keydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.isComposing || event.keyCode === 229))
      event.preventDefault()
  }
</script>
<template>
  <form
    novalidate
    :aria-label="context.binding.label"
    @submit.prevent.stop="submit"
    @keydown="keydown"
  >
    <UiStrategy :use="labels">
      <UiField
        :field="context.editor.field"
        :label="context.binding.label"
        :disabled="context.binding.disabled"
      >
        <UiInputFrame>
          <UiTextInput
            ref="input"
            type="search"
            enterkeyhint="search"
            :placeholder="
              text(context.editor.placeholder, context.binding.label)
            "
          />
          <template
            v-if="context.binding.editing.commit === 'explicit'"
            #trailing
          >
            <UiButton
              type="submit"
              variant="text"
              :disabled="context.binding.disabled"
              :loading="context.binding.validating"
            >
              {{ text(context.editor.searchLabel, context.binding.label) }}
            </UiButton>
          </template>
        </UiInputFrame>
      </UiField>
    </UiStrategy>
  </form>
</template>
