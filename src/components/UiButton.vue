<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const strategyNode = useUiStrategyNode('button')
  provideStrategyView(strategyNode)
  import { getCurrentInstance, inject, ref, useAttrs, useSlots } from 'vue'
  import View from '@uninterface/backend/UiButton.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { assertThemeColor, type UiThemeColor } from '../presentation/theme'
  import type { UiButtonVariant } from '../presentation/button'
  import { collectionActionKey } from '../collection/action-variant'
  const collectionAction = inject(collectionActionKey, undefined)
  import { provideButtonDefault } from '../presentation/buttonDefaults'
  provideButtonDefault()
  import { focusControl } from './internal/focus'
  import type { UiFocusHandle, UiButtonViewProps } from '../backend'
  import {
    assertButtonBinding,
    buttonActivationKey,
    buttonBindingScopeKey,
    useButtonBindingHosts,
    type UiButtonBinding,
  } from '../bindings/button'
  import {
    defineUiInputFrameContract,
    useUiInputFrameParticipant,
  } from '../input-frame/participation'
  import { useMessages } from '../i18n/messages'

  defineOptions({
    inheritAttrs: false,
    uiInputFrame: defineUiInputFrameContract({ role: 'action' }),
  })
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        binding?: UiButtonBinding
        form?: string
        type?: 'button' | 'submit' | 'reset'
        color?: UiThemeColor
        variant?: UiButtonVariant
        disabled?: boolean
        loading?: boolean
        allowWhenReadonly?: boolean
      }
    >(),
    { disabled: undefined, loading: undefined },
  )
  const emit = defineEmits<{ click: [event: MouseEvent] }>()
  const view = ref<UiFocusHandle>()
  defineExpose({
    focus: () => focusControl(view, () => Boolean(viewProps().disabled)),
  })
  const attrs = useAttrs()
  const slots = useSlots()
  const instance = getCurrentInstance()!
  const messages = useMessages()
  const inputFrame = useUiInputFrameParticipant()
  const scope = inject(buttonBindingScopeKey, undefined)
  const activate = inject(buttonActivationKey, undefined)
  const hosts = useButtonBindingHosts()
  const variants: readonly UiButtonVariant[] = [
    'filled',
    'outline',
    'neutral',
    'soft',
    'text',
    'icon',
  ]

  function viewProps(): UiButtonViewProps {
    if (slots.icon) assertUiCapabilities(uiBackend, ['button.icon.v1'])
    if (props.color !== undefined) assertThemeColor(uiBackend, props.color)
    if (props.variant !== undefined && !variants.includes(props.variant))
      throw new Error(`UiButton: unsupported variant "${props.variant}".`)
    const bound = props.binding
    const explicitForm = props.form !== undefined
    if (explicitForm && (!props.form || /\s/.test(props.form)))
      throw new Error(
        'UiButton: form must be a nonempty form id without whitespace.',
      )
    const host = explicitForm ? hosts.get(props.form!) : undefined
    if (bound) {
      if (instance.vnode.props?.onClick || instance.vnode.props?.onClickOnce)
        throw new Error(
          'UiButton: binding owns activation; do not also supply a click handler.',
        )
      // A footer may render before its sibling form. Keep it unavailable until
      // the matching host registers, and recheck the live association on click.
      assertButtonBinding(
        bound,
        explicitForm ? host?.scope : scope?.value,
        !explicitForm || Boolean(host),
      )
      if (props.type !== undefined || props.loading !== undefined)
        throw new Error(
          'UiButton: binding owns type and loading; do not supply both.',
        )
      if (explicitForm && bound.type === 'button')
        throw new Error(
          'UiButton: form association requires a submit or reset binding.',
        )
    }
    const type = bound?.type ?? props.type ?? 'button'
    if (!['button', 'submit', 'reset'].includes(type))
      throw new Error(`UiButton: unsupported type "${type}".`)
    const requirements = ['actions.v1', 'control.focus.v1']
    if (slots.icon) assertUiCapabilities(uiBackend, ['button.icon.v1'])
    if (props.color !== undefined) requirements.push('button.color.v1')
    if (props.variant !== undefined) requirements.push('button.variant.v1')
    if (bound) requirements.push('button.binding.v1')
    if (bound || props.loading !== undefined)
      requirements.push('button.loading.v1')
    if (type === 'reset') requirements.push('form.reset.v1')
    assertUiCapabilities(uiBackend, requirements)
    const loading = bound?.loading ?? props.loading ?? false
    return {
      type,
      frame: inputFrame?.frame,
      form: props.form,
      color: props.color,
      variant: props.variant,
      collectionAction: collectionAction?.value,
      disabled: Boolean(
        inputFrame?.binding.value.disabled ||
          (inputFrame?.readonly.value &&
            (!props.allowWhenReadonly || type === 'reset')) ||
          props.disabled ||
          bound?.disabled ||
          loading ||
          (bound && explicitForm && !host),
      ),
      loading,
      loadingLabel: messages.value.loading,
    }
  }

  function click(event: MouseEvent) {
    // Check live state as well as native disabled markup: two activations may
    // occur before Vue has rendered a pending-state change.
    let current: UiButtonViewProps
    try {
      current = viewProps()
    } catch (error) {
      // A runtime association error must also cancel the browser default;
      // reporting a Vue error alone would still allow native submission.
      event.preventDefault()
      event.stopImmediatePropagation()
      throw error
    }
    if (current.disabled) {
      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }
    if (props.binding) {
      if (props.binding.activate) {
        event.preventDefault()
        return activate
          ? activate(props.binding, () => props.binding!.activate!(), event)
          : props.binding.activate()
      }
      // Bound submit/reset has one route: the associated native form event.
      return
    }
    emit('click', event)
  }
</script>
<template>
  <View
    ref="view"
    v-bind="{ ...attrs, ...viewProps() }"
    @click="click"
  >
    <slot />
    <template
      v-if="$slots.icon"
      #icon
    >
      <slot name="icon" />
    </template>
  </View>
</template>
