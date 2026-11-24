import {
  nextTick,
  computed,
  useId,
  onBeforeUnmount,
  onDeactivated,
  onBeforeUpdate,
  onUpdated,
  ref,
  watch,
  provide,
  inject,
  onMounted,
  onActivated,
  type InjectionKey,
  type Ref,
} from 'vue'
import type {
  UiMenuViewBinding,
  UiMenuHostBindings,
  UiEntryViewNode,
} from './index'
const menuIconColumnKey: InjectionKey<Readonly<Ref<boolean>>> =
  Symbol('menu-icon-column')

/** Share icon presence through groups, but start a new column at each submenu.
 * Backends own the actual column markup, dimensions and placement.
 */
export function useUiMenuIconColumn(
  entries: () => readonly UiEntryViewNode[],
  options: {
    group?: () => boolean
    enabled?: () => boolean
    reserve?: () => boolean
  } = {},
) {
  const parent = inject(menuIconColumnKey, undefined)
  function hasIcon(nodes: readonly UiEntryViewNode[]): boolean {
    return nodes.some(
      ({ entry, children }) =>
        entry.kind !== 'separator' &&
        (Boolean(entry.icon) ||
          (entry.kind === 'group' && hasIcon(children ?? []))),
    )
  }
  const column = computed(() =>
    options.group?.() && parent
      ? parent.value
      : options.enabled?.() !== false &&
        (options.reserve?.() || hasIcon(entries())),
  )
  provide(menuIconColumnKey, column)
  return column
}

interface MenuSurfaceScope {
  register(element: HTMLElement): () => void
}
const menuSurfaceKey: InjectionKey<MenuSurfaceScope> = Symbol('menu-surfaces')

/** Register an overlay's DOM surface without assuming where it is mounted. */
export function useUiMenuPopup(surface?: Ref<HTMLElement | undefined>) {
  const parent = inject(menuSurfaceKey, undefined)
  const children = new Set<HTMLElement>()
  provide(menuSurfaceKey, {
    register(element) {
      children.add(element)
      const detach = parent?.register(element)
      return () => {
        children.delete(element)
        detach?.()
      }
    },
  })
  if (surface)
    watch(
      surface,
      (element, _, cleanup) => {
        if (!element) return
        const detach = parent?.register(element)
        cleanup(() => detach?.())
      },
      { flush: 'post' },
    )
  return {
    contains(target: Node | null) {
      return Boolean(
        target &&
          (surface?.value?.contains(target) ||
            [...children].some((root) => root.contains(target))),
      )
    },
  }
}

/**
 * Optional command-menu view mechanics for backend authors.
 * Toolkit views still own markup, overlay placement and appearance.
 */
