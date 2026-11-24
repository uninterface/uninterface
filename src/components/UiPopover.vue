<script setup lang="ts" generic="T = void">
  import { provide, ref, useAttrs, useId, watchEffect } from 'vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import { availableHeightKey } from '../layout/hosting'
  import { useMessages } from '../i18n/messages'
  import { useOverlayRun } from './internal/overlayRun'
  import type {
    UiOverlayControl,
    UiOverlayCloseTrigger,
  } from '../controls/overlay'
  import type { UiModalViewHandle } from '../backend'
  import type { UiZOrderProps } from '../stacking/authoring'
  import { provideZModal } from '../stacking/overlays'
  import { useZComponent } from '../stacking/runtime'
  import View from '@uninterface/backend/UiPopover.vue'
  import type {
    UiPopoverPlacement,
    UiPopoverAlign,
  } from '../presentation/overlay'

  import {
    defineUiInputFrameContract,
    useUiInputFrameParticipant,
    renderUiInputFrameChildren,
    renderUiInputFrameOutside,
  } from '../input-frame/participation'
  defineOptions({
    inheritAttrs: false,
    uiInputFrame: defineUiInputFrameContract({
      role: 'composition',
      forwards: true,
    }),
  })
  const participant = useUiInputFrameParticipant()

  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        control: UiOverlayControl<T>
        title?: string
        closeOn?: readonly UiOverlayCloseTrigger[]
        modal?: boolean
        placement?: UiPopoverPlacement
        align?: UiPopoverAlign
      }
    >(),
    {
      closeOn: () => ['escape', 'outside', 'trigger'],
      modal: false,
      placement: 'bottom',
      align: 'start',
    },
  )
  const slots = defineSlots<{
    host?(props: {
      buttonTrigger: Record<string, any>
      anchor: Record<string, any>
    }): any
    default?(props: {
      session: import('../controls/overlay').UiOverlaySession<T>
    }): any
    'header-extra'?(props: {
      session: import('../controls/overlay').UiOverlaySession<T>
    }): any
    actions?(props: {
      session: import('../controls/overlay').UiOverlaySession<T>
    }): any
    footer?(props: {
      session: import('../controls/overlay').UiOverlaySession<T>
    }): any
  }>()
  const attrs = useAttrs(),
    id = useId(),
    messages = useMessages()
  const view = ref<UiModalViewHandle>()
  const { session, cancel, fail } = useOverlayRun(
    () => props.control,
    view,
    () => props.closeOn,
  )
  const isModal = props.modal
  if (isModal) provideZModal(() => props.zOrder)
  else useZComponent()
  provideStrategyView(useUiStrategyNode('popover'))
  provide(availableHeightKey, ref(undefined))
  assertUiCapabilities(uiBackend, ['popover.v1'])
  function viewAttributes() {
    const result = { ...attrs }
    for (const key of [
      'mode',
      'expanded',
      'binding',
      'lazy',
      'disabled',
      'role',
      'aria-modal',
      'aria-labelledby',
      'onCancel',
      'onFailure',
    ])
      delete result[key]
    return result
  }
  watchEffect(() => participant?.setEngaged(Boolean(session.value)))
  function Host(scope: Record<string, unknown>) {
    const children =
      slots.host?.(
        scope as {
          buttonTrigger: Record<string, any>
          anchor: Record<string, any>
        },
      ) ?? []
    return participant
      ? renderUiInputFrameChildren(children, participant)
      : children
  }
  function OutsideContent(props: {
    name: 'default' | 'header-extra' | 'actions' | 'footer'
  }) {
    const children = slots[props.name]?.({ session: session.value! }) ?? []
    return participant
      ? renderUiInputFrameOutside(children, participant)
      : children
  }
  watchEffect(() => {
    if (props.modal !== isModal)
      throw new Error('Changing overlay modality requires a keyed remount.')
    if (!(props.title?.trim() || String(attrs['aria-label'] ?? '').trim()))
      throw new Error('UiPopover requires a title or aria-label.')
    if (slots.actions && slots.footer)
      throw new Error('Use either actions or footer, not both.')
    if (
      props.closeOn.some(
        (reason) =>
          !['close-button', 'escape', 'outside', 'trigger'].includes(reason),
      )
    )
      throw new Error('Unsupported overlay close route.')
    if (
      !['start', 'end', 'top', 'bottom'].includes(props.placement) ||
      !['start', 'center', 'end'].includes(props.align)
    )
      throw new Error('Unsupported popover placement or alignment.')
  })
</script>
<template>
  <View
    ref="view"
    v-bind="viewAttributes()"
    :id="id"
    :title="title"
    :name="String(attrs['aria-label'] ?? title ?? '')"
    :active="!!session"
    :mounted="!!session"
    :panel="false"
    :modal="modal"
    edge="end"
    :placement="placement"
    :align="align"
    :close-on="closeOn"
    :close-label="messages.close"
    :pending-close="control.state.pendingClose"
    :disabled="false"
    @cancel="cancel"
    @failure="fail"
  >
    <template
      v-if="slots.host"
      #host="scope"
    >
      <Host v-bind="scope" />
    </template>
    <template
      v-if="session"
      #default
    >
      <OutsideContent name="default" />
    </template>
    <template
      v-if="slots['header-extra'] && session"
      #header-extra
    >
      <OutsideContent name="header-extra" />
    </template>
    <template
      v-if="slots.actions && session"
      #actions
    >
      <OutsideContent name="actions" />
    </template>
    <template
      v-if="slots.footer && session"
      #footer
    >
      <OutsideContent name="footer" />
    </template>
  </View>
</template>
