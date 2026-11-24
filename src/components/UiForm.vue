<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const strategyNode = useUiStrategyNode('form')
  provideStrategyView(strategyNode)
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    provide,
    ref,
    useId,
    watchEffect,
  } from 'vue'
  import {
    buttonBindingScope,
    buttonBindingScopeKey,
    useButtonBindingHosts,
  } from '../bindings/button'
  import type { UiFormControl } from '../controls/form'
  import { UiFormSubmissionStateError } from '../controls/submission-error'
  import type { UiFormViewHandle } from '../backend'
  import View from '@uninterface/backend/UiForm.vue'
  const props = defineProps<
    UiZOrderProps & {
      id?: string
      control: UiFormControl
      save: (value: any) => Promise<unknown>
      accept?: (result: any, submitted: any) => Record<string, any>
      label: string
      height?: 'content' | 'full'
      /** Optional composed-field reveal/focus; true means recovery was handled. */
      focusInvalid?: () => Promise<boolean>
    }
  >()
  const generatedId = useId()
  watchEffect(() => {
    if (
      props.height !== undefined &&
      !['content', 'full'].includes(props.height)
    )
      throw new Error('UiForm: unsupported height.')
    if (props.height === 'full')
      assertUiCapabilities(uiBackend, ['form.height.v1'])
  })
  const formId = computed(() => props.id ?? `ui-form-${generatedId}`)
  const hosts = useButtonBindingHosts()
  const owner = Symbol('form view')
  watchEffect(
    (cleanup) => {
      const id = formId.value
      if (!id || /\s/.test(id))
        throw new Error(
          'UiForm: id must be nonempty and contain no whitespace.',
        )
      if (hosts.has(id)) throw new Error(`UiForm: duplicate form id "${id}".`)
      const scope = buttonBindingScope(props.control.bindings.submitButton)!
      hosts.set(id, { scope, owner })
      cleanup(() => {
        if (hosts.get(id)?.owner === owner) hosts.delete(id)
      })
    },
    { flush: 'sync' },
  )
  function registeredId() {
    if (hosts.get(formId.value)?.owner !== owner)
      throw new Error('UiForm: form id must have a unique registered host.')
    return formId.value
  }
  provide(
    buttonBindingScopeKey,
    computed(() => buttonBindingScope(props.control.bindings.submitButton)),
  )
  const view = ref<UiFormViewHandle>()
  let recovery = 0
  onBeforeUnmount(() => {
    recovery++
  })
  async function submit() {
    if (props.control.state.pending) return
    const version = ++recovery
    const control = props.control
    try {
      await props.control.submit(props.save, { accept: props.accept })
    } catch (error) {
      // The control has recorded the outcome. Native events have no awaiting caller.
      if (error instanceof UiFormSubmissionStateError) return
      if (
        props.control.state.error === error &&
        props.control.state.validity === 'invalid'
      ) {
        if (await props.focusInvalid?.()) return
        await nextTick()
        if (
          version === recovery &&
          control === props.control &&
          control.state.validity === 'invalid' &&
          control.state.error === error
        )
          view.value?.focusInvalid()
      }
    }
  }
  assertUiCapabilities(uiBackend, [
    'form.draft.v1',
    'validation.form.async.v1',
    'form.save.async.v1',
    'form.reset.v1',
  ])
</script>
<template>
  <View
    ref="view"
    :binding="{
      id: registeredId(),
      label,
      pending: control.state.pending || control.state.validating,
      height,
    }"
    @submit="submit"
    @reset="control.reset()"
  >
    <slot />
  </View>
</template>
