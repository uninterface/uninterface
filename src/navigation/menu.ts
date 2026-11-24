import { requireUiText, type UiTextSource } from '../text/source'
import {
  computed,
  effectScope,
  nextTick,
  ref,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type { UiEntryControl } from '../entries/control'
import type { UiEntry } from '../entries/types'
import type {
  UiBreadcrumbItem,
  UiBreadcrumbsBinding,
  UiLinkBinding,
  UiNavigationControl,
} from './control'

export type UiNavigationResult =
  | { status: 'completed' | 'unchanged' | 'blocked' | 'cancelled' }
  | { status: 'failed'; error: unknown }
export interface UiNavigationDriver {
  readonly current: MaybeRefOrGetter<string | undefined>
  href?(key: string): string | undefined
  navigate(
    key: string,
    context: { signal: AbortSignal },
  ): UiNavigationResult | Promise<UiNavigationResult>
}
export type UiNavigationStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'missing'
  | 'error'
export type UiNavMenuPresentation =
  | 'horizontal'
  | 'vertical-tree'
  | 'vertical-popup'
  | 'icon-popup'
export interface UiNavigationCrumb {
  key: string
  label: UiTextSource
  destination?: string
}
export interface UiNavigationMenuOptions {
  driver: UiNavigationDriver
  resolvePath?(
    key: string,
    context: { signal: AbortSignal },
  ): readonly string[] | undefined | Promise<readonly string[] | undefined>
  resolveBreadcrumbs?(
    key: string,
    context: { signal: AbortSignal },
  ): readonly UiNavigationCrumb[] | Promise<readonly UiNavigationCrumb[]>
}
export interface UiNavMenuBinding {
  readonly control: UiEntryControl
  readonly currentKey: string | undefined
  readonly currentPath: readonly string[]
  readonly status: UiNavigationStatus
  readonly disabled: boolean
  href(key: string): string | undefined
  request(key: string, event?: MouseEvent): Promise<UiNavigationResult>
  retry(): Promise<void>
}
export interface UiNavigationMenuControl extends UiNavigationControl {
  readonly bindings: UiNavigationControl['bindings'] & {
    readonly navMenu: UiNavMenuBinding
  }
}

/** Find only known entries: never search an unloaded branch by fetching it. */
export function navigationPath(
  control: UiEntryControl,
  key: string,
): string[] | undefined {
  function visit(
    entries: readonly UiEntry[],
    parents: string[],
  ): string[] | undefined {
    for (const entry of entries) {
      if (entry.kind === 'group') {
        const found = visit(entry.entries, parents)
        if (found) return found
      } else if (entry.kind === 'submenu') {
        const found = visit(control.collection(entry.key).entries, [
          ...parents,
          entry.key,
        ])
        if (found) return found
      } else if (entry.kind !== 'separator' && entry.key === key)
        return [...parents, key]
    }
  }
  return visit(control.collection().entries, [])
}
function findIn(entries: readonly UiEntry[], key: string): UiEntry | undefined {
  for (const entry of entries) {
    if (entry.key === key) return entry
    if (entry.kind === 'group') {
      const found = findIn(entry.entries, key)
      if (found) return found
    }
  }
}
export function createMenuNavigationControl(
  control: UiEntryControl,
  options: UiNavigationMenuOptions,
): UiNavigationMenuControl {
  const scope = effectScope(true)
  const disposed = ref(false)
  const current = computed(() => toValue(options.driver.current))
  const status = ref<UiNavigationStatus>('idle')
  const path = shallowRef<readonly string[]>([])
  const customCrumbs = shallowRef<readonly UiNavigationCrumb[]>()
  const retryVersion = ref(0)
  let resolution: AbortController | undefined
  let request: AbortController | undefined
  let pending: Promise<void> = Promise.resolve()
  let resolvedHint: { key: string; route: readonly string[] } | undefined
  const cache = new Map<string, UiLinkBinding>()
  function href(key: string) {
    const item = control.find(key)
    return (
      options.driver.href?.(key) ??
      (item && 'href' in item ? item.href : undefined)
    )
  }
  async function navigate(
    key: string,
    event?: MouseEvent,
  ): Promise<UiNavigationResult> {
    if (
      event &&
      (event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey)
    )
      return { status: 'unchanged' }
    // Must happen synchronously, before an asynchronous guard or driver request.
    event?.preventDefault()
    if (disposed.value) return { status: 'blocked' }
    const item = control.find(key)
    if (
      item &&
      (item.kind === 'group' ||
        item.kind === 'submenu' ||
        item.kind === 'separator' ||
        item.disabled)
    )
      return { status: 'blocked' }
    request?.abort()
    const active = (request = new AbortController())
    try {
      const result = await options.driver.navigate(key, {
        signal: active.signal,
      })
      return active.signal.aborted ? { status: 'cancelled' } : result
    } catch (error) {
      return active.signal.aborted
        ? { status: 'cancelled' }
        : { status: 'failed', error }
    }
  }
  function link(key: string): UiLinkBinding {
    let binding = cache.get(key)
    if (!binding) {
      binding = {
        get href() {
          return href(key)
        },
        get current() {
          return current.value === key
        },
        get disabled() {
          const item = control.find(key)
          return (
            disposed.value ||
            Boolean(item && 'disabled' in item && item.disabled)
          )
        },
        request(event) {
          void navigate(key, event)
        },
      }
      cache.set(key, binding)
    }
    return binding
  }
  // Changes to loaded collections invalidate derived metadata without fetching
  // unrelated branches. Loading is deduplicated by the borrowed entry control.
  const knownPath = computed(() =>
    current.value === undefined
      ? undefined
      : navigationPath(control, current.value),
  )
  const sourceSignature = computed(() => {
    const root = control.collection()
    const known = knownPath.value ?? []
    return [
      root.entries,
      ...known.slice(0, -1).flatMap((key) => {
        try {
          const branch = control.collection(key)
          return [branch.entries]
        } catch {
          return []
        }
      }),
    ]
  })
  scope.run(() => {
    watch(
      [current, retryVersion, sourceSignature],
      ([key], _, cleanup) => {
        if (disposed.value) return
        const active = (resolution = new AbortController())
        cleanup(() => active.abort())
        path.value = []
        customCrumbs.value = undefined
        if (key === undefined) {
          status.value = 'idle'
          return
        }
        status.value = 'loading'
        const alive = () =>
          !active.signal.aborted && !disposed.value && current.value === key
        pending = (async () => {
          try {
            await control.load()
            if (!alive()) return
            let route =
              navigationPath(control, key) ??
              (!options.resolvePath && resolvedHint?.key === key
                ? [...resolvedHint.route]
                : undefined)
            if (!route && options.resolvePath)
              route = (
                await options.resolvePath(key, { signal: active.signal })
              )?.slice()
            if (!alive()) return
            if (route) {
              if (
                !route.length ||
                route.at(-1) !== key ||
                new Set(route).size !== route.length
              )
                throw new Error('Invalid navigation path.')
              let entries = control.collection().entries
              for (let i = 0; i < route.length; i++) {
                const item = findIn(entries, route[i])
                if (
                  !item ||
                  (i === route.length - 1
                    ? item.kind && item.kind !== 'item'
                    : item.kind !== 'submenu')
                )
                  throw new Error(
                    'Navigation path does not match the entry hierarchy.',
                  )
                if (i < route.length - 1) {
                  await control.load(item.key)
                  if (!alive()) return
                  const branch = control.collection(item.key)
                  if (branch.status === 'error') throw branch.error
                  entries = branch.entries
                }
              }
            }
            const crumbs = options.resolveBreadcrumbs
              ? await options.resolveBreadcrumbs(key, { signal: active.signal })
              : undefined
            if (!alive()) return
            if (
              crumbs &&
              (!crumbs.length ||
                new Set(crumbs.map((item) => item.key)).size !==
                  crumbs.length ||
                crumbs.some(
                  (item) =>
                    !item.key ||
                    !requireUiText(item.label, 'Invalid breadcrumb trail.'),
                ) ||
                (crumbs.at(-1)?.destination !== undefined &&
                  crumbs.at(-1)?.destination !== key))
            )
              throw new Error('Invalid breadcrumb trail.')
            if (route) resolvedHint = { key, route: [...route] }
            path.value = Object.freeze(route ?? [])
            customCrumbs.value = crumbs
            status.value =
              route || crumbs
                ? 'ready'
                : control.collection().status === 'error'
                  ? 'error'
                  : 'missing'
          } catch {
            if (alive()) status.value = 'error'
          }
        })()
      },
      { immediate: true },
    )
  })
  async function retry() {
    if (disposed.value) return
    retryVersion.value++
    // Watch is synchronous with the next Vue flush; await the current generation.
    await nextTick()
    for (;;) {
      const generation = pending
      await generation
      await nextTick()
      if (disposed.value || generation === pending) return
    }
  }
  const items = computed<readonly UiBreadcrumbItem[]>(() => {
    if (status.value !== 'ready') return []
    if (customCrumbs.value)
      return customCrumbs.value.map((item) => ({
        key: item.key,
        label: requireUiText(item.label, 'Invalid breadcrumb trail.'),
        binding:
          item.destination === undefined ? undefined : link(item.destination),
      }))
    return path.value.flatMap((key) => {
      const item = control.find(key)
      return item && 'label' in item
        ? [
            {
              key,
              label: requireUiText(item.label, 'Invalid breadcrumb trail.'),
              binding: item.kind === 'submenu' ? undefined : link(key),
            },
          ]
        : []
    })
  })
  const breadcrumbs: UiBreadcrumbsBinding = {
    get items() {
      return items.value
    },
    get status() {
      return status.value
    },
    retry,
  }
  return {
    bindings: {
      link,
      breadcrumbs,
      navMenu: {
        control,
        get currentKey() {
          return current.value
        },
        get currentPath() {
          return path.value
        },
        get status() {
          return status.value
        },
        get disabled() {
          return disposed.value
        },
        href,
        request: navigate,
        retry,
      },
    },
    dispose() {
      disposed.value = true
      resolution?.abort()
      request?.abort()
      scope.stop()
    },
  }
}
