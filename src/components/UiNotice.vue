<script setup lang="ts">
  import { resolveUiText } from '../text/source'
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { computed, watchEffect } from 'vue'
  import View from '@uninterface/backend/UiNotice.vue'
  import FeedbackActions from './internal/FeedbackActions'
  import UiButton from './UiButton.vue'
  import type { UiNoticeBinding, UiFeedbackAction } from '../feedback/routing'
  import { useMessages } from '../i18n/messages'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import type {
    UiNoticeKind,
    UiNoticeAnnouncement,
    UiNoticeVariant,
  } from '../presentation/notice'
  import { assertThemeColor, type UiThemeColor } from '../presentation/theme'
  import { layoutParticipation } from './internal/participation'
  defineOptions({
    inheritAttrs: false,
    [layoutParticipation]: (props: { binding?: UiNoticeBinding } | null) =>
      !props?.binding || props.binding.current !== undefined,
  })
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        binding?: UiNoticeBinding
        kind?: UiNoticeKind
        color?: UiThemeColor
        variant?: UiNoticeVariant
        title?: string
        announcement?: UiNoticeAnnouncement
        dismissible?: boolean
      }
    >(),
    { dismissible: undefined },
  )
  const feedback = computed(() => {
    const message = props.binding?.current
    if (!message) return undefined
    return {
      ...message,
      title: resolveUiText(message.title),
      message: resolveUiText(message.message),
      details: message.details?.map((detail) => resolveUiText(detail)),
      actions: message.actions?.map((action) => ({
        ...action,
        label: resolveUiText(action.label),
      })),
    }
  })
  const resolved = computed(() => ({
    kind: props.kind ?? feedback.value?.kind ?? 'info',
    color: props.color ?? feedback.value?.color,
    variant: props.variant ?? feedback.value?.variant,
    title: props.title ?? feedback.value?.title,
    announcement: props.announcement ?? feedback.value?.announcement ?? 'off',
    dismissible: props.dismissible ?? feedback.value?.dismissible ?? false,
  }))
  function actionProps(action: UiFeedbackAction) {
    const { key, label, ...button } = action
    return button
  }
  const emit = defineEmits<{ dismiss: [] }>()
  const messages = useMessages()
  function requestDismiss() {
    if (resolved.value.dismissible) {
      props.binding?.dismiss()
      emit('dismiss')
    }
  }
  assertUiCapabilities(uiBackend, [
    'notice.v1',
    'notice.color.v1',
    'notice.variant.v1',
    'notice.icon.v1',
  ])
  provideStrategyView(useUiStrategyNode('notice'))
  const presentation = computed(() => {
    if (
      !['info', 'success', 'warning', 'error', 'custom'].includes(
        resolved.value.kind,
      )
    )
      throw new Error('UiNotice: unsupported kind.')
    if (resolved.value.kind !== 'custom' && resolved.value.color !== undefined)
      throw new Error('UiNotice: color is only supported with kind="custom".')
    if (
      resolved.value.variant !== undefined &&
      !['filled', 'outline', 'soft'].includes(resolved.value.variant)
    )
      throw new Error('UiNotice: unsupported variant.')
    const color =
      resolved.value.kind === 'custom'
        ? resolved.value.color
        : resolved.value.kind === 'error'
          ? 'danger'
          : resolved.value.kind
    if (color !== undefined) assertThemeColor(uiBackend, color)
    return { color, variant: resolved.value.variant }
  })
  watchEffect(() => {
    if (props.binding) assertUiCapabilities(uiBackend, ['notice.binding.v1'])
    if (props.binding && props.binding.target !== 'notice')
      throw new Error('UiNotice: incompatible notice binding.')
    if (!['off', 'polite', 'assertive'].includes(resolved.value.announcement))
      throw new Error('UiNotice: unsupported announcement.')
  })
  const role = computed(() =>
    resolved.value.announcement === 'polite'
      ? 'status'
      : resolved.value.announcement === 'assertive'
        ? 'alert'
        : undefined,
  )
</script>
<template>
  <View
    v-if="!binding || feedback"
    v-bind="$attrs"
    :kind="resolved.kind"
    :color="presentation.color"
    :variant="presentation.variant"
    :title="resolved.title"
    :message="feedback?.message"
    :details="feedback?.details"
    :dismissible="resolved.dismissible"
    :dismiss-label="messages.close"
    :on-dismiss-request="requestDismiss"
    :role="role"
    :aria-live="resolved.announcement"
    :aria-atomic="resolved.announcement !== 'off' ? true : undefined"
  >
    <template
      v-if="$slots.icon"
      #icon
    >
      <slot name="icon" />
    </template>
    <template
      v-if="$slots.default"
      #default
    >
      <slot :feedback="feedback" />
    </template>
    <template
      v-if="$slots.actions || feedback?.actions?.length"
      #actions
    >
      <FeedbackActions>
        <slot
          name="actions"
          :feedback="feedback"
        >
          <UiButton
            v-for="action in feedback?.actions"
            :key="action.key"
            v-bind="actionProps(action)"
          >
            {{ action.label }}
          </UiButton>
        </slot>
      </FeedbackActions>
    </template>
  </View>
</template>
