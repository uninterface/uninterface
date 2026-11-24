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
  import type { UiCollectionSummaryContext } from '../collection/summary'
  import { useZComponent } from '../stacking/runtime'
  import type { UiZOrderProps } from '../stacking/authoring'

  import type { VNode } from 'vue'
  import type { UiListSlotProps } from '../bindings/table-column'
  import {
    useCollectionField,
    type CardPlacement,
  } from './internal/collection-fields'
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        fieldKey: string
        label: string
        role?: 'title'
        cardPlacement?: CardPlacement
        cardPlacementOrder?: number
        sortBy?: S
        filterBy?: Extract<keyof F, string>
        filterActive?: boolean
        preferredWidth?: number | string
        minWidth?: number | string
        spring?: boolean
        resizable?: boolean
        align?: 'left' | 'center' | 'right'
      }
    >(),
    { spring: undefined, resizable: undefined },
  )
  const slots = defineSlots<{
    default?(props: UiListSlotProps<T>): VNode[]
    summary?(props: UiCollectionSummaryContext<T, D>): VNode[]
    card?(props: UiListSlotProps<T>): VNode[]
    filter?(props: {
      filters: Readonly<F>
      setFilters(filters: Readonly<F>): Promise<boolean>
      close(): Promise<boolean>
    }): VNode[]
  }>()
  useCollectionField(() => ({ ...props, columnKey: props.fieldKey }), slots)
  useZComponent()
</script>
<template><span /></template>
