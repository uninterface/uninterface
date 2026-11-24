<script setup lang="ts">
  import {
    collectionSummary,
    type UiCollectionSummaryScope,
    type UiCollectionSummarySource,
  } from '../../collection/summary'
  import { ZDeclarationBinding } from '../../stacking/forward'
  import { computed, defineComponent, type PropType, type Slot } from 'vue'
  import CollectionError from './UiCollectionError.vue'
  import UiEmpty from '../UiEmpty.vue'
  import View from '@uninterface/backend/UiCollectionView.vue'
  import { uiBackend } from '@uninterface/backend'
  import { assertUiCapabilities } from '../../backend/capabilities'
  import UiTable from '../UiTable.vue'
  import UiTableColumn from '../UiTableColumn.vue'
  import TableActions from '@uninterface/backend/CollectionTableActions.vue'
  import Card from './UiCollectionCard.vue'
  import { useCollection, type CollectionProps } from './collection'
  import type { useCollectionFields } from './collection-fields'
  import { useMessages } from '../../i18n/messages'
  import { resolveCardPresentation } from '../../presentation/card'
  import {
    validateCollectionPresentationOptions,
    type UiCollectionPresentationOptions,
  } from '../../collection/presentation'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<
    CollectionProps & {
      fields: ReturnType<typeof useCollectionFields>
      presentation?: 'table' | 'cards-full-width' | 'cards-grid'
      presentationOptions?: UiCollectionPresentationOptions
      actionPresentation?: 'text' | 'icon' | 'icon+text'
      cardActionPlacement?: 'footer' | 'top-end'
      summaryScope?: UiCollectionSummaryScope
      summaryLabel?: string
      summaryData?: unknown
      summarySource?: UiCollectionSummarySource<any>
    }
  >()
  assertUiCapabilities(uiBackend, [
    'collection.view.v1',
    'empty.v1',
    'loading.region.v1',
  ])
  const mode = computed(() => {
    validateCollectionPresentationOptions(props.presentationOptions)
    const value = props.presentation ?? 'table'
    if (!['table', 'cards-full-width', 'cards-grid'].includes(value))
      throw new Error('Unsupported collection presentation.')
    if (
      props.cardActionPlacement !== undefined &&
      !['footer', 'top-end'].includes(props.cardActionPlacement)
    )
      throw new Error('Unsupported collection card action placement.')
    if (
      props.actionPresentation !== undefined &&
      !['text', 'icon', 'icon+text'].includes(props.actionPresentation)
    )
      throw new Error('Unsupported collection action presentation.')
    return value
  })
  // Table supplies its own collection host; an inactive coordinator must not
  // participate in observation or announcements alongside it.
  const cards = defineComponent({
    props: {
      collectionProps: {
        type: Object as PropType<CollectionProps>,
        required: true,
      },
    },
    setup(p, { slots }) {
      const view = useCollection(p.collectionProps)
      return () => slots.default?.({ view: view.value })
    },
  })
  const fields = computed(() => props.fields.read())
  const messages = useMessages('collections')
  const Content = defineComponent({
    props: { render: Function as PropType<Slot>, values: Object },
    setup: (p) => () => p.render?.(p.values ?? {}),
  })
  const summary = computed(() => {
    if (!fields.value.some((field) => field.summary)) return undefined
    assertUiCapabilities(uiBackend, ['collection.summary.v1'])
    return collectionSummary(
      props.binding,
      props,
      messages.value.collectionSummary,
    )
  })
  // Summary identity is independent of record-card hierarchy and color roles.
  const summaryCardTreatment = resolveCardPresentation({
    0: {
      color: null,
      header: 'band',
      surface: 'tinted',
      elevation: 'flat',
      border: 'solid',
      density: 'compact',
      titleSize: 'normal',
    },
  })[0]
  const summaryView = computed(() =>
    summary.value
      ? {
          label: summary.value.label,
          status: summary.value.status,
          cardTreatment: summaryCardTreatment,
          columns: fields.value
            .filter((field) => field.summary)
            .map((field) => ({ key: field.fieldKey, label: field.label })),
        }
      : undefined,
  )
  function column(field: (typeof fields.value)[number]) {
    return {
      columnKey: field.fieldKey,
      label: field.label,
      sortBy: field.sortBy,
      filterBy: field.filterBy,
      filterActive: field.filterActive,
      preferredWidth: field.preferredWidth,
      minWidth: field.minWidth,
      spring: field.spring,
      resizable: field.resizable,
      align: field.align,
    }
  }
  const messagesReady = messages.ready
</script>
<template>
  <template v-if="messagesReady">
    <UiTable
      v-if="mode === 'table'"
      v-bind="$attrs"
      :binding="binding"
      :loading="loading"
      :aria-label="ariaLabel"
      :height="height"
      :scroll="scroll"
      :infinite="infinite"
      :messages="props.messages"
      :show-summary="showSummary"
      :summary-scope="summaryScope"
      :summary-label="summaryLabel"
      :summary-data="summaryData"
      :summary-source="summarySource"
    >
      <ZDeclarationBinding
        v-for="field in fields"
        :key="field.fieldKey"
        :binding="field.z"
      >
        <UiTableColumn v-bind="column(field)">
          <template
            v-if="field.summary"
            #summary="values"
          >
            <Content
              :render="field.summary"
              :values="values"
            />
          </template>
          <template #default="values">
            <Content
              :render="field.cell"
              :values="values"
            />
          </template>
          <template
            v-if="field.filter"
            #filter="values"
          >
            <Content
              :render="field.filter"
              :values="values"
            />
          </template>
        </UiTableColumn>
      </ZDeclarationBinding>
      <UiTableColumn
        v-if="$slots.actions"
        column-key="__collection_actions"
        :label="messages.collectionActions"
        preferred-width="content"
        min-width="content"
        :spring="false"
        :resizable="false"
      >
        <template #default="values">
          <TableActions>
            <slot
              name="actions"
              v-bind="values"
            />
          </TableActions>
        </template>
      </UiTableColumn>
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
      <template
        v-if="$slots.error"
        #error="values"
      >
        <slot
          name="error"
          v-bind="values"
        />
      </template>
    </UiTable>
    <cards
      v-else
      :collection-props="props"
    >
      <template #default="{ view }">
        <View
          v-bind="{ ...$attrs, ...view }"
          :grid="mode === 'cards-grid'"
          :presentation-options="props.presentationOptions"
          :data-summary="summaryView"
        >
          <template
            v-if="summary"
            #summary-cell="{ column }"
          >
            <Content
              :render="
                fields.find((field) => field.fieldKey === column.key)?.summary
              "
              :values="summary"
            />
          </template>
          <template #default="{ row }">
            <Card
              :row="row"
              :fields="fields"
              :selection="view.selection"
              :action-placement="cardActionPlacement"
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
            </Card>
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
    </cards>
  </template>
</template>
