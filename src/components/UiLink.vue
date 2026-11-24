<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { computed, useAttrs, watchEffect } from 'vue'
  import View from '@uninterface/backend/UiLink.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { assertThemeColor, type UiThemeColor } from '../presentation/theme'
  import {
    ordinaryLinkActivation,
    type UiLinkBinding,
  } from '../navigation/control'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiZOrderProps & {
      href?: string
      binding?: UiLinkBinding
      color?: UiThemeColor
      disabled?: boolean
    }
  >()
  const attrs = useAttrs()
  provideStrategyView(useUiStrategyNode('link'))
  assertUiCapabilities(uiBackend, ['link.v1'])
  watchEffect(() => {
    if (props.href !== undefined && props.binding)
      throw new Error('UiLink accepts href or binding, not both.')
    if (props.color) assertThemeColor(uiBackend, props.color)
  })
  const disabled = computed(() =>
    Boolean(props.disabled || props.binding?.disabled),
  )
  function activate(event: MouseEvent) {
    if (disabled.value) {
      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }
    if (props.binding && ordinaryLinkActivation(event, attrs))
      props.binding.request(event)
  }
</script>
<template>
  <View
    v-bind="attrs"
    :href="disabled ? undefined : (binding?.href ?? href)"
    :color="color"
    :role="
      binding && !binding.href ? 'button' : (attrs.role as string | undefined)
    "
    :tabindex="
      binding && !binding.href
        ? disabled
          ? -1
          : 0
        : (attrs.tabindex as number | undefined)
    "
    @keydown="
      (event: KeyboardEvent) => {
        if (
          binding &&
          !binding.href &&
          !disabled &&
          (event.key === 'Enter' || event.key === ' ')
        ) {
          event.preventDefault()
          ;(event.currentTarget as HTMLElement).click()
        }
      }
    "
    :disabled="disabled"
    :current="binding?.current ?? false"
    @click.capture="activate"
  >
    <template
      v-if="$slots.icon"
      #icon
    >
      <slot name="icon" />
    </template>
    <slot />
  </View>
</template>
