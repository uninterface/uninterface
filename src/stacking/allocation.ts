import {
  defineComponent,
  h,
  cloneVNode,
  onBeforeUnmount,
  provide,
  type PropType,
  type VNode,
} from 'vue'
import type { UiZHandle } from './model'
import type { UiZParts } from './authoring'
import {
  zParentContext,
  zReference,
  zViewContext,
  runtimeIds,
  type ZBinding,
} from './runtime'
import { normalizeZParts } from './parts'

const Allocation = defineComponent({
  name: 'UiZAllocation',
  props: { handle: { type: Object as PropType<UiZHandle>, required: true } },
  setup(props, { slots }) {
    provide(zParentContext, () => props.handle)
    return () => slots.default?.()
  },
})
export function useZAllocations(
  binding: ZBinding,
  declarations: () => UiZParts | undefined,
  names?: readonly string[],
) {
  const { runtime, handle: parent } = binding
  const items = new Map<
    string,
    { handle: UiZHandle; binding: ZBinding; child?: UiZHandle }
  >()
  let last = '',
    alive = true
  onBeforeUnmount(() => {
    alive = false
    const remove = [...items.values()]
      .map((i) => i.handle)
      .filter((h) => runtime.domain.describe(h))
    if (remove.length) runtime.domain.transact({ remove })
    items.clear()
  })
  return {
    sync(children: readonly { key: string; node?: VNode; name?: string }[]) {
      const remove: UiZHandle[] = []
      const keys = new Set(children.map((c) => c.key))
      for (const [key, item] of items)
        if (!keys.has(key)) {
          remove.push(item.handle)
          items.delete(key)
        }
      for (const child of children)
        if (!items.has(child.key)) {
          const handle = runtime.domain.handle(`${parent.label}:${child.key}`)
          items.set(child.key, {
            handle,
            binding: {
              ...binding,
              handle,
              order: () => undefined,
              resolved: () => runtime.domain.describe(handle),
            },
          })
        }
      // SSR leaves the domain empty. Identities are local and no numbers reach serialized output.
      if (alive && runtime.domain.describe(parent)) {
        const parts = children.map((c) => ({
          handle: items.get(c.key)!.handle,
          name: c.name,
          child:
            items.get(c.key)!.child ??
            zReference(
              runtime,
              c.node?.component?.exposeProxy ?? c.node?.component?.proxy,
            ),
        }))
        let normalized: ReturnType<typeof normalizeZParts>
        try {
          normalized = normalizeZParts({
            parts,
            parent,
            names,
            declarations: declarations(),
            reference: (o) => zReference(runtime, o),
            live: (h) => {
              const state = runtime.domain.describe(h)
              // Vue clears a removed child's template ref during patching, after
              // this render. Treat that disappearing allocation as unavailable,
              // not as an unrelated live component outside the new child list.
              return (
                !!state &&
                !state.chain.some((ancestor) => remove.includes(ancestor))
              )
            },
          })
        } catch (error) {
          if (remove.length) runtime.domain.transact({ remove })
          throw error
        }
        const records = normalized.registrations.map((r) => ({
          ...r,
          passive: declarations() === undefined,
        }))
        const signature = JSON.stringify(
          records.map((r) => [
            runtimeIds(runtime, r.handle),
            children.findIndex((c) => items.get(c.key)!.handle === r.handle),
            r.source,
            r.passive,
            r.order?.band,
            r.order?.position,
            r.order?.above?.map((h) => parts.findIndex((p) => p.handle === h)),
            r.order?.below?.map((h) => parts.findIndex((p) => p.handle === h)),
          ]),
        )
        if (
          signature !== last ||
          remove.length ||
          records.some((r) => !runtime.domain.describe(r.handle))
        ) {
          runtime.domain.transact({ put: records, remove })
          last = signature
        }
      }
      return Object.fromEntries(
        [...items].map(([key, item]) => [key, item.binding]),
      )
    },
    wrap(key: string, nodes: VNode | VNode[]) {
      const item = items.get(key)!
      const capture = (node: VNode) => {
        const child = zReference(
          runtime,
          node.component?.exposeProxy ?? node.component?.proxy,
        )
        if (child !== item.child) {
          item.child = child
          runtime.registry.value++
        }
      }
      return h(
        Allocation,
        { key, handle: item.handle },
        {
          default: () =>
            Array.isArray(nodes)
              ? nodes
              : [
                  cloneVNode(nodes, {
                    onVnodeMounted: capture,
                    onVnodeUpdated: capture,
                  }),
                ],
        },
      )
    },
  }
}
