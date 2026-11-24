<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import {
    computed,
    inject,
    onBeforeUnmount,
    provide,
    ref,
    watchEffect,
  } from 'vue'
  import View from '@uninterface/backend/UiTabPanel.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type { UiTabPanelBinding } from '../bindings/tabs'
  import {
    attachTabPanel,
    tabIdentity,
    useTabAssociationCheck,
  } from '../tabs/association'
  import { availableHeightKey } from '../layout/hosting'
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        binding: UiTabPanelBinding
        lazy?: boolean
        height?: 'content' | 'full'
      }
    >(),
    { lazy: false, height: 'content' },
  )
  assertUiCapabilities(uiBackend, ['tabs.v1'])
  const binding = props.binding
  if (!binding || binding.target !== 'tab-panel')
    throw new Error('UiTabPanel requires a compatible panel binding.')
  onBeforeUnmount(attachTabPanel(binding.tabs, binding.value, {}))
  useTabAssociationCheck(binding.tabs)
  const offer = inject(availableHeightKey, ref(undefined))
  provide(
    availableHeightKey,
    computed(() => (props.height === 'full' ? offer.value : undefined)),
  )
  const identity = tabIdentity(binding.tabs, binding.value)
  const selected = computed(() => binding.tabs.selectedKey === binding.value)
  const mounted = ref(false)
  watchEffect(() => {
    if (props.binding !== binding)
      throw new Error('Changing a panel binding requires a keyed remount.')
    if (!['content', 'full'].includes(props.height))
      throw new Error('UiTabPanel: unsupported height.')
    if (!props.lazy || selected.value) mounted.value = true
  })
</script>
<template>
  <View
    v-bind="identity"
    :selected="selected"
    :mounted="mounted"
    :height="height"
    :active-tab-id="tabIdentity(binding.tabs, binding.tabs.selectedKey).tabId"
  >
    <slot />
  </View>
</template>
