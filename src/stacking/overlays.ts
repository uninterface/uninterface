import {
  getCurrentInstance,
  onActivated,
  onDeactivated,
  inject,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  shallowRef,
  watch,
  type ComponentInternalInstance,
  type InjectionKey,
} from 'vue'
import {
  zOrder,
  zPage,
  zSurfaceContext,
  zParentContext,
  useZRuntime,
  zViewContext,
  type ZBinding,
} from './runtime'
import type { UiZOrder } from './authoring'
import type { UiZHandle } from './model'
import { useUiTooltipSurfaceBounds } from '../backend/tooltipGeometry'

const modalContext: InjectionKey<{
  order: () => UiZOrder | undefined
  instance: ComponentInternalInstance
}> = Symbol('z-modal')
const popupParentContext: InjectionKey<
  (() => UiZHandle | undefined) | undefined
> = Symbol('z-popup-parent')
const modalTooltipLayers: InjectionKey<
  | {
      tooltip: UiZHandle
      chrome: UiZHandle
      floating: UiZHandle
    }
  | undefined
> = Symbol('modal-tooltip-layers')

export function useModalValidationTooltipFallback() {
  const modal = inject(modalTooltipLayers, undefined)
  const parent = inject(popupParentContext, undefined)
  if (!modal || !parent) return () => false
  const runtime = useZRuntime()
  return () => {
    const handle = parent()
    if (!handle) return false
    const popup = runtime.snapshot.value.entries.find(
      (entry) => entry.handle === handle,
    )
    const chrome = runtime.domain.describe(modal.chrome)
    return Boolean(
      popup && popup.band === 'group' && chrome && popup.value > chrome.value,
    )
  }
}

export function provideZModal(order: () => UiZOrder | undefined) {
  provide(modalContext, { order, instance: getCurrentInstance()! })
}
export function useZModalView(tooltipSections = true) {
  const runtime = useZRuntime(),
    owner = inject(modalContext, undefined)
  zPage(runtime)
  const surface = runtime.layers.open('modal', zOrder(runtime, owner?.order()))
  const content = runtime.layers.layer(surface, 'content')
  const floating = runtime.layers.layer(surface, 'floating')
  const tooltip = runtime.domain.handle('modal tooltips')
  const chrome = runtime.domain.handle('modal header and footer')
  const header = runtime.domain.handle('modal header')
  const footer = runtime.domain.handle('modal footer')
  if (tooltipSections)
    runtime.domain.transact({
      put: [
        {
          handle: tooltip,
          band: 'layer',
          parent: surface,
          source: tooltip.label,
          order: { above: [content], below: [floating] },
        },
        {
          handle: chrome,
          band: 'layer',
          parent: surface,
          source: chrome.label,
          order: { above: [tooltip], below: [floating] },
        },
        { handle: header, band: 'group', parent: chrome, source: header.label },
        { handle: footer, band: 'group', parent: chrome, source: footer.label },
      ],
    })
  const section = (handle: UiZHandle): ZBinding => ({
    runtime,
    handle,
    surface: () => surface,
    order: () => undefined,
    resolved: () => runtime.domain.describe(handle),
  })
  provide(
    modalTooltipLayers,
    tooltipSections ? { tooltip, chrome, floating } : undefined,
  )
  provide(zSurfaceContext, () => surface)
  provide(popupParentContext, undefined)
  provide(zParentContext, () => content)
  provide(zViewContext, undefined)
  const identity = () => {
    if (owner)
      for (const ref of [
        owner.instance.proxy,
        owner.instance.exposed,
        owner.instance.exposeProxy,
      ])
        if (ref) runtime.refs.set(ref, surface)
    runtime.registry.value++
  }
  identity()
  onMounted(identity)
  watch(
    () => zOrder(runtime, owner?.order()),
    (order) => {
      if (runtime.domain.describe(surface))
        runtime.domain.transact({
          put: [{ handle: surface, band: 'surface', source: 'UiModal', order }],
        })
    },
    { flush: 'post' },
  )
  let target: ReturnType<typeof runtime.browser.attach> | undefined,
    released = false
  function release() {
    if (released) return
    released = true
    target?.release()
    target = undefined
    if (runtime.domain.describe(surface)) runtime.layers.close(surface)
    runtime.registry.value++
  }
  onBeforeUnmount(release)
  return {
    header: tooltipSections ? section(header) : undefined,
    footer: tooltipSections ? section(footer) : undefined,
    open(element: HTMLDialogElement) {
      target ??= runtime.browser.attach({
        handle: surface,
        element,
        host: element.parentElement!,
        mode: 'dialog',
      })
      target.opening()
    },
    closed: release,
  }
}

