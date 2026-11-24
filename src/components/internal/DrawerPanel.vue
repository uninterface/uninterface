<script setup lang="ts">
  import {
    computed,
    getCurrentInstance,
    onActivated,
    onDeactivated,
    provide,
    ref,
    useAttrs,
    useId,
    useSlots,
    watchEffect,
  } from 'vue'
  import View from '@uninterface/backend/UiDrawer.vue'
  import DrawerContent from './DrawerContent.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../../backend/capabilities'
  import {
    assertDrawerBinding,
    type UiDrawerBinding,
  } from '../../bindings/drawer'
  import { useDrawerSizing } from './drawerSizing'
  import type { UiDrawerSizingProps } from '../../layout/drawer'
  import type { UiZOrderProps } from '../../stacking/authoring'
  import {
    useUiStrategyNode,
    provideStrategyView,
  } from '../../strategy/context'
  import { availableHeightKey } from '../../layout/hosting'
  import { useMessages } from '../../i18n/messages'
  import type { UiDrawerEdge } from '../../presentation/overlay'
  import type { UiOverlayCloseTrigger } from '../../controls/overlay'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(
    defineProps<
      UiZOrderProps &
        UiDrawerSizingProps & {
          mode?: 'panel' | 'docked'
          expanded?: boolean
          binding?: UiDrawerBinding
          disabled?: boolean
          lazy?: boolean
          title?: string
          edge?: UiDrawerEdge
          closeOn?: readonly UiOverlayCloseTrigger[]
        }
    >(),
    {
      mode: 'panel',
      expanded: undefined,
      disabled: false,
      lazy: false,
      edge: 'end',
      closeOn: () => ['close-button', 'escape', 'trigger', 'drag'],
    },
  )
  const emit = defineEmits<{ 'update:expanded': [expanded: boolean] }>()
  provideStrategyView(useUiStrategyNode('drawer'))
  provide(availableHeightKey, ref(undefined))
  assertUiCapabilities(uiBackend, ['drawer.v1'])
  const attrs = useAttrs(),
    slots = useSlots(),
    instance = getCurrentInstance()!,
    id = useId(),
    messages = useMessages()
  const enabled = ref(true),
    visited = ref(false)
  onDeactivated(() => {
    enabled.value = false
  })
  onActivated(() => {
    enabled.value = true
  })
  const state = computed(() => {
    if (props.binding) {
      assertDrawerBinding(props.binding)
      if (
        props.expanded !== undefined ||
        instance.vnode.props?.['onUpdate:expanded']
      )
        throw new Error(
          'UiDrawer: binding owns expansion; do not also supply v-model:expanded.',
        )
      return {
        expanded: props.binding.expanded,
        disabled: props.disabled || props.binding.disabled,
      }
    }
    if (typeof props.expanded !== 'boolean')
      throw new Error(
        'UiDrawer panel requires v-model:expanded or a drawer binding.',
      )
    return { expanded: props.expanded, disabled: props.disabled }
  })
  const { sizing, docked } = useDrawerSizing(
    props,
    id,
    () => enabled.value && state.value.expanded,
    () => state.value.disabled,
  )
  function requestExpanded(expanded: boolean) {
    if (state.value.disabled || state.value.expanded === expanded) return
    if (props.binding) props.binding.requestExpanded(expanded)
    else emit('update:expanded', expanded)
  }
  function fail(error: unknown) {
    throw error
  }
  function triggerExpanded(expanded: boolean) {
    if (expanded) requestExpanded(true)
    else cancel('trigger')
  }
  function cancel(reason: UiOverlayCloseTrigger) {
    if (props.closeOn.includes(reason)) requestExpanded(false)
  }
  function viewAttributes() {
    const result = { ...attrs }
    for (const key of [
      'mode',
      'control',
      'role',
      'aria-modal',
      'aria-labelledby',
      'onCancel',
    ])
      delete result[key]
    return result
  }
  watchEffect(() => {
    if (!(props.title?.trim() || String(attrs['aria-label'] ?? '').trim()))
      throw new Error('UiDrawer requires a title or aria-label.')
    if (slots.actions && slots.footer)
      throw new Error('Use either actions or footer, not both.')
    if (!['start', 'end', 'top', 'bottom'].includes(props.edge))
      throw new Error('Unsupported drawer edge.')
    if (
      props.closeOn.some(
        (reason) =>
          !['close-button', 'escape', 'outside', 'trigger', 'drag'].includes(
            reason,
          ),
      )
    )
      throw new Error('Unsupported overlay close route.')
    if (!props.lazy || state.value.expanded) visited.value = true
  })
</script>
<template>
  <View
    v-bind="viewAttributes()"
    :id="id"
    :title="title"
    :name="String(attrs['aria-label'] ?? title ?? '')"
    :active="enabled && state.expanded"
    :mounted="visited"
    :docked="docked"
    :drawer-sizing="sizing"
    panel
    :modal="false"
    :edge="edge"
    placement="bottom"
    align="start"
    :close-on="closeOn"
    :close-label="messages.close"
    :pending-close="false"
    :disabled="state.disabled"
    @cancel="cancel"
    @failure="fail"
    @update:expanded="triggerExpanded"
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
    <template #default>
      <DrawerContent :edge="edge">
        <slot
          :expanded="state.expanded"
          :close="() => requestExpanded(false)"
        />
      </DrawerContent>
    </template>
    <template
      v-if="slots['header-extra']"
      #header-extra
    >
      <slot
        name="header-extra"
        :expanded="state.expanded"
        :close="() => requestExpanded(false)"
      />
    </template>
    <template
      v-if="slots.actions"
      #actions
    >
      <slot
        name="actions"
        :expanded="state.expanded"
        :close="() => requestExpanded(false)"
      />
    </template>
    <template
      v-if="slots.footer"
      #footer
    >
      <slot
        name="footer"
        :expanded="state.expanded"
        :close="() => requestExpanded(false)"
      />
    </template>
  </View>
</template>
