<script lang="ts">
  import { defineComponent, h, type PropType } from 'vue'
  import UiCard from '../UiCard.vue'
  import View from '@uninterface/backend/CollectionCard.vue'
  import { hasRegionContent } from '../../layout/regions'
  import type {
    UiCollectionRow,
    UiCollectionCardFieldView,
  } from '../../backend/collection'
  import type { useCollectionFields } from './collection-fields'
  export default defineComponent({
    props: {
      row: { type: Object as PropType<UiCollectionRow>, required: true },
      fields: {
        type: Array as PropType<
          ReturnType<ReturnType<typeof useCollectionFields>['read']>
        >,
        required: true,
      },
      selection: {
        type: String as PropType<'none' | 'single' | 'multiple'>,
        required: true,
      },
      actionPlacement: {
        type: String as PropType<'footer' | 'top-end'>,
        default: 'footer',
      },
    },
    setup(props, { slots }) {
      return () => {
        const values = { item: props.row.item, context: props.row.context }
        const rendered = props.fields
          .map((field, index) => ({
            field,
            index,
            nodes: (field.card ?? field.cell)?.(values) ?? [],
          }))
          .filter((entry) => hasRegionContent(entry.nodes))
        rendered.sort((a, b) => {
          const left = a.field.cardPlacementOrder,
            right = b.field.cardPlacementOrder
          return left === right
            ? a.index - b.index
            : left === undefined
              ? 1
              : right === undefined
                ? -1
                : left - right
        })
        const fields: UiCollectionCardFieldView[] = rendered.map(
          ({ field }) => ({
            key: field.fieldKey,
            z: field.z,
            label: field.label!,
            placement:
              field.role === 'title'
                ? 'title'
                : (field.cardPlacement ?? 'body'),
          }),
        )
        const content = new Map(
          rendered.map((entry) => [entry.field.fieldKey, entry.nodes]),
        )
        const actions = slots.actions?.(values) ?? []
        const viewSlots = {
          field: ({ field }: { field: UiCollectionCardFieldView }) =>
            content.get(field.key),
        }
        const binding = { row: props.row, fields, selection: props.selection }
        const hasMedia = fields.some((field) => field.placement === 'media')
        const hasHeader =
          props.selection !== 'none' ||
          fields.some(
            (field) =>
              ['title', 'leading', 'header-end'].includes(field.placement) ||
              (!hasMedia && field.placement === 'overlay-end'),
          )
        return h(
          UiCard,
          {
            'data-collection-card': String(props.row.key),
            'data-collection-selected': props.row.context.selected || undefined,
          },
          {
            ...(hasHeader
              ? {
                  header: () =>
                    h(View, { ...binding, part: 'header' }, viewSlots),
                }
              : {}),
            default: () => h(View, { ...binding, part: 'body' }, viewSlots),
            ...(hasRegionContent(actions)
              ? {
                  [props.actionPlacement === 'top-end' ? 'top-end' : 'footer']:
                    () =>
                      h(
                        View,
                        { ...binding, part: 'actions' },
                        { default: () => actions },
                      ),
                }
              : {}),
          },
        )
      }
    },
  })
</script>
