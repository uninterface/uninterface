import { componentBindings, type ZBinding } from '../../stacking/runtime'
import {
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  onBeforeUpdate,
  onScopeDispose,
  provide,
  shallowRef,
  ssrContextKey,
  toRaw,
  type ComputedRef,
  type InjectionKey,
  type Slot,
} from 'vue'
import { validateColumnSizing } from '../../table/columns'
import type { UiTableColumnDefinition } from '../../bindings/table-column'

export type CardPlacement =
  | 'body'
  | 'header-end'
  | 'leading'
  | 'media'
  | 'overlay-end'
export interface CollectionField extends UiTableColumnDefinition {
  label: string
  fieldKey: string
  role?: 'title'
  cardPlacement?: CardPlacement
  cardPlacementOrder?: number
}
interface Declaration {
  definition: CollectionField
  cell?: Slot
  card?: Slot
  filter?: Slot
  summary?: Slot
  readonly z?: ZBinding
  anchor(): Node | null
}
const key: InjectionKey<{ add(field: Declaration): () => void }> =
  Symbol('collection.fields')
export const collectionButtonPresentation: InjectionKey<
  ComputedRef<'text' | 'icon' | 'icon+text'>
> = Symbol('collection.buttons')

export function useCollectionFields(binding: () => object) {
  const initial = toRaw(binding())
  const fields = shallowRef<readonly Declaration[]>([])
  const server = inject(ssrContextKey, undefined) !== undefined
  let sealed = false
  let disposed = false
  let observer: MutationObserver | undefined
  provide(key, {
    add(field) {
      if (disposed)
        throw new Error('Cannot register fields after collection disposal.')
      if (server && sealed)
        throw new Error(
          'Collection fields must register synchronously before the surface renders.',
        )
      fields.value = [...fields.value, field]
      return () => {
        fields.value = fields.value.filter((entry) => entry !== field)
      }
    },
  })
  onScopeDispose(() => {
    disposed = true
    observer?.disconnect()
    fields.value = []
  })
  return {
    attach(host: Element | null) {
      observer?.disconnect()
      if (!host) return
      const sync = () => {
        const ordered = [...fields.value].sort((a, b) => {
          const left = a.anchor(),
            right = b.anchor()
          if (!left || !right || !host.contains(left) || !host.contains(right))
            return 0
          const relation = left.compareDocumentPosition(right)
          return relation & 4 ? -1 : relation & 2 ? 1 : 0
        })
        if (ordered.some((entry, index) => entry !== fields.value[index]))
          fields.value = ordered
      }
      observer = new host.ownerDocument.defaultView!.MutationObserver(sync)
      observer.observe(host, { subtree: true, childList: true })
      sync()
    },
    read() {
      if (toRaw(binding()) !== initial)
        throw new Error(
          'Changing a collection binding requires a keyed remount.',
        )
      sealed = true
      const seen = new Set<string>()
      let titles = 0
      return fields.value.map((field) => {
        const definition = field.definition
        if (
          !definition.fieldKey?.trim() ||
          definition.fieldKey === '__collection_actions'
        )
          throw new Error(
            'Collection field-key must be nonempty and cannot use the reserved actions key.',
          )
        if (seen.has(definition.fieldKey))
          throw new Error(`Duplicate collection field: ${definition.fieldKey}`)
        seen.add(definition.fieldKey)
        if (!definition.label?.trim())
          throw new Error('A collection field requires a label.')
        if (definition.role !== undefined && definition.role !== 'title')
          throw new Error('Unsupported collection field role.')
        if (definition.role === 'title' && ++titles > 1)
          throw new Error('A collection supports one title field.')
        if (
          definition.role === 'title' &&
          definition.cardPlacement !== undefined
        )
          throw new Error('A title field cannot also specify card-placement.')
        if (
          definition.cardPlacement !== undefined &&
          !['body', 'header-end', 'leading', 'media', 'overlay-end'].includes(
            definition.cardPlacement,
          )
        )
          throw new Error('Unsupported card-placement.')
        if (
          definition.cardPlacementOrder !== undefined &&
          !Number.isFinite(definition.cardPlacementOrder)
        )
          throw new Error('card-placement-order must be finite.')
        validateColumnSizing(definition)
        return {
          ...definition,
          z: field.z,
          cell: field.cell,
          card: field.card,
          filter: field.filter,
          summary: field.summary,
        }
      })
    },
  }
}
export function useCollectionField(
  definition: () => CollectionField,
  slots: { default?: Slot; card?: Slot; filter?: Slot; summary?: Slot },
) {
  const parent = inject(key, undefined)
  if (!parent)
    throw new Error(
      'UiCollectionField requires a UiCollectionView declaration host.',
    )
  const instance = getCurrentInstance()!
  const slotVersion = shallowRef(0)
  let previousSlots = [slots.default, slots.card, slots.filter, slots.summary]
  onBeforeUpdate(() => {
    const next = [slots.default, slots.card, slots.filter, slots.summary]
    if (next.some((slot, index) => slot !== previousSlots[index])) {
      previousSlots = next
      slotVersion.value++
    }
  })
  let identity: string | undefined
  const release = parent.add({
    get definition() {
      const value = definition()
      if (identity !== undefined && identity !== value.fieldKey)
        throw new Error(
          'Changing a collection field key requires a keyed remount.',
        )
      identity = value.fieldKey
      return value
    },
    get cell() {
      slotVersion.value
      return slots.default
    },
    get card() {
      slotVersion.value
      return slots.card
    },
    get summary() {
      slotVersion.value
      return slots.summary
    },
    get filter() {
      slotVersion.value
      return slots.filter
    },
    get z() {
      return componentBindings.get(instance)
    },
    anchor: () => instance.subTree.el as Node | null,
  })
  onBeforeUnmount(release)
}
