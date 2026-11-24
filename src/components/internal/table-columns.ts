import { resolveUiText } from '../../text/source'
import { componentBindings, type ZBinding } from '../../stacking/runtime'
import { validateColumnSizing } from '../../table/columns'
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
  type InjectionKey,
  type Slot,
} from 'vue'
import type {
  UiTableColumnBinding,
  UiTableColumnDefinition,
} from '../../bindings/table-column'

interface Column {
  readonly owner: object
  readonly definition: UiTableColumnDefinition
  readonly cell?: Slot
  readonly label?: Slot
  readonly filter?: Slot
  readonly summary?: Slot
  readonly z?: ZBinding
  readonly anchor: () => Node | null
}
interface Collection {
  readonly binding: () => object
  add(column: Column): () => void
}
const columnsKey: InjectionKey<Collection> = Symbol('uninterface.table.columns')

/** Declaration staging is separate from surface rendering, including SSR. */
export function useTableColumns(binding: () => object) {
  const initialBinding = toRaw(binding())
  const server = inject(ssrContextKey, undefined) !== undefined
  let sealed = false
  const columns = shallowRef<readonly Column[]>([])
  let host: Element | undefined
  let observer: MutationObserver | undefined
  let disposed = false
  function synchronizeOrder() {
    if (!host || disposed) return
    const ordered = [...columns.value].sort((left, right) => {
      const a = left.anchor(),
        b = right.anchor()
      if (!a || !b || !host!.contains(a) || !host!.contains(b)) return 0
      const position = a.compareDocumentPosition(b)
      return position & 4 ? -1 : position & 2 ? 1 : 0
    })
    if (ordered.some((column, index) => column !== columns.value[index]))
      columns.value = ordered
  }
  const collection: Collection = {
    binding,
    add(column) {
      if (disposed)
        throw new Error(
          'Cannot register a column after its table was disposed.',
        )
      if (server && sealed)
        throw new Error(
          'SSR table columns must register synchronously before the surface renders.',
        )
      columns.value = [...columns.value, column]
      return () => {
        columns.value = columns.value.filter(
          (item) => item.owner !== column.owner,
        )
      }
    },
  }
  provide(columnsKey, collection)
  onScopeDispose(() => {
    disposed = true
    observer?.disconnect()
    host = undefined
    columns.value = []
  })
  return Object.freeze({
    attach(element: Element | null) {
      observer?.disconnect()
      host = element ?? undefined
      if (!host || disposed) return
      // Only known declaration anchors are compared. Business component trees
      // are never opened, rendered manually or traversed to discover columns.
      const Observer = host.ownerDocument.defaultView?.MutationObserver
      if (!Observer)
        throw new Error('Table declaration ordering requires MutationObserver.')
      observer = new Observer(synchronizeOrder)
      observer.observe(host, { childList: true, subtree: true })
      synchronizeOrder()
    },
    read() {
      if (toRaw(binding()) !== initialBinding)
        throw new Error('Changing a table binding requires a keyed remount.')
      sealed = true
      const seen = new Set<string>()
      const result = columns.value.map((column) => {
        const definition = column.definition
        validateColumnSizing(definition)
        if (!definition.columnKey?.trim())
          throw new Error('Table columnKey must be nonempty.')
        if (seen.has(definition.columnKey))
          throw new Error(`Duplicate table column: ${definition.columnKey}`)
        seen.add(definition.columnKey)
        const label = resolveUiText(definition.label)
        if (!label?.trim() && !column.label)
          throw new Error('A table column needs a label or label slot.')
        return {
          ...definition,
          label,
          z: column.z,
          cell: column.cell,
          labelSlot: column.label,
          filterSlot: column.filter,
          summarySlot: column.summary,
        }
      })
      if (result.length && !result.some((column) => column.spring !== false))
        throw new Error('A table requires at least one spring column.')
      return result
    },
  })
}

export function useTableColumn<T, F, S extends string>(
  props: () =>
    | UiTableColumnDefinition<S, Extract<keyof F, string>>
    | { binding: UiTableColumnBinding<T, F, S> },
  slots: { default?: Slot; label?: Slot; filter?: Slot; summary?: Slot },
) {
  const parent = inject(columnsKey, undefined)
  if (!parent)
    throw new Error('UiTableColumn requires a table declaration host.')
  const instance = getCurrentInstance()!
  const slotVersion = shallowRef(0)
  let previousSlots = [slots.default, slots.label, slots.filter, slots.summary]
  onBeforeUpdate(() => {
    const next = [slots.default, slots.label, slots.filter, slots.summary]
    if (next.some((slot, index) => slot !== previousSlots[index])) {
      previousSlots = next
      slotVersion.value++
    }
  })
  const owner = {}
  let identity: string | undefined
  const release = parent.add({
    owner,
    get definition() {
      const input = props()
      let definition: UiTableColumnDefinition
      if ('binding' in input) {
        if (
          input.binding.target !== 'table-column' ||
          toRaw(input.binding.list) !== toRaw(parent.binding())
        )
          throw new Error('Column binding belongs to a different list session.')
        definition = input.binding.definition
      } else definition = input
      if (identity !== undefined && identity !== definition.columnKey)
        throw new Error('Changing column identity requires a keyed remount.')
      identity = definition.columnKey
      return definition
    },
    get cell() {
      slotVersion.value
      return slots.default
    },
    get label() {
      slotVersion.value
      return slots.label
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
