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
  import type {
    UiListSlotProps,
    UiTableColumnBinding,
  } from '../bindings/table-column'
  import { useTableColumn } from './internal/table-columns'
  const props = withDefaults(
    defineProps<
      UiZOrderProps & {
        binding?: UiTableColumnBinding<T, F, S>
        columnKey?: string
        label?: string
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
    { spring: undefined, resizable: undefined, filterActive: undefined },
  )
  const slots = defineSlots<{
    default?(props: UiListSlotProps<T>): VNode[]
    summary?(props: UiCollectionSummaryContext<T, D>): VNode[]
    label?(): VNode[]
    filter?(props: {
      filters: Readonly<F>
      setFilters: (filters: Readonly<F>) => Promise<boolean>
      close(): Promise<boolean>
    }): VNode[]
  }>()
  useTableColumn(() => {
    if (props.binding) {
      if (
        props.columnKey !== undefined ||
        props.label !== undefined ||
        props.sortBy !== undefined ||
        props.filterBy !== undefined ||
        props.filterActive !== undefined ||
        props.preferredWidth !== undefined ||
        props.minWidth !== undefined ||
        props.spring !== undefined ||
        props.resizable !== undefined ||
        props.align !== undefined
      )
        throw new Error('Bound columns cannot also supply definition props.')
      return { binding: props.binding }
    }
    return {
      columnKey: props.columnKey ?? '',
      label: props.label,
      sortBy: props.sortBy,
      filterBy: props.filterBy,
      filterActive: props.filterActive,
      preferredWidth: props.preferredWidth,
      minWidth: props.minWidth,
      spring: props.spring,
      resizable: props.resizable,
      align: props.align,
    }
  }, slots)
  useZComponent()
</script>
<template><span /></template>
