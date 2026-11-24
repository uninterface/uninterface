<script setup lang="ts" generic="T = void">
  import { provide, ref, useAttrs, useId, useSlots, watchEffect } from 'vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../../backend/capabilities'
  import {
    useUiStrategyNode,
    provideStrategyView,
  } from '../../strategy/context'
  import { availableHeightKey } from '../../layout/hosting'
  import { useMessages } from '../../i18n/messages'
  import { useOverlayRun } from './overlayRun'
  import type {
    UiOverlayControl,
    UiOverlayCloseTrigger,
  } from '../../controls/overlay'
  import type { UiModalViewHandle } from '../../backend'
  import { useDrawerSizing } from './drawerSizing'
  import type { UiDrawerSizingProps } from '../../layout/drawer'
  import type { UiZOrderProps } from '../../stacking/authoring'
  import View from '@uninterface/backend/UiDrawer.vue'
  import DrawerContent from './DrawerContent.vue'
  import type { UiDrawerEdge } from '../../presentation/overlay'

  defineOptions({ inheritAttrs: false })
  const props = withDefaults(
    defineProps<
      UiZOrderProps &
        UiDrawerSizingProps & {
          control: UiOverlayControl<T>
          title?: string
          closeOn?: readonly UiOverlayCloseTrigger[]
          edge?: UiDrawerEdge
        }
    >(),
    {
      closeOn: () => ['close-button', 'escape', 'outside', 'drag'],
      edge: 'end',
    },
  )
  const attrs = useAttrs(),
    slots = useSlots(),
    id = useId(),
    messages = useMessages()
  const view = ref<UiModalViewHandle>()
  const { session, cancel, fail } = useOverlayRun(
    () => props.control,
    view,
    () => props.closeOn,
  )

  const { sizing } = useDrawerSizing(
    props,
    id,
    () => !!session.value,
    () => props.control.state.pendingClose,
  )
  provideStrategyView(useUiStrategyNode('drawer'))
  provide(availableHeightKey, ref(undefined))
  assertUiCapabilities(uiBackend, ['drawer.v1'])
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
  watchEffect(() => {
    if (!(props.title?.trim() || String(attrs['aria-label'] ?? '').trim()))
      throw new Error('UiDrawer requires a title or aria-label.')
    if (slots.actions && slots.footer)
      throw new Error('Use either actions or footer, not both.')
    if (
      props.closeOn.some(
        (reason) =>
          !['close-button', 'escape', 'outside', 'trigger', 'drag'].includes(
            reason,
          ),
      )
    )
      throw new Error('Unsupported overlay close route.')
    if (!['start', 'end', 'top', 'bottom'].includes(props.edge))
      throw new Error('Unsupported drawer edge.')
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
    :drawer-sizing="sizing"
    :panel="false"
    :modal="true"
    :edge="edge"
    placement="bottom"
    align="start"
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
      <slot
        name="host"
        v-bind="scope"
      />
    </template>
    <template
      v-if="session"
      #default
    >
      <DrawerContent :edge="edge"><slot :session="session" /></DrawerContent>
    </template>
    <template
      v-if="slots['header-extra'] && session"
      #header-extra
    >
      <slot
        name="header-extra"
        :session="session!"
      />
    </template>
    <template
      v-if="slots.actions && session"
      #actions
    >
      <slot
        name="actions"
        :session="session!"
      />
    </template>
    <template
      v-if="slots.footer && session"
      #footer
    >
      <slot
        name="footer"
        :session="session!"
      />
    </template>
  </View>
</template>
