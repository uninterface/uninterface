<script setup lang="ts" generic="T = void">
  import { provideZModal } from '../stacking/overlays'
  import { useZComponent } from '../stacking/runtime'
  import { useAttrs, useSlots, watchEffect } from 'vue'
  import DrawerRun from './internal/DrawerRun.vue'
  import DrawerPanel from './internal/DrawerPanel.vue'
  import type {
    UiOverlayControl,
    UiOverlayCloseTrigger,
  } from '../controls/overlay'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { uiBackend } from '@uninterface/backend'
  import type { UiDrawerMode, UiDrawerSizingProps } from '../layout/drawer'
  import type { UiDrawerBinding } from '../bindings/drawer'
  import type { UiDrawerEdge } from '../presentation/overlay'
  import type { UiZOrderProps } from '../stacking/authoring'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(
    defineProps<
      UiZOrderProps &
        UiDrawerSizingProps & {
          mode: UiDrawerMode
          control?: UiOverlayControl<T>
          expanded?: boolean
          binding?: UiDrawerBinding
          disabled?: boolean
          lazy?: boolean
          title?: string
          edge?: UiDrawerEdge
          closeOn?: readonly UiOverlayCloseTrigger[]
        }
    >(),
    { expanded: undefined, disabled: undefined, lazy: undefined, edge: 'end' },
  )
  if (props.mode === 'modal') provideZModal(() => props.zOrder)
  else useZComponent()
  const attrs = useAttrs()
  const slots = useSlots()
  const initialMode = props.mode
  watchEffect(() => {
    assertUiCapabilities(uiBackend, [
      ...(props.resizable ? ['drawer.resize.v1'] : []),
      ...(props.mode === 'docked' ? ['drawer.docked.v1'] : []),
    ])
    if ('modal' in attrs)
      throw new Error('UiDrawer uses mode to select ownership and modality.')
    if ((props.mode === 'modal') !== (initialMode === 'modal'))
      throw new Error(
        'UiDrawer: changing ownership mode requires a keyed remount.',
      )
    if (!['modal', 'panel', 'docked'].includes(props.mode))
      throw new Error(
        'UiDrawer requires mode="modal", mode="panel" or mode="docked".',
      )
    if (
      props.mode === 'modal' &&
      (!props.control ||
        props.binding ||
        props.expanded !== undefined ||
        attrs['onUpdate:expanded'] ||
        props.lazy !== undefined ||
        props.disabled !== undefined)
    )
      throw new Error(
        'UiDrawer modal mode requires only a run control, not expansion, lazy or disabled inputs.',
      )
    if (props.mode !== 'modal' && props.control)
      throw new Error('UiDrawer panel mode cannot receive a run control.')
  })
</script>
<template>
  <DrawerRun
    v-if="mode === 'modal'"
    v-bind="{ ...attrs, ...props }"
    :control="control!"
  >
    <template
      v-for="(_, name) in slots"
      #[name]="scope"
    >
      <slot
        :name="name"
        v-bind="scope"
      />
    </template>
  </DrawerRun>
  <DrawerPanel
    v-else
    v-bind="{ ...attrs, ...props, mode: mode as 'panel' | 'docked' }"
  >
    <template
      v-for="(_, name) in slots"
      #[name]="scope"
    >
      <slot
        :name="name"
        v-bind="scope"
      />
    </template>
  </DrawerPanel>
</template>
