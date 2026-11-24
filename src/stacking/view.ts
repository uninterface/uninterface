import {
  getCurrentInstance,
  inject,
  provide,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  watch,
  nextTick,
  Teleport,
  type VNode,
} from 'vue'
import { zViewContext, componentBindings, type ZBinding } from './runtime'
import type { UiZHandle } from './model'

function declareRoots(binding: ZBinding, get: () => readonly HTMLElement[]) {
  const { physicalRoots } = binding.runtime
  let declarations = physicalRoots.get(binding.handle)
  if (!declarations)
    physicalRoots.set(binding.handle, (declarations = new Set()))
  declarations.add(get)
  return () => {
    declarations.delete(get)
    if (!declarations.size) physicalRoots.delete(binding.handle)
  }
}

/** Backend opt-in: inspect only the view's rendered roots, never an author's reference or descendants. */
function roots(node: VNode | null | undefined): HTMLElement[] {
  if (!node || node.type === Teleport) return []
  if (node.component) return roots(node.component.subTree)
  if (node.suspense) return roots(node.suspense.activeBranch)
  if (typeof node.type === 'string')
    return node.el?.nodeType === 1 ? [node.el as HTMLElement] : []
  return Array.isArray(node.children)
    ? node.children.flatMap((child) =>
        typeof child === 'object' ? roots(child as VNode) : [],
      )
    : []
}
/** Attach a logical participant to explicit backend roots or the backend's own rendered roots. */
export function useUiZView(
  options: {
    binding?: ZBinding
    targets?: () => readonly HTMLElement[]
    host?: (element: HTMLElement) => HTMLElement
    self?: boolean
  } = {},
) {
  const instance = getCurrentInstance()!
  const binding =
    options.binding ??
    (options.self
      ? componentBindings.get(instance)
      : inject(zViewContext, undefined))
  if (!binding) return
  // A backend opt-in consumes this view binding; private nested views do not reuse it.
  provide(zViewContext, undefined)
  const { runtime, handle } = binding
  const renderedRoots = () => options.targets?.() ?? roots(instance.subTree)
  const undeclare = declareRoots(binding, renderedRoots)
  const attached = new Map<
    HTMLElement,
    ReturnType<typeof runtime.browser.attach>
  >()
  const blocked = new Map<HTMLElement, () => void>()
  function hide(element: HTMLElement) {
    if (blocked.has(element)) return
    const value = element.style.getPropertyValue('visibility'),
      priority = element.style.getPropertyPriority('visibility'),
      inert = element.inert
    element.style.setProperty('visibility', 'hidden', 'important')
    element.inert = true
    blocked.set(element, () => {
      if (value) element.style.setProperty('visibility', value, priority)
      else element.style.removeProperty('visibility')
      element.inert = inert
    })
  }
  let mounted = false,
    disposed = false
  function sync() {
    if (!mounted) return
    const state = binding!.resolved()
    const rendered = renderedRoots()
    if (!state) for (const element of rendered) hide(element)
    else {
      for (const restore of blocked.values()) restore()
      blocked.clear()
    }
    const elements = state?.materialized ? rendered : []
    for (const [element, target] of attached)
      if (!elements.includes(element)) {
        target.release()
        attached.delete(element)
      }
    for (const element of elements) {
      if (attached.has(element) || !element.parentElement) continue
      // A composing component and its view may describe the same physical root.
      // The deepest materialized participant is attached; its ancestor prefix is retained.
      if (runtime.browser.roots(handle).includes(element)) continue
      let host: HTMLElement | undefined = options.host?.(element)
      for (const parent of [...(state?.chain ?? [])].reverse().slice(1)) {
        if (host) break
        const declared = [...(runtime.physicalRoots.get(parent) ?? [])].flatMap(
          (get) => [...get()],
        )
        host = [...declared, ...runtime.browser.roots(parent)].find(
          (root) => root !== element && root.contains(element),
        )
        if (host) break
      }
      host ??= element.closest('dialog') ?? element.ownerDocument.body
      if (host === element) host = element.parentElement
      try {
        const target = runtime.browser.attach({
          handle,
          element,
          host,
          mode: 'css',
        })
        attached.set(element, target)
      } catch (error) {
        hide(element)
        throw error
      }
    }
  }
  onMounted(async () => {
    // Vue mounts children before their parents' directives. Collect all physical
    // allocation hosts before projecting descendants, including passive hosts.
    await nextTick()
    if (disposed) return
    mounted = true
    sync()
  })
  onUpdated(sync)
  watch(() => runtime.snapshot.value, sync, { flush: 'post' })
  onBeforeUnmount(() => {
    disposed = true
    mounted = false
    undeclare()
    for (const target of attached.values()) target.release()
    attached.clear()
    for (const restore of blocked.values()) restore()
    blocked.clear()
  })
}

/** Backend-owned allocation wrapper registration; the value is a core-resolved binding. */
export function useUiZPart() {
  const bindings = new Map<
    HTMLElement,
    { binding: ZBinding; release: () => void }
  >()
  function attach(element: HTMLElement, binding: ZBinding) {
    if (bindings.get(element)?.binding === binding) return
    bindings.get(element)?.release()
    let target: ReturnType<typeof binding.runtime.browser.attach> | undefined
    const undeclare = declareRoots(binding, () => [element])
    const update = () => {
      const state = binding.resolved()
      if (!state?.materialized) {
        target?.release()
        target = undefined
        return
      }
      if (target || !element.parentElement) return
      target = binding.runtime.browser.attach({
        handle: binding.handle,
        element,
        host: element.parentElement,
        mode: 'css',
      })
    }
    const unsubscribe = binding.runtime.domain.subscribe(update)
    try {
      update()
    } catch (error) {
      unsubscribe()
      undeclare()
      throw error
    }
    bindings.set(element, {
      binding,
      release: () => {
        undeclare()
        unsubscribe()
        target?.release()
      },
    })
  }
  return {
    mounted(element: HTMLElement, { value }: { value: ZBinding | undefined }) {
      if (value) attach(element, value)
    },
    updated(element: HTMLElement, { value }: { value: ZBinding | undefined }) {
      if (value) attach(element, value)
      else {
        bindings.get(element)?.release()
        bindings.delete(element)
      }
    },
    beforeUnmount(element: HTMLElement) {
      bindings.get(element)?.release()
      bindings.delete(element)
    },
  }
}
