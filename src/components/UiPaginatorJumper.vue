<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { computed, ref, watch } from 'vue'
  import View from '@uninterface/backend/UiPaginatorJumper.vue'
  import { uiBackend } from '@uninterface/backend'
  import type { UiPaginatorBinding } from '../bindings/list'
  import type { UiPaginatorJumperViewProps } from '../backend/collection'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useMessages } from '../i18n/messages'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiZOrderProps & {
      binding: UiPaginatorBinding
      ariaLabel?: string
    }
  >()
  provideStrategyView(useUiStrategyNode('paginator-jumper'))
  assertUiCapabilities(uiBackend, ['paginator.jumper.v1'])
  const messages = useMessages('collections')
  const binding = computed(() => {
    if (props.binding.target !== 'paginator')
      throw new Error('UiPaginatorJumper requires a paginator binding.')
    return props.binding
  })
  const page = computed(() =>
    binding.value.accepted?.kind === 'numbered' && binding.value.pageCount !== 0
      ? binding.value.accepted.number
      : undefined,
  )
  const draft = ref(''),
    edited = ref(false),
    invalid = ref(false)
  // Only a new accepted position/session resets the local draft. Pending intent,
  // unrelated rerenders and locale changes do not erase unfinished input.
  watch(
    [binding, page, () => binding.value.accepted?.size],
    () => {
      draft.value = page.value === undefined ? '' : String(page.value)
      edited.value = false
      invalid.value = false
    },
    { immediate: true },
  )
  const disabled = computed(
    () =>
      binding.value.pending ||
      !binding.value.canJump ||
      page.value === undefined,
  )
  function update(value: string) {
    if (disabled.value) return
    draft.value = value
    edited.value = true
    invalid.value = false
  }
  async function commit(reason: 'enter' | 'blur') {
    if (disabled.value || (reason === 'blur' && !edited.value)) return false
    const text = draft.value.trim(),
      value = Number(text),
      b = binding.value
    if (
      !/^\d+$/.test(text) ||
      !Number.isSafeInteger(value) ||
      value < 1 ||
      (b.pageCount !== undefined && value > b.pageCount)
    ) {
      invalid.value = true
      return false
    }
    invalid.value = false
    edited.value = false
    draft.value = String(value)
    return value === page.value ? false : b.goTo(value)
  }
  const view = computed<UiPaginatorJumperViewProps>(() => ({
    label: props.ariaLabel?.trim() || messages.value.pageJump,
    value: draft.value,
    disabled: disabled.value,
    pending: binding.value.pending,
    error: invalid.value ? messages.value.pageJumpInvalid : '',
    update,
    commit,
  }))
  const messagesReady = messages.ready
</script>
<template>
  <View
    v-if="messagesReady"
    v-bind="{ ...$attrs, ...view }"
  />
</template>
