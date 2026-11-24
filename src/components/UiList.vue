<script
  setup
  lang="ts"
  generic="T, F = Record<string, unknown>, S extends string = string"
>
  import type {
    UiCollectionMessages,
    UiCollectionInfinitySlotProps,
    UiCollectionErrorSlotProps,
  } from '../collection/feedback'
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'
  import { useUiZView } from '../stacking/view'

  import { computed } from 'vue'
  import type { VNode } from 'vue'
  import CollectionError from './internal/UiCollectionError.vue'
  import UiEmpty from './UiEmpty.vue'
  import View from '@uninterface/backend/UiList.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../backend/capabilities'
  import type { UiListBinding } from '../bindings/list'
  import type { UiListSlotProps } from '../bindings/table-column'
  import { useCollection } from './internal/collection'
  import { useUiStrategyNode, provideStrategyView } from '../strategy/context'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    UiZOrderProps & {
      binding: UiListBinding<T, F, S>
      ariaLabel?: string
      columns?: number
      columnWidth?: string
      height?: 'content' | 'full'
      scroll?: 'none' | 'horizontal' | 'vertical' | 'both'
      loading?: boolean
      infinite?: boolean
      messages?: UiCollectionMessages
      showSummary?: boolean
    }
  >()
  defineSlots<{
    default?(props: UiListSlotProps<T>): VNode[]
    empty?(): VNode[]
    'infinity-loading'?(props: UiCollectionInfinitySlotProps): VNode[]
    'infinity-complete'?(props: UiCollectionInfinitySlotProps): VNode[]
    error?(props: UiCollectionErrorSlotProps): VNode[]
  }>()
  provideStrategyView(useUiStrategyNode('list'))
  assertUiCapabilities(uiBackend, [
    'list.view.v1',
    'empty.v1',
    'loading.region.v1',
  ])
  const collection = useCollection(props)
  const view = computed(() => {
    if (props.columns !== undefined && props.columnWidth !== undefined)
      throw new Error('UiList columns and columnWidth are mutually exclusive.')
    if (
      props.columns !== undefined &&
      (!Number.isSafeInteger(props.columns) || props.columns <= 0)
    )
      throw new Error('UiList columns must be a positive integer.')
    if (
      props.columnWidth !== undefined &&
      (!/^(?:\d+(?:\.\d+)?|\.\d+)(?:rem|em|px)$/.test(props.columnWidth) ||
        parseFloat(props.columnWidth) <= 0)
    )
      throw new Error(
        'UiList columnWidth must be a positive rem, em or px length.',
      )
    return {
      ...collection.value,
      columns: props.columns,
      columnWidth: props.columnWidth,
    }
  })
  useZComponent()
  useUiZView({ self: true })
  const messagesReady = collection.messagesReady
</script>
<template>
  <View
    v-if="messagesReady"
    v-bind="{ ...$attrs, ...view }"
  >
    <template #default="{ row }">
      <slot
        :item="row.item as T"
        :context="binding.context(row.key)"
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
    <template #empty>
      <slot name="empty"><UiEmpty /></slot>
    </template>
    <template #error="values">
      <slot
        name="error"
        v-bind="values"
      >
        <CollectionError
          :retry="values.retry"
          :can-retry="values.canRetry"
          :message="view.message"
          :retry-label="view.retryLabel"
        />
      </slot>
    </template>
  </View>
</template>
