<script setup lang="ts">
  import {
    computed,
    defineComponent,
    onMounted,
    onScopeDispose,
    onActivated,
    onDeactivated,
    ref,
    watchEffect,
    type PropType,
    type Slot,
  } from 'vue'
  import {
    collectionSummary,
    type UiCollectionSummaryScope,
    type UiCollectionSummarySource,
  } from '../../collection/summary'
  import { inject } from 'vue'
  import UiButton from '../UiButton.vue'
  import UiIcon from '../UiIcon.vue'
  import {
    assertButtonBinding,
    buttonBindingScopeKey,
    type UiButtonBinding,
  } from '../../bindings/button'
  import Priority from '../../collection/panels/CollectionSortPriority.vue'
  import Filter from './UiTableFilter.vue'
  import { reportColumnPresentation } from '../../table/presentation'
  import CollectionError from './UiCollectionError.vue'
  import UiEmpty from '../UiEmpty.vue'
  import View from '@uninterface/backend/UiTable.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../../backend/capabilities'
  import { useCollection, type CollectionProps } from './collection'
  import type { UiTableViewProps } from '../../backend/collection'
  import type { useTableColumns } from './table-columns'
  import { cycleTableSort } from './table-query'
  import { useMessages } from '../../i18n/messages'
  import { collectionEditorViewKey } from '../../collection/editor-protocol'
  import { toRaw } from 'vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    CollectionProps & {
      columns: ReturnType<typeof useTableColumns>
      showSummary?: boolean
      addRow?: UiButtonBinding
      addRowLabel?: string
      summaryScope?: UiCollectionSummaryScope
      summaryLabel?: string
      summaryData?: unknown
      summarySource?: UiCollectionSummarySource<any>
    }
  >()
  const collection = useCollection(props)
  const actionScope = inject(buttonBindingScopeKey, undefined)
  function creation() {
    const action = props.addRow
    if (action) {
      assertUiCapabilities(uiBackend, ['table.add-row.v1'])
      assertButtonBinding(action, actionScope?.value)
      if (action.type !== 'button' || typeof action.activate !== 'function')
        throw new Error(
          'UiTable: addRow requires an ordinary action binding with activate.',
        )
      if (!props.addRowLabel?.trim())
        throw new Error('UiTable: addRow requires a meaningful addRowLabel.')
    } else if (props.addRowLabel !== undefined) {
      throw new Error('UiTable: addRowLabel requires addRow.')
    }
    return action
  }
  const addAction: UiButtonBinding = {
    target: 'button',
    type: 'button',
    get disabled() {
      return (
        !creation() ||
        props.addRow!.disabled ||
        collection.value.disabled ||
        collection.value.busy
      )
    },
    get loading() {
      return creation()?.loading ?? false
    },
    activate() {
      return creation()?.activate?.()
    },
  }
  const addButton = ref<InstanceType<typeof UiButton>>()
  const editor = inject(collectionEditorViewKey, undefined)
  if (editor && toRaw(editor.binding) === toRaw(props.binding)) {
    onScopeDispose(
      editor.registerCreation(
        () => addButton.value?.focus() ?? Promise.resolve(false),
      ),
    )
  }
  defineExpose({
    focusAddRow: () => addButton.value?.focus() ?? Promise.resolve(false),
  })
  const messages = useMessages('collections')
  assertUiCapabilities(uiBackend, [
    'table.view.v1',
    'empty.v1',
    'loading.region.v1',
    'table.column-sizing.v1',
    'table.column-alignment.v1',
    'table.column-content.v1',
    'table.footer.v1',
  ])
  const declarations = computed(() => props.columns.read())
  const summary = computed(() => {
    if (!declarations.value.some((column) => column.summarySlot))
      return undefined
    assertUiCapabilities(uiBackend, ['table.summary.v1'])
    return collectionSummary(
      props.binding,
      props,
      messages.value.collectionSummary,
    )
  })
  const supportsSort = uiBackend.capabilities.includes('table.column-sort.v1')
  const supportsFilter = uiBackend.capabilities.includes(
    'table.column-filter.v1',
  )
  const mounted = ref(false)
  const owner = {}
  const binding = props.binding
  onMounted(() => {
    mounted.value = true
  })
  onActivated(() => {
    mounted.value = true
  })
  onDeactivated(() => {
    mounted.value = false
  })
  watchEffect(() => {
    reportColumnPresentation(
      binding,
      owner,
      mounted.value
        ? {
            sort:
              supportsSort &&
              declarations.value.some(
                (column) =>
                  column.sortBy && binding.sorting.keys.includes(column.sortBy),
              ),
            filter:
              supportsFilter &&
              declarations.value.some((column) => Boolean(column.filterSlot)),
          }
        : undefined,
    )
  })
  onScopeDispose(() => reportColumnPresentation(binding, owner))
  const byKey = computed(
    () =>
      new Map(declarations.value.map((column) => [column.columnKey, column])),
  )
  const view = computed<UiTableViewProps>(() => {
    const eligible = collection.value.rows.filter(
      (row) => row.context.selectable,
    )
    const selected = eligible.filter((row) => row.context.selected).length
    return {
      ...collection.value,
      addRow: Boolean(creation()),
      dataSummary: summary.value
        ? {
            label: summary.value.label,
            labelColumnSpan: Math.max(
              1,
              declarations.value.findIndex((column) =>
                Boolean(column.summarySlot),
              ),
            ),
            status: summary.value.status,
            columns: declarations.value
              .filter((column) => column.summarySlot)
              .map((column) => ({
                key: column.columnKey,
                label: column.label ?? column.columnKey,
              })),
          }
        : undefined,
      showSortPriority: props.binding.state.query.sort.length > 1,
      columns: declarations.value.map((column) => {
        const index = props.binding.state.query.sort.findIndex(
          (clause) => clause.key === column.sortBy,
        )
        const direction = props.binding.state.query.sort[index]?.direction
        return {
          key: column.columnKey,
          z: column.z,
          label: column.label,
          preferredWidth: column.preferredWidth,
          minWidth: column.minWidth,
          spring: column.spring !== false,
          resizable: column.resizable !== false,
          align: column.align,
          resizeLabel: messages.value.tableResizeColumn.replace(
            '{column}',
            column.label ?? column.columnKey,
          ),
          sortable:
            supportsSort &&
            !!column.sortBy &&
            binding.sorting.keys.includes(column.sortBy),
          sort:
            direction === 'asc'
              ? 'ascending'
              : direction === 'desc'
                ? 'descending'
                : undefined,
          primary: index === 0,
          sortPriority: index < 0 ? undefined : index + 1,
          sortDescription:
            index < 0
              ? ''
              : (direction === 'asc'
                  ? messages.value.listSortAscending
                  : messages.value.listSortDescending
                ).replace('{position}', String(index + 1)),
          sortLabel: messages.value.listSortAction,
          filter: supportsFilter && Boolean(column.filterSlot),
          requestSort: (order) =>
            column.sortBy
              ? cycleTableSort(props.binding, column.sortBy, order)
              : Promise.resolve(false),
        }
      }),
      sizeConstraintLabel: messages.value.tableSizeConstraint,
      selectPageLabel: messages.value.listSelectPage,
      pageSelected: eligible.length > 0 && selected === eligible.length,
      pageMixed: selected > 0 && selected < eligible.length,
      canSelectPage:
        !props.binding.disabled &&
        !collection.value.loading &&
        eligible.length > 0,
      selectPage: (selected) => {
        if (!collection.value.loading) props.binding.selectPage(selected)
      },
    }
  })
  const SlotContent = defineComponent({
    props: { render: Function as PropType<Slot>, values: Object },
    setup: (props) => () => props.render?.(props.values ?? {}),
  })
  async function moveSort(columnKey: string, offset: number) {
    const key = byKey.value.get(columnKey)?.sortBy
    const sort = props.binding.state.query.sort
    const index = sort.findIndex((rule) => rule.key === key)
    const target = index + offset
    if (view.value.disabled || index < 0 || target < 0 || target >= sort.length)
      return
    const next = [...sort]
    ;[next[index], next[target]] = [next[target], next[index]]
    return props.binding.setQuery({ sort: next })
  }
  const setFilters = (filters: Readonly<any>) =>
    props.binding.setQuery({ filters })
  const messagesReady = messages.ready
