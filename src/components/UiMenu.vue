<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const strategyNode = useUiStrategyNode('menu')
  provideStrategyView(strategyNode)
  import UiIcon from './UiIcon.vue'
  import { computed, onDeactivated, ref, watch } from 'vue'
  import type { UiMenuHostBindings } from '../entries/menu'
  import type { UiEntryViewNode } from '../backend'
  import View from '@uninterface/backend/UiMenu.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type { UiEntryControl } from '../entries/control'
  import { useEntryView } from '../entries/view'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        control: UiEntryControl
        mode?: 'inline' | 'popup'
        ariaLabel?: string
      }
    >(),
    { mode: 'inline' },
  )
  const emit = defineEmits<{ activate: [key: string] }>()
  assertUiCapabilities(uiBackend, ['menu.v1'])
  const slots = defineSlots<{
    host?(bindings: UiMenuHostBindings): any
    entry?(scope: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
    }): any
    icon?(scope: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
      icon?: unknown
    }): any
  }>()
  const view = useEntryView(() => props.control, slots)
  const open = ref(false)
  onDeactivated(() => {
    open.value = false
    view.collapse()
  })
  watch(
    () => props.control,
    () => {
      open.value = false
    },
  )
  const binding = computed(() => {
    if (!['inline', 'popup'].includes(props.mode))
      throw new Error('Unsupported UiMenu mode.')
    if (!props.ariaLabel?.trim()) throw new Error('UiMenu requires aria-label.')
    if (props.mode === 'popup' && !slots.host)
      throw new Error('UiMenu popup requires a host slot.')
    if (props.mode === 'inline' && slots.host)
      throw new Error('UiMenu host slot requires popup mode.')
    return {
      entries: view.entries.value,
      status: view.status.value,
      label: props.ariaLabel,
      mode: props.mode,
      open: props.mode === 'inline' || open.value,
    }
  })
  watch(open, (value) => {
    if (!value) view.collapse()
  })
  watch(
    () => props.mode,
    () => {
      open.value = false
      view.collapse()
    },
  )
  function activate(key: string) {
    if (!props.control.choose(key)) return
    if (!props.control.selectionFor(key)) {
      open.value = false
      view.collapse()
    }
    emit('activate', key)
  }
</script>
<template>
  <View
    v-if="view.messagesReady.value"
    v-bind="$attrs"
    :binding="binding"
    @open="open = true"
    @close="open = false"
    @activate="activate"
    @expand="view.expand"
    @retry="view.retry"
  >
    <template #entry="scope">
      <component
        :is="view.EntryContent"
        :entry="scope.entry"
      />
    </template>
    <template #icon="scope">
      <slot
        name="icon"
        v-bind="scope"
      >
        <UiIcon
          v-if="scope.entry.icon"
          :name="scope.entry.icon.name"
          :tone="scope.entry.icon.tone"
        />
      </slot>
    </template>
    <template
      v-if="slots.host"
      #host="scope"
    >
      <slot
        name="host"
        v-bind="scope"
      />
    </template>
  </View>
</template>
