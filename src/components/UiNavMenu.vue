<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  import UiIcon from './UiIcon.vue'
  import { useNavigationBoundary } from '../navigation/boundary'
  import { useUiMenuPopup } from '../backend/menuView'
  import type { UiEntryViewNode } from '../backend'
  import {
    computed,
    getCurrentInstance,
    onDeactivated,
    useSlots,
    watch,
  } from 'vue'
  import View from '@uninterface/backend/UiNavMenu.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type { UiEntryControl } from '../entries/control'
  import type {
    UiNavMenuBinding,
    UiNavMenuPresentation,
  } from '../navigation/menu'
  import { useEntryView } from '../entries/view'
  defineOptions({ inheritAttrs: false })
  const surfaces = useUiMenuPopup()
  defineExpose({ ownsTarget: surfaces.contains })
  provideStrategyView(useUiStrategyNode('navigation-menu'))
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        binding?: UiNavMenuBinding
        control?: UiEntryControl
        modelValue?: string
        ariaLabel?: string
        presentation?: UiNavMenuPresentation
        width?: 'full' | 'content'
        expandedKeys?: readonly string[]
      }
    >(),
    { presentation: 'horizontal' },
  )
  const emit = defineEmits<{
    activate: [key: string]
    'update:expandedKeys': [keys: readonly string[]]
  }>()
  assertUiCapabilities(uiBackend, ['navigation.menu.v1'])
  const slots = useSlots()
  const instance = getCurrentInstance()!
  const control = computed(() => {
    if (
      Boolean(props.binding) === Boolean(props.control) ||
      (props.binding &&
        (props.modelValue !== undefined || instance.vnode.props?.onActivate))
    )
      throw new Error(
        'UiNavMenu requires either binding or control; bound current state cannot be overridden.',
      )
    return props.binding?.control ?? props.control!
  })
  const current = () => props.binding?.currentKey ?? props.modelValue
  const persistent = () => props.presentation === 'vertical-tree'
  const view = useEntryView(() => control.value, slots, true, current, {
    persistent,
    expandedKeys: () => (persistent() ? props.expandedKeys : undefined),
    updateExpanded: (keys) => {
      if (persistent()) emit('update:expandedKeys', keys)
    },
    currentPath: () => props.binding?.currentPath,
    href: (key) => props.binding?.href(key),
    disabled: () => Boolean(props.binding?.disabled),
    request: (key, event) => {
      void activate(key, event)
    },
  })
  watch(
    () => props.presentation,
    () => {
      if (!persistent()) view.collapse()
    },
  )
  onDeactivated(() => {
    view.collapse()
  })
  const boundary = useNavigationBoundary(
    () => props.presentation === 'horizontal',
  )
  // Project fallback artwork only onto rail roots; never mutate the source.
  function railEntries(
    nodes: readonly UiEntryViewNode[],
  ): readonly UiEntryViewNode[] {
    return nodes.map((node) =>
      node.entry.kind === 'group'
        ? { ...node, children: railEntries(node.children ?? []) }
        : node.entry.kind !== 'separator' && !node.entry.icon
          ? {
              ...node,
              entry: { ...node.entry, icon: { name: 'menu-item' } },
            }
          : node,
    )
  }
  const binding = computed(() => {
    if (!props.ariaLabel?.trim())
      throw new Error('UiNavMenu requires aria-label.')
    if (
      !['horizontal', 'vertical-tree', 'vertical-popup', 'icon-popup'].includes(
        props.presentation,
      )
    )
      throw new Error('Unsupported navigation presentation.')
    if (props.width !== undefined) {
      if (props.width !== 'full' && props.width !== 'content')
        throw new Error('UiNavMenu: width must be full or content.')
      assertUiCapabilities(uiBackend, ['navigation.menu.width.v1'])
    }
    return {
      entries:
        props.presentation === 'icon-popup'
          ? railEntries(view.entries.value)
          : view.entries.value,
      status: view.status.value,
      label: props.ariaLabel,
      presentation: props.presentation,
      width: props.width,
      boundary: boundary.value,
    }
  })
  async function activate(key: string, event?: MouseEvent) {
    const entry = control.value.find(key)
    if (
      !entry ||
      (entry.kind && entry.kind !== 'item') ||
      entry.disabled ||
      props.binding?.disabled
    ) {
      event?.preventDefault()
      return
    }
    if (
      event &&
      (event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey)
    )
      return
    if (!persistent()) view.collapse()
    if (props.binding) await props.binding.request(key, event)
    else emit('activate', key)
  }
</script>
<template>
  <View
    v-if="view.messagesReady.value"
    v-bind="$attrs"
    :binding="binding"
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
  </View>
</template>
