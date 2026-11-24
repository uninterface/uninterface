<script
  setup
  lang="ts"
  generic="
    T,
    F = Record<string, unknown>,
    S extends string = string,
    D = unknown
  "
>
  import type {
    UiCollectionMessages,
    UiCollectionInfinitySlotProps,
    UiCollectionErrorSlotProps,
  } from '../collection/feedback'
  import type {
    UiCollectionSummaryScope,
    UiCollectionSummarySource,
  } from '../collection/summary'
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  import { useUiZView } from '../stacking/view'

  import { computed, onMounted, provide, ref, type VNode } from 'vue'
  import type { UiListBinding } from '../bindings/list'
  import type { UiListSlotProps } from '../bindings/table-column'
  import type { UiCollectionPresentationOptions } from '../collection/presentation'
  import {
    useCollectionFields,
    collectionButtonPresentation,
  } from './internal/collection-fields'
  import Surface from './internal/UiCollectionSurface.vue'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiZOrderProps & {
      binding: UiListBinding<T, F, S>
      ariaLabel: string
      presentation?: 'table' | 'cards-full-width' | 'cards-grid'
      presentationOptions?: UiCollectionPresentationOptions
      actionPresentation?: 'text' | 'icon' | 'icon+text'
      cardActionPlacement?: 'footer' | 'top-end'
      height?: 'content' | 'full'
      scroll?: 'none' | 'horizontal' | 'vertical' | 'both'
      loading?: boolean
      infinite?: boolean
      messages?: UiCollectionMessages
      showSummary?: boolean
      summaryScope?: UiCollectionSummaryScope
      summaryLabel?: string
      summaryData?: D
      summarySource?: UiCollectionSummarySource<T>
    }
  >()
  defineSlots<{
    default?(): VNode[]
    actions?(props: UiListSlotProps<T>): VNode[]
    empty?(): VNode[]
    'infinity-loading'?(props: UiCollectionInfinitySlotProps): VNode[]
    'infinity-complete'?(props: UiCollectionInfinitySlotProps): VNode[]
    error?(props: UiCollectionErrorSlotProps): VNode[]
  }>()
  provideStrategyView(useUiStrategyNode('collection'))
  provide(
    collectionButtonPresentation,
    computed(() => props.actionPresentation ?? 'text'),
  )
  const fields = useCollectionFields(() => props.binding)
  const host = ref<HTMLElement>()
  onMounted(() => fields.attach(host.value ?? null))
  useZComponent()
  useUiZView({ self: true })
</script>
<template>
  <div
    ref="host"
    hidden
    aria-hidden="true"
  >
    <slot />
  </div>
  <Surface
    v-bind="{ ...$attrs, ...props, zOrder: undefined }"
    :fields="fields"
  >
    <template
      v-if="$slots.actions"
      #actions="values"
    >
      <slot
        name="actions"
        v-bind="values"
      />
    </template>
    <template
      v-if="$slots.empty"
      #empty
    >
      <slot name="empty" />
    </template>
    <template
      v-if="$slots.error"
      #error="values"
    >
      <slot
        name="error"
        v-bind="values"
      />
    </template>
    <template
      v-if="$slots['infinity-loading']"
      #infinity-loading="values"
    >
      <slot
        name="infinity-loading"
        v-bind="values"
      />
    </template>
    <template
      v-if="$slots['infinity-complete']"
      #infinity-complete="values"
    >
      <slot
        name="infinity-complete"
        v-bind="values"
      />
    </template>
  </Surface>
</template>
