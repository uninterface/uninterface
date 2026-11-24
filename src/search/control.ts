import { resolveUiText } from '../text/source'
import { computed, shallowRef } from 'vue'
import { createUiEntryControl } from '../entries/control'
import type { UiEntry } from '../entries/types'

export interface UiSearchResult<T = unknown> {
  readonly key: string
  readonly label: string
  readonly disabled: boolean
  readonly item: T
  readonly matchRanges?: readonly (readonly [start: number, end: number])[]
}
export interface UiSearchBinding<T = unknown> {
  readonly query: string
  readonly results: readonly UiSearchResult<T>[]
  /** Whether the provider found matches before filtering candidates for the editor. */
  readonly hasMatches?: boolean
  readonly status:
    | 'idle'
    | 'waiting'
    | 'loading'
    | 'ready'
    | 'error'
    | 'disposed'
  readonly error: unknown
  setQuery(query: string): void
  /** Synchronize programmatic/accepted text without issuing a search. */
  syncQuery(query: string): void
  refresh(): Promise<void>
  isCurrent(result: UiSearchResult<T>): boolean
  describe(key: string): string | undefined
}
export interface UiTextSuggestionsBinding<T = unknown>
  extends UiSearchBinding<T> {
  text(item: T): string
}
export interface UiSearchOptions<T> {
  key(item: T): string
  label(item: T): string
  disabled?(item: T): boolean
  matchRanges?(item: T): UiSearchResult<T>['matchRanges']
  debounceMs?: number
  minLength?: number
}
export interface UiSearchControl<T> extends UiSearchBinding<T> {
  readonly bindings: {
    readonly select: UiSearchBinding<T>
    readonly suggestions: UiSearchBinding<T>
    textInput(options: { text(item: T): string }): UiTextSuggestionsBinding<T>
  }
  clear(): void
  dispose(): void
}
export function createUiSearchControl<T>(
  provider: (request: {
    query: string
    signal: AbortSignal
  }) => readonly T[] | Promise<readonly T[]>,
  options: UiSearchOptions<T>,
): UiSearchControl<T> {
  const delay = options.debounceMs ?? 150,
    minLength = options.minLength ?? 0
  if (
    !Number.isFinite(delay) ||
    delay < 0 ||
    !Number.isInteger(minLength) ||
    minLength < 0
  )
    throw new Error('Invalid search debounce/minimum length.')
  const query = shallowRef(''),
    waiting = shallowRef(false),
    disposed = shallowRef(false)
  const payloads = new WeakMap<object, UiSearchResult<T>>()
  let timer: ReturnType<typeof setTimeout> | undefined
  const entries = createUiEntryControl(async (request) => {
    const items = await provider(request)
    if (request.signal.aborted) return []
    return items.map((item) => {
      const key = options.key(item),
        label = options.label(item),
        disabled = Boolean(options.disabled?.(item))
      const entry: UiEntry = { key, label, disabled }
      const ranges = options.matchRanges?.(item)
      const matchRanges = ranges?.map(([start, end]) =>
        Object.freeze([start, end] as const),
      )
      payloads.set(
        entry,
        Object.freeze({
          key,
          label,
          disabled,
          item,
          ...(matchRanges && { matchRanges: Object.freeze(matchRanges) }),
        }),
      )
      return entry
    })
  })
  const collection = entries.collection()
  const results = computed(() =>
    collection.status === 'ready' && !waiting.value && !disposed.value
      ? collection.entries.map((entry) => payloads.get(entry)!)
      : [],
  )
  const status = computed(() =>
    disposed.value
      ? 'disposed'
      : waiting.value
        ? 'waiting'
        : collection.status === 'refreshing'
          ? 'loading'
          : collection.status,
  )
  function invalidate() {
    if (timer) clearTimeout(timer)
    timer = undefined
    waiting.value = false
    entries.clear()
  }
  function alive() {
    if (disposed.value) throw new Error('Search control is disposed.')
  }
  async function refresh() {
    alive()
    invalidate()
    if (query.value.length < minLength) return
    await entries.search(query.value)
  }
  const binding: UiSearchBinding<T> = {
    get query() {
      return query.value
    },
    get results() {
      return results.value
    },
    get status() {
      return status.value
    },
    get error() {
      return collection.error
    },
    setQuery(value) {
      alive()
      query.value = value
      invalidate()
      if (value.length < minLength) return
      if (delay === 0) {
        void entries.search(value).catch(() => {})
        return
      }
      waiting.value = true
      timer = setTimeout(() => {
        timer = undefined
        waiting.value = false
        void entries.search(query.value).catch(() => {})
      }, delay)
    },
    syncQuery(value) {
      alive()
      query.value = value
      invalidate()
    },
    refresh,
    isCurrent(result) {
      return (
        status.value === 'ready' &&
        results.value.includes(result) &&
        !result.disabled &&
        !options.disabled?.(result.item)
      )
    },
    describe(key) {
      return resolveUiText(entries.describe(key)?.label)
    },
  }
  return {
    get query() {
      return binding.query
    },
    get results() {
      return binding.results
    },
    get status() {
      return binding.status
    },
    get error() {
      return binding.error
    },
    setQuery: binding.setQuery,
    syncQuery: binding.syncQuery,
    refresh,
    isCurrent: binding.isCurrent,
    describe: binding.describe,
    bindings: {
      select: binding,
      suggestions: binding,
      textInput({ text }) {
        const candidates = computed(() =>
          binding.results.filter(
            (result) => text(result.item) !== binding.query,
          ),
        )
        return {
          get query() {
            return binding.query
          },
          get results() {
            return candidates.value
          },
          get hasMatches() {
            return binding.results.length > 0
          },
          get status() {
            return binding.status
          },
          get error() {
            return binding.error
          },
          setQuery: binding.setQuery,
          syncQuery: binding.syncQuery,
          refresh,
          isCurrent: (result) =>
            candidates.value.includes(result) && binding.isCurrent(result),
          describe: binding.describe,
          text,
        }
      },
    },
    clear() {
      alive()
      query.value = ''
      invalidate()
    },
    dispose() {
      if (disposed.value) return
      invalidate()
      disposed.value = true
      entries.dispose()
    },
  }
}
