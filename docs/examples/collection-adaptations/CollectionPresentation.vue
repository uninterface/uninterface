<script setup lang="ts">
  import { computed } from 'vue'
  import {
    UiStrategy,
    UiCollectionHeader,
    UiCollectionFilter,
    uiCollectionHeaderPresentation,
    uiSearchFilterPresentation,
    collectionSortPanel,
    collectionSortSelect,
    collectionSortBadges,
    collectionFilterBadges,
    useUiResponsive,
    type UiCollectionFilterBinding,
    type UiCollectionSortBinding,
    type UiButtonBinding,
  } from '@uninterface/uninterface'
  import { applicationHeader } from './ApplicationHeader'
  import { inlineFilters } from './InlineFilters'
  import { applicationSearch } from './search'

  // This is a reusable presentation wrapper, not the owning business browser.
  // Its caller retains controls, query operations and their disposal.
  const props = defineProps<{
    search: UiCollectionFilterBinding
    filters: readonly UiCollectionFilterBinding[]
    sorting?: UiCollectionSortBinding
    reset?: UiButtonBinding
    useCustomHeader?: boolean
    showFilterBadges?: boolean
  }>()
  const { context: environment } = useUiResponsive()
  const strategies = [
    uiCollectionHeaderPresentation(() =>
      props.useCustomHeader ? applicationHeader : undefined,
    ),
    uiSearchFilterPresentation(applicationSearch),
  ]
  const sortView = computed(() =>
    props.sorting?.mode === 'single'
      ? collectionSortSelect
      : environment.value === 'mobile'
        ? collectionSortPanel
        : collectionSortBadges,
  )
  const filterView = computed(() =>
    props.showFilterBadges ? collectionFilterBadges : inlineFilters,
  )
  const activeFilters = computed(
    () =>
      props.filters.filter((binding) => binding.available && binding.active)
        .length,
  )
</script>
<template>
  <UiStrategy :use="strategies">
    <UiCollectionHeader
      :filter-bindings="filters"
      :filter-panel="filterView"
      :sort-binding="sorting"
      :sort-panel="sortView"
      :active-filter-count="activeFilters"
      :reset="reset"
    >
      <template #search><UiCollectionFilter :binding="search" /></template>
      <template
        v-if="$slots.actions"
        #actions
      >
        <slot name="actions" />
      </template>
      <template
        v-if="$slots.info"
        #info
      >
        <slot name="info" />
      </template>
    </UiCollectionHeader>
  </UiStrategy>
</template>
