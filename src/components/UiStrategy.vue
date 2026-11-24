<script setup lang="ts">
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  useZComponent()
  useUiZView({ self: true })
  import { useUiZView } from '../stacking/view'

  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type {
    UiStrategyDeclaration,
    UiStrategyBlock,
  } from '../strategy/types'
  import { useUiStrategyNode } from '../strategy/context'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiZOrderProps & {
      use?: UiStrategyDeclaration | readonly UiStrategyDeclaration[]
      block?: UiStrategyBlock | readonly UiStrategyBlock[]
    }
  >()
  assertUiCapabilities(uiBackend, ['strategy.scope.v1'])
  useUiStrategyNode('strategy', () => props)
</script>
<template><slot /></template>
