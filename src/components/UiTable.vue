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

  import { onMounted, ref } from 'vue'
  import type { VNode } from 'vue'
  import type { UiListBinding } from '../bindings/list'
  import type { UiButtonBinding } from '../bindings/button'
  import { useTableColumns } from './internal/table-columns'
  import Surface from './internal/UiTableSurface.vue'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  defineOptions({ inheritAttrs: false })
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        binding: UiListBinding<T, F, S>
        addRow?: UiButtonBinding
        addRowLabel?: string
        ariaLabel?: string
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
    >(),
    { showSummary: undefined },
  )
  defineSlots<{
    default?(): VNode[]
    footer?(props: { count: number }): VNode[]
    empty?(): VNode[]
    'infinity-loading'?(props: UiCollectionInfinitySlotProps): VNode[]
    'infinity-complete'?(props: UiCollectionInfinitySlotProps): VNode[]
    error?(props: UiCollectionErrorSlotProps): VNode[]
  }>()
  provideStrategyView(useUiStrategyNode('table'))
  const columns = useTableColumns(() => props.binding)
  const surface = ref<InstanceType<typeof Surface>>()
  defineExpose({
    focusAddRow: () => surface.value?.focusAddRow() ?? Promise.resolve(false),
  })
  const host = ref<HTMLElement>()
  onMounted(() => columns.attach(host.value ?? null))
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
    ref="surface"
    v-bind="{ ...$attrs, ...props, zOrder: undefined }"
    :columns="columns"
  >
    <template
      v-if="$slots.footer"
      #footer="values"
    >
      <slot
        name="footer"
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