/** A backend supplies the actual overlay wrapper. Identity lasts through exit and retained v-show. */
export function useUiZPopup(
  target: () => HTMLElement | null | undefined,
  options: {
    source?: string
    tooltip?: {
      anchor: () => HTMLElement | undefined
      visible: () => boolean
      /** The paint box may be inside the toolkit's registered stacking wrapper. */
      bubble?: () => HTMLElement | null | undefined
    }
    topLayer?: boolean | (() => boolean)
    observe?: boolean
    scope?: boolean
    /** A docked surface forwards its enclosing scope instead of creating a popup parent. */
    scopeActive?: () => boolean
  } = {},
) {
  const runtime = useZRuntime(),
    surface = inject(zSurfaceContext, () => runtime.page),
    inherited = inject(popupParentContext, undefined)
  const modal = inject(modalTooltipLayers, undefined)
  const floatingLayer = () =>
    runtime.layers.layer(surface() ?? zPage(runtime), 'floating')
  const tooltipParent = () => {
    const parent = inherited?.()
    if (modal && (!parent || parent === modal.floating)) return modal.tooltip
    return parent ?? floatingLayer()
  }
  const orderingParent = () =>
    options.tooltip ? tooltipParent() : (inherited?.() ?? floatingLayer())
  if (options.tooltip)
    useUiTooltipSurfaceBounds(
      options.tooltip.bubble ?? target,
      () => {
        const parent = inherited?.()
        return !!(modal && parent && parent !== modal.floating)
      },
      options.tooltip.anchor,
      options.tooltip.visible,
    )
  const handle = shallowRef<UiZHandle>()
  let lastHandle: UiZHandle | undefined
  if (options.scope)
    provide(popupParentContext, () =>
      options.scopeActive?.() === false
        ? inherited
          ? inherited()
          : runtime.layers.layer(surface() ?? zPage(runtime), 'floating')
        : (handle.value ?? lastHandle),
    )
  let element: HTMLElement | undefined,
    attachment: ReturnType<typeof runtime.browser.attach> | undefined
  let alive = true,
    active = true,
    observer: MutationObserver | undefined
  const suppressed = new WeakMap<
    HTMLElement,
    { value: string; priority: string }
  >()
  function suppress(node: HTMLElement) {
    const style = node.style
    if (!suppressed.has(node))
      suppressed.set(node, {
        value: style.getPropertyValue('visibility'),
        priority: style.getPropertyPriority('visibility'),
      })
    style.setProperty('visibility', 'hidden', 'important')
  }
  function restoreVisibility(node: HTMLElement) {
    const previous = suppressed.get(node)
    if (!previous) return
    suppressed.delete(node)
    const style = node.style
    if (
      style.getPropertyValue('visibility') === 'hidden' &&
      style.getPropertyPriority('visibility') === 'important'
    )
      style.setProperty('visibility', previous.value, previous.priority)
  }
  function release() {
    // A retained drawer changes scope without dismissing its nested popups.
    // Reparent direct children before removing the old popup group.
    if (handle.value && options.scope && options.scopeActive?.() === false) {
      const parent =
        inherited?.() ??
        runtime.layers.layer(surface() ?? zPage(runtime), 'floating')
      const children = runtime.domain.snapshot.entries.filter(
        (entry) => entry.parent === handle.value,
      )
      if (children.length)
        runtime.domain.transact({
          put: children.map((entry) => ({
            handle: entry.handle,
            band: entry.band,
            parent,
            order: entry.order,
            sequence: entry.sequence,
            source: entry.source,
          })),
        })
    }
    attachment?.release()
    attachment = undefined
    element = undefined
    if (handle.value && runtime.domain.describe(handle.value))
      runtime.domain.transact({ remove: [handle.value] })
    handle.value = undefined
  }
  const targetMode = () =>
    (
      typeof options.topLayer === 'function'
        ? options.topLayer()
        : options.topLayer
    )
      ? ('popover' as const)
      : ('css' as const)
  let attachedMode: 'popover' | 'css' | undefined
  function sync(next = target() ?? undefined) {
    if (!alive || !active) return
    // Descendants can mount before their enclosing native surface opens, or
    // remain mounted during its exit. Do not register outside that popup scope.
    if (inherited && !runtime.domain.describe(inherited()!)) {
      release()
      return
    }
    if (next === element && next?.isConnected && handle.value) {
      const current = runtime.domain.describe(handle.value)
      if (!current) {
        suppress(next)
        return
      }
      if (attachedMode !== targetMode()) {
        attachment?.closed()
        attachment?.release()
        attachedMode = targetMode()
        attachment = runtime.browser.attach({
          handle: handle.value,
          element: next,
          host: next.parentElement!,
          mode: attachedMode,
        })
      }
      const parent = orderingParent()
      if (current.parent !== parent)
        runtime.domain.transact({
          put: [
            {
              handle: handle.value,
              band: 'group',
              parent,
              source: options.source ?? 'owned popup',
            },
          ],
        })
      restoreVisibility(next)
      return
    }
    release()
    if (!next?.isConnected) return
    const h = runtime.domain.handle(options.source ?? 'owned popup')
    const parent = orderingParent()
    try {
      runtime.domain.transact({
        put: [
          {
            handle: h,
            band: 'group',
            parent,
            source: options.source ?? 'owned popup',
          },
        ],
      })
      let nativeHost: HTMLElement | undefined
      const currentHost = () => {
        // Keep the established boundary through parent dismissal/exit teardown.
        if (nativeHost?.contains(next)) return nativeHost
        nativeHost = undefined
        // A nested CSS popup lives inside its owning native top-layer surface.
        // Ancestors outside that surface cannot clip or stack above its content.
        for (let node = next.parentElement; node; node = node.parentElement) {
          if (node.localName === 'dialog') return (nativeHost = node)
          if (!node.hasAttribute('popover')) continue
          const owner = runtime.browser.lookup(node)
          if (!owner) continue
          const registered = runtime.browser.describe(owner)
          if (
            registered.target === node &&
            registered.mode === 'popover' &&
            runtime.domain.describe(h)?.chain.includes(owner)
          )
            return (nativeHost = node)
        }
        return next.ownerDocument.body
      }
      attachment = runtime.browser.attach({
        handle: h,
        element: next,
        host: currentHost(),
        currentHost,
        mode: targetMode(),
      })
      attachedMode = targetMode()
      element = next
      handle.value = h
      lastHandle = h
      // A toolkit can reuse the same wrapper after its former parent closes.
      // Reveal it only when it has a valid stacking attachment again.
      restoreVisibility(next)
    } catch (error) {
      suppress(next)
      if (runtime.domain.describe(h)) runtime.domain.transact({ remove: [h] })
      throw error
    }
  }
  const check = () => sync()
  onMounted(() => {
    sync()
    if (options.observe !== false && typeof document !== 'undefined') {
      observer = new document.defaultView!.MutationObserver(check)
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-controls', 'aria-owns'],
      })
    }
  })
  onUpdated(check)
  onDeactivated(() => {
    active = false
    release()
  })
  onActivated(() => {
    active = true
    check()
  })
  watch([target, () => inherited?.(), surface], check, { flush: 'post' })
  watch(
    () => runtime.snapshot.value,
    () => {
      if (
        handle.value &&
        !runtime.domain.describe(handle.value) &&
        element?.isConnected
      )
        suppress(element)
    },
    { flush: 'post' },
  )
  onBeforeUnmount(() => {
    alive = false
    observer?.disconnect()
    release()
  })
  return {
    prepare(next: HTMLElement, native = true) {
      sync(next)
      if (native) attachment?.opening()
    },
    hasNativeAbove() {
      const current = handle.value && runtime.domain.describe(handle.value)
      return (
        !!current &&
        runtime.domain.snapshot.entries.some(
          (entry) =>
            entry.value > current.value &&
            runtime.browser.describe(entry.handle).nativeOpen,
        )
      )
    },
    closed() {
      attachment?.closed()
      release()
    },
    release,
    handle,
  }
}