</script>
<template>
  <View
    v-if="messagesReady"
    v-bind="{
      ...$attrs,
      ...view,
      showSummary: showSummary === true && !$slots.footer,
    }"
  >
    <template
      v-if="view.addRow"
      #add-row-action
    >
      <UiButton
        ref="addButton"
        :binding="addAction"
        color="primary"
        variant="text"
        data-collection-add-action
      >
        <template #icon><UiIcon name="add" /></template>
        {{ addRowLabel }}
      </UiButton>
    </template>
    <template
      v-if="$slots.footer"
      #footer
    >
      <slot
        name="footer"
        :count="collection.rows.length"
      />
    </template>
    <template
      v-if="summary"
      #summary-cell="{ column }"
    >
      <div
        v-if="column.key === declarations[0]?.columnKey"
        data-collection-summary-label
      >
        {{ summary.label }}
      </div>
      <SlotContent
        :render="byKey.get(column.key)?.summarySlot"
        :values="summary"
      />
    </template>
    <template #label="{ column }">
      <SlotContent
        v-if="byKey.get(column.key)?.labelSlot"
        :render="byKey.get(column.key)?.labelSlot"
      />
      <template v-else>{{ column.label }}</template>
    </template>
    <template #sort-actions="{ column }">
      <Priority
        v-if="view.showSortPriority && column.sort && column.sortable"
        :label="column.label ?? column.key"
        :index="(column.sortPriority ?? 0) - 1"
        :count="binding.state.query.sort.length"
        :disabled="view.disabled"
        :move="(offset) => moveSort(column.key, offset)"
      />
    </template>
    <template #cell="{ row, column }">
      <SlotContent
        :render="byKey.get(column.key)?.cell"
        :values="{ item: row.item, context: row.context }"
      />
    </template>
    <template #filter="{ column, trigger }">
      <Filter
        :trigger="trigger"
        :label="column.label ?? column.key"
        :active="byKey.get(column.key)?.filterActive === true"
        :disabled="view.disabled"
      >
        <template #default="{ close }">
          <SlotContent
            :render="byKey.get(column.key)?.filterSlot"
            :values="{
              filters: binding.state.query.filters,
              setFilters,
              close,
            }"
          />
        </template>
      </Filter>
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
