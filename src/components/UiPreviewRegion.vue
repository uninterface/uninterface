<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()

  import { computed, provide, ref, watchEffect } from 'vue'
  import View from '@uninterface/backend/UiPreviewRegion.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import { controlBinding, useField } from '../controls/context'
  import { availableHeightKey } from '../layout/hosting'
  import { provideStrategyView, useUiStrategyNode } from '../strategy/context'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        disabled?: boolean
        extent?: 'compact' | 'regular' | 'large'
      }
    >(),
    { extent: 'regular' },
  )
  const field = useField()
  if (!field.value.group)
    throw new Error(
      'UiPreviewRegion requires a grouped UiField for its read-only content.',
    )
  const binding = computed(() => controlBinding(field.value, props.disabled))
  watchEffect(() => {
    if (!['compact', 'regular', 'large'].includes(props.extent))
      throw new Error(
        'UiPreviewRegion extent must be compact, regular or large.',
      )
  })
  // The viewport supplies CSS bounds, not an enclosing layout's numeric offer.
  provide(availableHeightKey, ref(undefined))
  provideStrategyView(useUiStrategyNode('preview-region'))
  assertUiCapabilities(uiBackend, ['preview.region.v1'])
</script>
<template>
  <View
    v-bind="$attrs"
    :binding="binding"
    :label="field.label"
    :extent="extent"
  >
    <slot />
  </View>
</template>
