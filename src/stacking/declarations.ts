import { onBeforeUnmount, isRef, nextTick, type VNode } from 'vue'
import { useZAllocations } from './allocation'
import type { UiZParts } from './authoring'
import type { ZBinding } from './runtime'

/** Logical declarations have a stable public ref even though their owner renders the target. */
export function useZDeclarations(binding: ZBinding) {
  let orders: UiZParts | undefined
  const parts = useZAllocations(binding, () => orders)
  const refs = new Map<string, { node: VNode; value: object }>()
  let alive = true
  const refEntries = (node: VNode) =>
    Array.isArray(node.ref) ? node.ref : node.ref ? [node.ref] : []
  const sameRef = (a: VNode, b: VNode) => {
    const left = refEntries(a),
      right = refEntries(b)
    return (
      left.length === right.length &&
      left.every(
        (entry, i) => entry.r === right[i]?.r && entry.i === right[i]?.i,
      )
    )
  }
  function assign(node: VNode, value: object | null, previous?: object) {
    for (const entry of refEntries(node)) {
      const r = entry.r
      if (typeof r === 'function') {
        r(value as never, entry.i.refs)
        continue
      }
      const current = isRef(r)
        ? r.value
        : typeof r === 'string'
          ? entry.i.refs[r]
          : undefined
      const list = Array.isArray(current) ? current : []
      const next = entry.f
        ? value
          ? list.includes(value)
            ? list
            : [...list, value]
          : list.filter((item) => item !== previous)
        : value
      if (isRef(r)) r.value = next
      const key = typeof r === 'string' ? r : entry.k
      if (key) {
        entry.i.refs = { ...entry.i.refs, [key]: next }
        const state = (
          entry.i as unknown as { setupState: Record<string, unknown> }
        ).setupState
        if (key in state) state[key] = next
      }
    }
  }
  onBeforeUnmount(() => {
    alive = false
    for (const item of refs.values()) assign(item.node, null, item.value)
    refs.clear()
  })
  return {
    sync(nodes: readonly { key: string; node: VNode }[]) {
      const requested = nodes.flatMap(({ node }, index) => {
        const order = node.props?.zOrder ?? node.props?.['z-order']
        if (order?.parent || order?.layer)
          throw new Error(
            'Declaration ordering attachment belongs to its host.',
          )
        return order === undefined ? [] : [{ part: index, order }]
      })
      orders = requested.length ? requested : undefined
      const bindings = parts.sync(nodes)
      for (const [key, item] of refs)
        if (!nodes.some((n) => n.key === key)) {
          assign(item.node, null, item.value)
          refs.delete(key)
        }
      for (const { key, node } of nodes) {
        const previous = refs.get(key)
        const value =
          previous?.value ?? Object.freeze({ zHandle: bindings[key]!.handle })
        binding.runtime.refs.set(value, bindings[key]!.handle)
        if (previous && !sameRef(previous.node, node))
          assign(previous.node, null, previous.value)
        refs.set(key, { node, value })
        if (node.ref && (!previous || !sameRef(previous.node, node)))
          void nextTick(() => {
            if (
              alive &&
              refs.get(key)?.value === value &&
              sameRef(refs.get(key)!.node, node)
            ) {
              assign(refs.get(key)!.node, value)
              if (!previous) binding.runtime.registry.value++
            }
          })
      }
      return bindings
    },
  }
}
