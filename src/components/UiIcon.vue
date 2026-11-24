<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  const strategyNode = useUiStrategyNode('icon')
  provideStrategyView(strategyNode)
  import { computed } from 'vue'
  import View from '@uninterface/backend/UiIcon.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { assertThemeColor, type UiThemeColor } from '../presentation/theme'
  import { useIconCatalogue, type UiIconName } from '../icons/catalogue'
  import { useUiI18n } from '../i18n/context'
  import { defineUiInputFrameContract } from '../input-frame/participation'
  defineOptions({
    inheritAttrs: false,
    uiInputFrame: defineUiInputFrameContract({ role: 'content' }),
  })
  const props = defineProps<
    UiZOrderProps & {
      name: UiIconName
      tone?: UiThemeColor
      size?: string
      ariaLabel?: string
    }
  >()
  const catalogue = useIconCatalogue()
  const i18n = useUiI18n()
  assertUiCapabilities(uiBackend, ['icon.catalogue.v1'])
  const definition = computed(() => {
    const item = catalogue[props.name]
    if (!item) throw new Error(`Unknown icon: ${props.name}`)
    if (props.tone !== undefined) {
      assertThemeColor(uiBackend, props.tone)
      if (item.tones && !item.tones[props.tone])
        throw new Error(`Unsupported icon tone: ${props.name}/${props.tone}`)
    }
    return item
  })
  const artwork = computed(() =>
    props.tone && definition.value.tones
      ? definition.value.tones[props.tone]
      : definition.value.component,
  )
  const dimensions = computed(() => {
    const size = props.size
    if (size === undefined) return undefined
    const length = typeof size === 'string' ? parseFloat(size) : NaN
    if (
      !Number.isFinite(length) ||
      length <= 0 ||
      size.trim() !== size ||
      !/^(?:\d+(?:\.\d+)?|\.\d+)(?:px|em|rem)$/.test(size)
    )
      throw new Error(
        'UiIcon: size must be a positive length in px, em or rem.',
      )
    assertUiCapabilities(uiBackend, ['icon.size.v1'])
    return { width: size, height: size, flex: 'none' }
  })
</script>
<template>
  <View
    v-bind="$attrs"
    :tone="tone"
    :style="dimensions"
    :data-ui-icon-sized="dimensions ? '' : undefined"
    :role="ariaLabel ? 'img' : undefined"
    :aria-label="ariaLabel"
    :aria-hidden="ariaLabel ? undefined : true"
    :data-icon="name"
  >
    <span
      class="icon-artwork"
      :class="{
        'icon-mirrored':
          definition.mirrorInRtl && i18n.state.value.direction === 'rtl',
      }"
      aria-hidden="true"
    >
      <component
        :is="artwork"
        aria-hidden="true"
        focusable="false"
      />
    </span>
  </View>
</template>
<style scoped>
  .icon-artwork {
    display: inline-flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
  }
  .icon-artwork :deep(svg) {
    width: 100%;
    height: 100%;
  }
  .icon-mirrored {
    transform: scaleX(-1);
  }
</style>
