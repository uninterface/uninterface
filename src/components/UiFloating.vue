<script setup lang="ts">
  import { ref, computed, onActivated, onDeactivated, watchEffect } from 'vue'
  import View from '@uninterface/backend/UiFloating.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { useUiZOrder } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  import type { UiDrawerEdge } from '../presentation/overlay'
  import { floatingPosition } from '../layout/drawer'
  import { useMessages } from '../i18n/messages'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        edge?: UiDrawerEdge
        draggable?: boolean
        hidden?: boolean
        initialPosition?: number
        position?: number
      }
    >(),
    { edge: 'end', draggable: false, hidden: false, initialPosition: 0.5 },
  )
  const emit = defineEmits<{ 'update:position': [position: number] }>()
  assertUiCapabilities(uiBackend, ['floating.v1'])
  useUiZOrder(() =>
    props.zOrder?.parent
      ? props.zOrder
      : { layer: 'floating', ...props.zOrder },
  )
  provideStrategyView(useUiStrategyNode('floating'))
  const local = ref(floatingPosition(props.position ?? props.initialPosition))
  const mountedActive = ref(true),
    messages = useMessages('floating')
  const active = computed(() => mountedActive.value && !props.hidden)
  const value = computed(() => floatingPosition(props.position ?? local.value))
  onActivated(() => {
    mountedActive.value = true
  })
  onDeactivated(() => {
    mountedActive.value = false
  })
  function request(position: number) {
    if (!active.value || !props.draggable) return
    position = floatingPosition(position)
    if (props.position === undefined) local.value = position
    emit('update:position', position)
  }
  watchEffect(() => {
    floatingPosition(props.initialPosition)
    floatingPosition(value.value)
    if (!['start', 'end', 'top', 'bottom'].includes(props.edge))
      throw new Error('Unsupported UiFloating edge.')
  })
  const messagesReady = messages.ready
</script>
<template>
  <View
    v-if="messagesReady"
    v-bind="$attrs"
    :edge="edge"
    :position="value"
    :draggable="draggable"
    :active="active"
    :request-position="request"
    :move-label="messages.floatingMove"
    :position-label="messages.floatingPosition"
    :done-label="messages.close"
  >
    <slot />
  </View>
</template>
