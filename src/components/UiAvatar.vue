<script setup lang="ts">
  import { computed, shallowRef, watch, watchEffect } from 'vue'
  import View from '@uninterface/backend/UiAvatar.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type { UiAvatarViewProps } from '../backend'
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  import { uiControlSizeQuery } from '../strategy/common'
  import { useUiStrategyNode } from '../strategy/context'

  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiZOrderProps & {
      src?: string
      size?: string
      shape?: 'circle' | 'square'
      fit?: 'cover' | 'contain'
      ariaLabel?: string
    }
  >()
  defineSlots<{ fallback?: () => unknown }>()
  useZComponent()
  assertUiCapabilities(uiBackend, ['avatar.v1'])

  watchEffect(() => {
    if (
      props.shape !== undefined &&
      !['circle', 'square'].includes(props.shape)
    )
      throw new Error('UiAvatar: shape must be circle or square.')
    if (props.fit !== undefined && !['cover', 'contain'].includes(props.fit))
      throw new Error('UiAvatar: fit must be cover or contain.')
  })

  const strategySize = useUiStrategyNode('avatar').query(
    uiControlSizeQuery,
    [-2, -1, 0, 1, 2],
  )
  const sizeStep = computed(() =>
    strategySize.value.status === 'answered' ? strategySize.value.value : 0,
  )
  const explicitSize = computed(() => {
    const size = props.size
    if (
      size !== undefined &&
      (typeof size !== 'string' ||
        !/^(?:\d+(?:\.\d+)?|\.\d+)(?:px|em)$/.test(size) ||
        !Number.isFinite(parseFloat(size)) ||
        parseFloat(size) <= 0)
    )
      throw new Error('UiAvatar: size must be a positive length in px or em.')
    return size
  })
  const label = computed(() => props.ariaLabel?.trim() || undefined)
  const image = shallowRef<UiAvatarViewProps['image']>()
  watch(
    () => props.src?.trim(),
    (src) => {
      if (!src) {
        image.value = undefined
        return
      }
      // Each request has its own identity even when an earlier URL is reused.
      const key = Symbol()
      image.value = {
        key,
        src,
        visible: false,
        onLoad() {
          if (image.value?.key === key && !image.value.visible)
            image.value = { ...image.value, visible: true }
        },
        onError() {
          if (image.value?.key === key) image.value = undefined
        },
      }
    },
    { immediate: true, flush: 'sync' },
  )
</script>

<template>
  <View
    v-bind="$attrs"
    :size="explicitSize"
    :size-step="sizeStep"
    :shape="shape ?? 'circle'"
    :fit="fit ?? 'cover'"
    :image="image"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : true"
  >
    <template
      v-if="$slots.fallback"
      #fallback
    >
      <slot name="fallback" />
    </template>
  </View>
</template>
