import { resolveEntry } from './text'
import { computed, ref, watch, type Slots } from 'vue'
import type { UiEntryControl } from './control'
import type { UiEntry } from './types'
import type { UiEntryStatusViewBinding, UiEntryViewNode } from '../backend'
import { useMessages } from '../i18n/messages'
import { navigationPath } from '../navigation/menu'

export function useEntryView(
  getControl: () => UiEntryControl,
  slots: Slots,
  navigation = false,
  modelValue: () => string | undefined = () => undefined,
  navigationOptions?: {
    persistent(): boolean
    expandedKeys(): readonly string[] | undefined
    updateExpanded(keys: readonly string[]): void
    currentPath(): readonly string[] | undefined
    request?(key: string, event?: MouseEvent): void
    href?(key: string): string | undefined
    disabled?(): boolean
  },
) {
  const treeExpanded = ref<ReadonlySet<string>>(new Set())
  const popupExpanded = ref<ReadonlySet<string>>(new Set())
  const localExpanded = computed({
    get: () =>
      navigationOptions?.persistent()
        ? treeExpanded.value
        : popupExpanded.value,
    set: (value: ReadonlySet<string>) => {
      if (navigationOptions?.persistent()) treeExpanded.value = value
      else popupExpanded.value = value
    },
  })
  let revealedPath: string | undefined
  const expanded = computed({
    get: () =>
      navigationOptions?.expandedKeys() === undefined
        ? localExpanded.value
        : new Set(navigationOptions.expandedKeys()),
    set: (keys: ReadonlySet<string>) => {
      // Native submenu cleanup can report an already-closed branch while its
      // parent is still mounted for an exit animation. Do not turn that report
      // into another render/cleanup cycle (or repeat a controlled-model emit).
      const current = expanded.value
      if (
        current.size === keys.size &&
        [...keys].every((key) => current.has(key))
      )
        return
      localExpanded.value = keys
      navigationOptions?.updateExpanded([...keys])
    },
  })
  const messages = useMessages('entries')
  watch(
    getControl,
    (control, previous) => {
      treeExpanded.value = new Set()
      popupExpanded.value = new Set()
      revealedPath = undefined
      // A newly mounted borrowing view must honor its supplied expansion model.
      // Clear it only when replacing the entry owner of an existing view.
      if (previous) expanded.value = new Set()
      return control.load()
    },
    { immediate: true },
  )
  function collapse() {
    expanded.value = new Set()
  }
  if (navigation)
    watch(
      [
        modelValue,
        () => navigationOptions?.persistent() ?? false,
        () =>
          navigationOptions?.currentPath() ??
          (modelValue() === undefined
            ? undefined
            : navigationPath(getControl(), modelValue()!)),
      ],
      ([key, persistent, path]) => {
        if (!persistent) {
          collapse()
          return
        }
        const identity = JSON.stringify([key, path])
        if (key !== undefined && path?.length && identity !== revealedPath)
          expanded.value = new Set([...expanded.value, ...path.slice(0, -1)])
        revealedPath = identity
      },
      { immediate: true },
    )
  function status(key?: string): UiEntryStatusViewBinding {
    const state = getControl().collection(key)
    const pending = state.status === 'loading' || state.status === 'refreshing'
    return {
      pending,
      failed: state.status === 'error',
      retryLabel: messages.value.retry,
      message: pending
        ? messages.value.loading
        : state.status === 'error'
          ? messages.value.entriesFailed
          : state.status === 'ready' && !state.entries.length
            ? messages.value.entriesEmpty
            : '',
    }
  }
  function map(entries: readonly UiEntry[]): UiEntryViewNode[] {
    return entries.map((definition) => {
      const source = resolveEntry(definition)
      // Navigation projects metadata without mutating shared command entries.
      const entry =
        navigation && source.kind !== 'separator'
          ? {
              ...source,
              ...('shortcut' in source ? { shortcut: undefined } : {}),
              ...('disabled' in source ||
              !source.kind ||
              source.kind === 'item' ||
              source.kind === 'submenu'
                ? {
                    disabled:
                      Boolean('disabled' in source && source.disabled) ||
                      Boolean(navigationOptions?.disabled?.()),
                  }
                : {}),
              ...(!source.kind || source.kind === 'item'
                ? { href: navigationOptions?.href?.(source.key) ?? source.href }
                : {}),
            }
          : source
      if (entry.kind === 'separator') return { entry }
      if (entry.kind === 'group' && definition.kind === 'group') {
        const children = map(definition.entries)
        return {
          entry: { ...entry, entries: children.map((child) => child.entry) },
          children,
          containsCurrent: children.some(
            (node) => node.current || node.containsCurrent,
          ),
        }
      }
      if (entry.kind === 'submenu') {
        const open = expanded.value.has(entry.key) && !entry.disabled
        const children = map(getControl().collection(entry.key).entries)
        return {
          entry: { ...entry, children: children.map((child) => child.entry) },
          containsCurrent: children.some(
            (node) => node.current || node.containsCurrent,
          ),
          expanded: open,
          children,
          status: open ? status(entry.key) : undefined,
        }
      }
      const selection = navigation
        ? undefined
        : getControl().selectionFor(entry.key)
      return {
        entry,
        selectionMode: selection?.mode,
        selected: selection
          ? getControl().selectedKeys(selection.key).includes(entry.key)
          : undefined,
        current: navigation && modelValue() === entry.key,
        request:
          navigation && navigationOptions?.request
            ? (event?: MouseEvent) =>
                navigationOptions.request!(entry.key, event)
            : undefined,
      }
    })
  }
  async function expand(key: string, open: boolean) {
    const entry = getControl().find(key)
    if (entry?.kind !== 'submenu' || entry.disabled) return
    const keys = new Set(expanded.value)
    if (open) {
      function ancestors(
        entries: readonly UiEntry[],
        path: string[] = [],
      ): string[] | undefined {
        for (const item of entries) {
          if (item.kind === 'submenu') {
            const next = [...path, item.key]
            if (item.key === key) return next
            const found = ancestors(
              getControl().collection(item.key).entries,
              next,
            )
            if (found) return found
          } else if (item.kind === 'group') {
            const found = ancestors(item.entries, path)
            if (found) return found
          }
        }
      }
      if (!navigationOptions?.persistent()) keys.clear()
      for (const ancestor of ancestors(getControl().collection().entries) ?? [])
        keys.add(ancestor)
    } else {
      function removeBranch(key: string) {
        keys.delete(key)
        for (const child of getControl().collection(key).entries) {
          if (child.kind === 'submenu') removeBranch(child.key)
          if (child.kind === 'group') removeGroup(child.entries)
        }
      }
      function removeGroup(entries: readonly UiEntry[]) {
        for (const child of entries) {
          if (child.kind === 'submenu') removeBranch(child.key)
          if (child.kind === 'group') removeGroup(child.entries)
        }
      }
      removeBranch(key)
    }
    expanded.value = keys
    if (open) await getControl().load(key)
  }
  return {
    messagesReady: messages.ready,
    entries: computed(() => map(getControl().collection().entries)),
    status: computed(() => status()),
    expand,
    collapse,
    retry: (key?: string) => getControl().refresh(key),
    EntryContent: ({
      entry,
    }: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
    }) => slots.entry?.({ entry }) ?? entry.render?.() ?? entry.label,
  }
}