export function useUiMenuView(
  binding: () => UiMenuViewBinding,
  emit: {
    (event: 'open'): void
    (event: 'close'): void
    (event: 'activate', key: string): void
    (event: 'expand', key: string, open: boolean): void
    (event: 'retry', key?: string): void
  },
  options: {
    nativeInteraction?: (event?: KeyboardEvent) => boolean
    contextTriggerClass?: string
  } = {},
) {
  const surfaces = new Set<HTMLElement>()
  provide(menuSurfaceKey, {
    register(element) {
      surfaces.add(element)
      return () => surfaces.delete(element)
    },
  })
  const host = ref<HTMLElement>()
  const surface = ref<HTMLElement>()
  const roots = () => [
    ...new Set(
      [surface.value, ...surfaces].filter((root): root is HTMLElement =>
        Boolean(root),
      ),
    ),
  ]
  const owns = (target: Node | null) =>
    Boolean(target && roots().some((root) => root.contains(target)))
  const query = (selector: string) => [
    ...new Set(
      roots().flatMap((root) => [
        ...root.querySelectorAll<HTMLElement>(selector),
      ]),
    ),
  ]
  const id = useId()
  const anchor = ref<HTMLElement>()
  let disposed = false
  let openingRevision = 0
  let keyboardContextPending = false
  const point = ref<{ x: number; y: number }>()
  let returnTo: HTMLElement | null = null
  let hadFocus = false
  let typeahead = ''
  let typedAt = 0
  function first(root = surface.value) {
    return (
      root?.querySelector<HTMLElement>('[role^="menuitem"]') ??
      root?.querySelector<HTMLElement>('[role="menu"]')
    )
  }
  function open(event: MouseEvent | KeyboardEvent, atPointer = false) {
    const target = event.currentTarget
    if (!(target instanceof HTMLElement))
      throw new Error(
        'Menu host bindings require a rendered HTMLElement event target.',
      )
    anchor.value = target
    returnTo = target
    point.value =
      atPointer && event instanceof MouseEvent
        ? { x: event.clientX, y: event.clientY }
        : undefined
    emit('open')
    if (binding().open) {
      first()?.focus()
    }
  }
  const hostBindings = computed<UiMenuHostBindings>(() => {
    const state = {
      'aria-haspopup': 'menu' as const,
      'aria-expanded': binding().open,
      'aria-controls': binding().open ? id : undefined,
    }
    return {
      buttonTrigger: {
        ...state,
        onClick: (event) => (binding().open ? close() : open(event)),
      },
      contextTrigger: {
        class: options.contextTriggerClass,
        'aria-haspopup': state['aria-haspopup'],
        'aria-controls': state['aria-controls'],
        role: 'group',
        tabindex: 0,
        'aria-label': binding().label,
        onContextmenu(event) {
          event.preventDefault()
          open(event, true)
        },
        onKeydown(event) {
          if (
            event.key === 'ContextMenu' ||
            (event.shiftKey && event.key === 'F10')
          ) {
            event.preventDefault()
            event.stopPropagation()
            keyboardContextPending = true
            open(event)
          }
        },
      },
    }
  })
  function close(restore = true) {
    keyboardContextPending = false
    emit('close')
    if (restore) (returnTo?.isConnected ? returnTo : anchor.value)?.focus()
  }
  function outside(event: Event) {
    if (
      !host.value?.contains(event.target as Node) &&
      !owns(event.target as Node)
    )
      close(false)
  }
  async function keyboard(event: KeyboardEvent) {
    if (options.nativeInteraction?.(event)) return
    const target = event.target as HTMLElement
    if (!owns(target)) return
    const menu = target.closest<HTMLElement>('[role="menu"]')
    if (!menu) return
    const items = [
      ...menu.querySelectorAll<HTMLElement>('[role^="menuitem"]'),
    ].filter((item) => item.closest('[role="menu"]') === menu)
    const index = items.indexOf(
      target.closest<HTMLElement>('[role^="menuitem"]')!,
    )
    const rtl = getComputedStyle(menu).direction === 'rtl'
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft'
    let destination: HTMLElement | undefined
    if (event.key === 'ArrowDown')
      destination = items[(index + 1) % items.length]
    else if (event.key === 'ArrowUp')
      destination = items[(index - 1 + items.length) % items.length]
    else if (event.key === 'Home') destination = items[0]
    else if (event.key === 'End') destination = items.at(-1)
    else if (
      event.key === forward &&
      target.hasAttribute('aria-expanded') &&
      target.getAttribute('aria-disabled') !== 'true'
    ) {
      event.preventDefault()
      event.stopPropagation()
      emit('expand', target.dataset.entryKey!, true)
      await nextTick()
      const child = query('[role=menu]').find(
        (node) => node.dataset.parent === target.dataset.entryKey,
      )
      ;(
        child?.querySelector<HTMLElement>('[role^="menuitem"]') ?? child
      )?.focus()
    } else if (
      (event.key === backward || event.key === 'Escape') &&
      menu.dataset.parent !== undefined
    ) {
      event.preventDefault()
      event.stopPropagation()
      const key = menu.dataset.parent
      const parent = query('[data-entry-key]').find(
        (item) => item.dataset.entryKey === key,
      )
      emit('expand', key, false)
      await nextTick()
      parent?.focus()
    } else if (event.key === 'Escape' && binding().mode !== 'inline') close()
    else if (event.key === 'Tab') {
      // Keep native document navigation, but do not also run a widget's
      // submenu Tab trap after this controller has closed the root.
      event.stopPropagation()
      if (binding().mode !== 'inline') close()
      return
    } else if (
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      typeahead = Date.now() - typedAt > 600 ? event.key : typeahead + event.key
      typedAt = Date.now()
      const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)]
      destination = ordered.find((item) =>
        (item.getAttribute('aria-label') ?? item.textContent ?? '')
          .toLocaleLowerCase()
          .startsWith(typeahead.toLocaleLowerCase()),
      )
    } else return
    event.preventDefault()
    event.stopPropagation()
    destination?.focus()
  }
  function rovingFocus(event: FocusEvent) {
    if (options.nativeInteraction?.()) return
    const item = event.target as HTMLElement
    if (!owns(item) || !item.matches('[role^=menuitem]')) return
    for (const node of query('[role^=menuitem], [role=menu]'))
      node.tabIndex = -1
    item.tabIndex = 0
  }
  // Some browsers dispatch contextmenu after focus has moved into a teleported
  // popup. Cancel only the follow-up to our consumed keyboard invocation.
  // Keyup must not disarm this: the native event can be a key-release action.
  function resetKeyboardContext() {
    keyboardContextPending = false
  }
  function keyboardContext(event: MouseEvent) {
    if (!keyboardContextPending || !binding().open) return
    const target = event.target as Node | null
    if (!target || (!anchor.value?.contains(target) && !owns(target))) return
    keyboardContextPending = false
    event.preventDefault()
    event.stopPropagation()
  }
  function listen() {
    document.addEventListener('contextmenu', keyboardContext, true)
    document.addEventListener('keydown', resetKeyboardContext, true)
    document.addEventListener('pointerdown', resetKeyboardContext, true)
    document.addEventListener('keydown', keyboard, true)
    document.addEventListener('focusin', rovingFocus)
  }
  function unlisten() {
    resetKeyboardContext()
    document.removeEventListener('contextmenu', keyboardContext, true)
    document.removeEventListener('keydown', resetKeyboardContext, true)
    document.removeEventListener('pointerdown', resetKeyboardContext, true)
    document.removeEventListener('keydown', keyboard, true)
    document.removeEventListener('focusin', rovingFocus)
  }
  onMounted(listen)
  onActivated(listen)
  onDeactivated(unlisten)
  onBeforeUnmount(unlisten)
  watch([() => binding().mode, () => binding().open], async ([mode, open]) => {
    const revision = ++openingRevision
    document.removeEventListener('pointerdown', outside)
    document.removeEventListener('focusin', outside)
    if (mode === 'inline' || !open) {
      resetKeyboardContext()
      return
    }
    await nextTick()
    if (disposed || revision !== openingRevision || !binding().open) return
    first()?.focus()
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
  })
  onBeforeUpdate(() => {
    hadFocus = owns(document.activeElement)
  })
  onUpdated(async () => {
    if (!hadFocus) return
    await nextTick()
    if (document.activeElement !== document.body) return
    // An asynchronously mounted toolkit popup must receive focus before the
    // parent can fall back. Otherwise sibling replacement closes the new popup.
    let expandedKey: string | undefined
    const visit = (nodes: UiMenuViewBinding['entries']) => {
      for (const node of nodes) {
        if (node.expanded) expandedKey = node.entry.key
        if (node.children) visit(node.children)
      }
    }
    visit(binding().entries)
    if (expandedKey !== undefined) {
      const child = query('[role=menu]').find(
        (node) => node.dataset.parent === expandedKey,
      )
      if (child) (first(child) ?? child).focus()
    } else first()?.focus()
  })
  onDeactivated(() => {
    openingRevision++
    document.removeEventListener('pointerdown', outside)
    document.removeEventListener('focusin', outside)
  })
  onBeforeUnmount(() => {
    disposed = true
    openingRevision++
    document.removeEventListener('pointerdown', outside)
    document.removeEventListener('focusin', outside)
  })
  async function expanded(key: string, open: boolean) {
    emit('expand', key, open)
    if (!open) return
    await nextTick()
    const child = query('[role=menu]').find(
      (node) => node.dataset.parent === key,
    )
    ;(child?.querySelector<HTMLElement>('[role^=menuitem]') ?? child)?.focus()
  }
  function activated(key: string) {
    emit('activate', key)
    nextTick(() => {
      if (!binding().open)
        (returnTo?.isConnected ? returnTo : anchor.value)?.focus()
    })
  }
  return {
    host,
    surface,
    id,
    anchor,
    point,
    hostBindings,
    keyboard,
    expanded,
    activated,
    close,
    first,
  }
}
