import { requireUiText, type UiTextSource } from '../text/source'
import type { UiEntryControl } from '../entries/control'
import {
  createMenuNavigationControl,
  type UiNavigationMenuOptions,
  type UiNavigationMenuControl,
  type UiNavigationStatus,
} from './menu'
import { ref, computed, type MaybeRefOrGetter, toValue } from 'vue'

/** A projection of application navigation, not a competing router. */
export interface UiLinkBinding {
  readonly href: string | undefined
  readonly current: boolean
  readonly disabled: boolean
  /** Called only for ordinary same-window activation; the owner synchronously prevents default if routing. */
  request(event: MouseEvent): void
}
export interface UiBreadcrumbItem {
  readonly key: string
  readonly label: string
  readonly binding?: UiLinkBinding
}
export interface UiBreadcrumbsBinding {
  readonly items: readonly UiBreadcrumbItem[]
  readonly status?: UiNavigationStatus
  retry?(): Promise<void>
}
export interface UiNavigationLocation {
  key: string
  label: UiTextSource
  href: string
  parent?: string
  disabled?: boolean
}
export interface UiNavigationOptions {
  current: MaybeRefOrGetter<string | undefined>
  /** Application handles confirmation and commits current separately. */
  navigate?: (location: UiNavigationLocation, event: MouseEvent) => void
}
export interface UiNavigationControl {
  readonly bindings: {
    link(key: string): UiLinkBinding
    readonly breadcrumbs: UiBreadcrumbsBinding
  }
  dispose(): void
}
export function createUiNavigationControl(
  control: UiEntryControl,
  options: UiNavigationMenuOptions,
): UiNavigationMenuControl
export function createUiNavigationControl(
  locations: MaybeRefOrGetter<readonly UiNavigationLocation[]>,
  options: UiNavigationOptions,
): UiNavigationControl
export function createUiNavigationControl(
  source: MaybeRefOrGetter<readonly UiNavigationLocation[]> | UiEntryControl,
  config: UiNavigationOptions | UiNavigationMenuOptions,
): UiNavigationControl {
  if ('driver' in config)
    return createMenuNavigationControl(source as UiEntryControl, config)
  const locations = source as MaybeRefOrGetter<readonly UiNavigationLocation[]>
  const options = config
  const disposed = ref(false)
  const index = computed(() => {
    const map = new Map<string, UiNavigationLocation>()
    for (const item of toValue(locations)) {
      if (!item.key || map.has(item.key))
        throw new Error('Navigation locations require unique nonempty keys.')
      requireUiText(
        item.label,
        'Navigation locations require labels and hrefs.',
      )
      if (!item.href)
        throw new Error('Navigation locations require labels and hrefs.')
      map.set(item.key, item)
    }
    return map
  })
  const cache = new Map<string, UiLinkBinding>()
  function location(key: string) {
    const item = index.value.get(key)
    if (!item) throw new Error(`Unknown navigation location: ${key}`)
    return item
  }
  function link(key: string): UiLinkBinding {
    location(key)
    let binding = cache.get(key)
    if (!binding) {
      binding = {
        get href() {
          return index.value.get(key)?.href ?? ''
        },
        get current() {
          return toValue(options.current) === key
        },
        get disabled() {
          return (
            disposed.value ||
            !index.value.has(key) ||
            Boolean(index.value.get(key)?.disabled)
          )
        },
        request(event) {
          if (binding!.disabled) {
            event.preventDefault()
            return
          }
          if (options.navigate) {
            event.preventDefault()
            options.navigate(location(key), event)
          }
        },
      }
      cache.set(key, binding)
    }
    return binding
  }
  const path = computed(() => {
    const result: UiBreadcrumbItem[] = [],
      seen = new Set<string>()
    let key = toValue(options.current)
    while (key !== undefined) {
      if (seen.has(key))
        throw new Error('Navigation location hierarchy contains a cycle.')
      seen.add(key)
      const item = location(key)
      result.unshift({
        key,
        label: requireUiText(
          item.label,
          'Navigation locations require labels and hrefs.',
        ),
        binding: link(key),
      })
      key = item.parent
    }
    return result
  })
  return {
    bindings: {
      link,
      breadcrumbs: {
        get items() {
          return path.value
        },
      },
    },
    dispose() {
      disposed.value = true
    },
  }
}
export function ordinaryLinkActivation(
  event: MouseEvent,
  attrs: Record<string, unknown>,
) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey &&
    attrs.download === undefined &&
    (!attrs.target || attrs.target === '_self')
  )
}
