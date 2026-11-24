import { shallowRef, toRaw } from 'vue'
import { hasColumnPresentation } from '../table/presentation'
import type { UiButtonBinding } from '../bindings/button'
import type {
  UiListBinding,
  UiListSorting,
  UiListItemContext,
  UiListKey,
  UiListPaginationResult,
  UiListQuery,
  UiListResult,
  UiListState,
  UiPaginatorBinding,
} from '../bindings/list'

export type UiListPaginationOptions = (
  | { readonly kind: 'numbered'; readonly canJump: boolean }
  | {
      readonly kind: 'cursor'
      readonly initialCursor?: string | null
      readonly mode?: 'replace' | 'accumulate'
    }
) & { readonly pageSize: number; readonly pageSizes?: readonly number[] }

/** Known reconciliation asserts placement/membership; unknown never guesses them. */
export type UiListChange<T> =
  | {
      readonly kind: 'upsert'
      readonly item: T
      readonly reconciliation:
        | 'unknown'
        | {
            readonly index?: number
            readonly exclude?: boolean
            readonly total?: number
          }
    }
  | {
      readonly kind: 'remove'
      readonly key: UiListKey
      readonly reconciliation: 'unknown' | { readonly total?: number }
    }

export interface UiListOptions<
  T,
  F = Record<string, unknown>,
  S extends string = string,
> {
  readonly itemKey: (item: T) => UiListKey
  readonly source: (
    query: UiListQuery<F, S>,
    context: { readonly signal: AbortSignal },
  ) => UiListResult<T> | Promise<UiListResult<T>>
  readonly query: Pick<UiListQuery<F, S>, 'filters' | 'sort'>
  /** Omission means no user sorting. Source execution stays business-owned. */
  readonly sorting?: UiListSorting<S>
  readonly pagination?: UiListPaginationOptions
  readonly selection?: 'single' | 'multiple'
  readonly disabled?: () => boolean
  readonly itemDisabled?: (item: T) => boolean
  readonly selectable?: (item: T) => boolean
  readonly removable?: (item: T) => boolean
  readonly activatable?: (item: T) => boolean
  readonly activate?: (item: T) => void | Promise<void>
  readonly create?: (item: T) => UiListChange<T> | Promise<UiListChange<T>>
  readonly update?: (
    key: UiListKey,
    item: T,
  ) => UiListChange<T> | Promise<UiListChange<T>>
  readonly remove?: (
    key: UiListKey,
  ) => UiListChange<T> | Promise<UiListChange<T>>
}

export interface UiListControl<
  T,
  F = Record<string, unknown>,
  S extends string = string,
> {
  /** True while a mounted table offers at least one supported column control. */
  readonly hasColumnSort: boolean
  readonly hasColumnFilter: boolean
  readonly state: UiListState<T, F, S>
  readonly bindings: {
    readonly list: UiListBinding<T, F, S>
    readonly paginator?: UiPaginatorBinding
  }
  readonly pagination?: UiPaginatorBinding
  refresh(): Promise<boolean>
  retry(): Promise<boolean>
  setQuery(
    query: Partial<Pick<UiListQuery<F, S>, 'filters' | 'sort'>>,
  ): Promise<boolean>
  select(key: UiListKey, selected: boolean): boolean
  clearSelection(): void
  applyConfirmed(change: UiListChange<T>): void
  create(item: T): Promise<boolean>
  update(key: UiListKey, item: T): Promise<boolean>
  remove(key: UiListKey): Promise<boolean>
  dispose(): void
}

function positive(value: number, name: string) {
  if (!Number.isSafeInteger(value) || value < 1)
    throw new Error(`${name} must be a positive safe integer.`)
}
function count(value: number | undefined, name: string) {
  if (value !== undefined && (!Number.isSafeInteger(value) || value < 0))
    throw new Error(`${name} must be a nonnegative safe integer.`)
}
function assertKey(key: UiListKey) {
  if (
    !(
      (typeof key === 'string' && key.length > 0) ||
      (typeof key === 'number' && Number.isFinite(key))
    )
  )
    throw new Error('List item key must be a nonempty string or finite number.')
}
// Queries are immutable snapshots, not a second mutable business model.
function snapshot<T>(value: T, ancestors = new Set<object>()): T {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined'
  )
    return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'object')
    throw new Error('List queries require plain finite data.')
  const raw = toRaw(value) as object
  if (Object.getOwnPropertySymbols(raw).length)
    throw new Error('List queries cannot contain symbol keys.')
  if (ancestors.has(raw)) throw new Error('List queries cannot contain cycles.')
  if (
    !Array.isArray(raw) &&
    Object.getPrototypeOf(raw) !== Object.prototype &&
    Object.getPrototypeOf(raw) !== null
  )
    throw new Error('List queries require plain objects and arrays.')
  ancestors.add(raw)
  const copy = Array.isArray(raw)
    ? raw.map((item) => snapshot(item, ancestors))
    : Object.fromEntries(
        Object.entries(raw).map(([key, item]) => [
          key,
          snapshot(item, ancestors),
        ]),
      )
  ancestors.delete(raw)
  return Object.freeze(copy) as T
}

function sameSnapshot(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object')
    return false
  if (Array.isArray(left) !== Array.isArray(right)) return false
  if (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length !== right.length
  )
    return false
  const leftData = left as Record<string, unknown>
  const rightData = right as Record<string, unknown>
  const keys = Object.keys(leftData)
  return (
    keys.length === Object.keys(rightData).length &&
    keys.every(
      (key) =>
        Object.hasOwn(rightData, key) &&
        sameSnapshot(leftData[key], rightData[key]),
    )
  )
}

export function createUiListControl<
  T,
  F = Record<string, unknown>,
  S extends string = string,
>(options: UiListOptions<T, F, S>): UiListControl<T, F, S> {
  const sorting = snapshot(
    options.sorting ?? { mode: 'single', keys: [] },
  ) as UiListSorting<S>
  if (
    !['single', 'multiple'].includes(sorting.mode) ||
    !Array.isArray(sorting.keys) ||
    sorting.keys.some((key) => typeof key !== 'string' || !key.trim()) ||
    new Set(sorting.keys).size !== sorting.keys.length
  )
    throw new Error(
      'Sorting requires single/multiple mode and unique nonempty source keys.',
    )
  const config = options.pagination && snapshot(options.pagination)
  if (config) {
    if (config.kind !== 'numbered' && config.kind !== 'cursor')
      throw new Error('Unsupported list pagination kind.')
    if (config.kind === 'numbered' && typeof config.canJump !== 'boolean')
      throw new Error('Numbered pagination must declare canJump.')
    if (
      config.kind === 'cursor' &&
      config.mode !== undefined &&
      !['replace', 'accumulate'].includes(config.mode)
    )
      throw new Error('Unsupported cursor window mode.')
    positive(config.pageSize, 'pageSize')
    for (const size of config.pageSizes ?? []) positive(size, 'pageSizes entry')
    if (config.pageSizes?.length && !config.pageSizes.includes(config.pageSize))
      throw new Error('pageSizes must include pageSize.')
    if (new Set(config.pageSizes).size !== (config.pageSizes?.length ?? 0))
      throw new Error('pageSizes must be unique.')
    if (
      config.kind === 'cursor' &&
      config.initialCursor != null &&
      typeof config.initialCursor !== 'string'
    )
      throw new Error('Initial cursor must be a string or null.')
  }
  if (
    options.selection !== undefined &&
    !['single', 'multiple'].includes(options.selection)
  )
    throw new Error('Unsupported list selection mode.')
  const accumulating = config?.kind === 'cursor' && config.mode === 'accumulate'
  function initialPagination(
    size = config?.pageSize,
  ): UiListQuery['pagination'] {
    if (!config || size === undefined) return undefined
    return config.kind === 'numbered'
      ? { kind: 'numbered', number: 1, size }
      : { kind: 'cursor', cursor: config.initialCursor ?? null, size }
  }
  function querySnapshot(query: UiListQuery<F, S>) {
    const keys = new Set<S>()
    for (const sort of query.sort) {
      if (
        typeof sort.key !== 'string' ||
        !sort.key ||
        !['asc', 'desc'].includes(sort.direction) ||
        keys.has(sort.key)
      )
        throw new Error('Sort keys must be unique with asc/desc directions.')
      keys.add(sort.key)
    }
    if (sorting.mode === 'single' && query.sort.length > 1)
      throw new Error('This list source supports only a single sort level.')
    for (const sort of query.sort)
      if (!sorting.keys.includes(sort.key))
        throw new Error(`Unsupported source sort key: ${sort.key}`)
    return snapshot(query)
  }
  const current = shallowRef<UiListState<T, F, S>>({
    query: querySnapshot({ ...options.query, pagination: initialPagination() }),
    activity: 'idle',
    error: null,
    failedRead: undefined,
    stale: false,
    disposed: false,
    selectedKeys: Object.freeze([]),
  })
  const state: UiListState<T, F, S> = Object.freeze({
    get query() {
      return current.value.query
    },
    get result() {
      return current.value.result
    },
    get failedRead() {
      return current.value.failedRead
    },
    get activity() {
      return current.value.activity
    },
    get error() {
      return current.value.error
    },
    get stale() {
      return current.value.stale
    },
    get disposed() {
      return current.value.disposed
    },
    get selectedKeys() {
      return current.value.selectedKeys
    },
  })
  function publish(patch: Partial<UiListState<T, F, S>>) {
    current.value = { ...current.value, ...patch }
  }
  function assertAlive() {
    if (state.disposed) throw new Error('List control has been disposed.')
  }
  const disabled = () => state.disposed || Boolean(options.disabled?.())
  const pending = () => state.activity !== 'idle'
  const empty: readonly T[] = Object.freeze([])
  const items = () => state.result?.items ?? empty
  const keyOf = (item: T) => {
    if (item === undefined)
      throw new Error('Undefined list items require a keyed record wrapper.')
    const key = options.itemKey(item)
    assertKey(key)
    return key
  }
  const find = (key: UiListKey) => items().find((item) => keyOf(item) === key)
  function validateItems(values: readonly T[]) {
    if (!Array.isArray(values))
      throw new Error('List source items must be an array.')
    const keys = new Set<UiListKey>()
    for (const item of values) {
      const key = keyOf(item)
      if (keys.has(key))
        throw new Error(`Duplicate list item key: ${String(key)}`)
      keys.add(key)
    }
    return Object.freeze([...values])
  }
  function validateResult(result: UiListResult<T>, query: UiListQuery<F, S>) {
    if (typeof result.complete !== 'boolean')
      throw new Error('List source must declare result completeness.')
    const values = validateItems(result.items)
    const page = result.pagination
    if (page?.kind !== query.pagination?.kind)
      throw new Error('Source pagination must match the request mode.')
    if (page) {
      positive(page.size, 'Result page size')
      if (page.size !== query.pagination?.size)
        throw new Error('Source changed the requested page size.')
      count(page.total, 'Result total')
      if (values.length > page.size)
        throw new Error('Source returned more than one requested page.')
      if (page.total !== undefined && page.total < values.length)
        throw new Error('Result total is smaller than the returned items.')
      if (page.kind === 'numbered') {
        positive(page.number, 'Result page number')
        if (page.total === undefined && typeof page.hasNext !== 'boolean')
          throw new Error('Unknown total requires hasNext.')
        if (result.complete && (page.number !== 1 || page.hasNext === true))
          throw new Error('Complete result cannot have other numbered pages.')
        if (page.total !== undefined) {
          if (page.number > Math.max(1, Math.ceil(page.total / page.size)))
            throw new Error('Source returned an out-of-range page.')
          if ((page.number - 1) * page.size + values.length > page.total)
            throw new Error('Source range exceeds its total.')
          if (
            page.hasNext !== undefined &&
            page.hasNext !== page.number * page.size < page.total
          )
            throw new Error('hasNext contradicts the total.')
        }
      } else {
        if (result.complete && (page.next !== null || (page.offset ?? 0) > 0))
          throw new Error('Complete result cannot have remaining cursor items.')
        if (
          query.pagination?.kind !== 'cursor' ||
          page.cursor !== query.pagination.cursor
        )
          throw new Error('Source cursor does not match its request.')
        if (page.next !== null && typeof page.next !== 'string')
          throw new Error('Cursor result must declare next or null completion.')
        if (
          page.previous !== undefined &&
          page.previous !== null &&
          typeof page.previous !== 'string'
        )
          throw new Error('Invalid previous cursor.')
        count(page.offset, 'Result offset')
        if (
          page.offset !== undefined &&
          page.total !== undefined &&
          page.offset + values.length > page.total
        )
          throw new Error('Source range exceeds its total.')
      }
      if (
        result.complete &&
        page.total !== undefined &&
        page.total !== values.length
      )
        throw new Error('Complete result must contain all matching items.')
    }
    const acceptedQuery = querySnapshot({
      ...query,
      pagination:
        page?.kind === 'numbered'
          ? { kind: 'numbered', number: page.number, size: page.size }
          : query.pagination,
    })
    return Object.freeze({
      items: values,
      complete: result.complete,
      pagination: page && Object.freeze({ ...page }),
      query: acceptedQuery,
    })
  }
  let revision = 0
  const generation = shallowRef(0)
  let abort: AbortController | undefined
  let failed: { query: UiListQuery<F, S>; append: boolean } | undefined
  let continuations = new Set<string | null>()
  function invalidateRead() {
    revision++
    abort?.abort()
    abort = undefined
  }
  async function read(
    query: UiListQuery<F, S>,
    append = false,
  ): Promise<boolean> {
    assertAlive()
    if (disabled()) return false
    invalidateRead()
    if (!append) generation.value++
    const version = revision
    const cancellation = new AbortController()
    abort = cancellation
    failed = undefined
    publish({
      query,
      activity: append ? 'appending' : state.result ? 'refreshing' : 'loading',
      error: null,
      failedRead: undefined,
    })
    try {
      const response = options.source(query, { signal: cancellation.signal })
      // A synchronous local projection finishes in this turn. Unconditionally
      // awaiting it exposes a loading frame to Vue, making retained editors
      // inert and triggering blur/codec normalization on every keystroke.
      const reply =
        response && 'then' in response && typeof response.then === 'function'
          ? await response
          : (response as UiListResult<T>)
      if (version !== revision || state.disposed) return false
      let result = validateResult(reply, query)
      if (accumulating && result.pagination?.kind === 'cursor') {
        const used = append ? new Set(continuations) : new Set<string | null>()
        used.add(result.pagination.cursor)
        if (result.pagination.next !== null && used.has(result.pagination.next))
          throw new Error('Cursor continuation repeated without progress.')
        if (append) {
          const accepted = new Map(items().map((item) => [keyOf(item), item]))
          const before = accepted.size
          for (const item of result.items) accepted.set(keyOf(item), item)
          if (accepted.size === before && result.pagination.next !== null)
            throw new Error('Cursor continuation made no item progress.')
          if (
            result.pagination.total !== undefined &&
            result.pagination.total < accepted.size
          )
            throw new Error('Accumulated items exceed the source total.')
          result = Object.freeze({
            ...result,
            items: Object.freeze([...accepted.values()]),
            complete:
              result.pagination.next === null &&
              (result.pagination.total === undefined
                ? config?.kind === 'cursor' && config.initialCursor == null
                : result.pagination.total === accepted.size),
          })
        } else
          result = Object.freeze({
            ...result,
            complete:
              result.pagination.next === null &&
              (result.pagination.total === undefined
                ? config?.kind === 'cursor' && config.initialCursor == null
                : result.pagination.total === result.items.length),
          })
        continuations = used
      } else continuations.clear()
      publish({
        result,
        activity: 'idle',
        error: null,
        failedRead: undefined,
        stale: false,
      })
      return true
    } catch (error) {
      if (version !== revision || state.disposed) return false
      failed = { query, append }
      publish({
        activity: 'idle',
        error: error ?? new Error('List source failed.'),
        failedRead: append
          ? 'append'
          : state.result
            ? 'replacement'
            : 'initial',
        stale: Boolean(state.result),
      })
      return false
    } finally {
      if (version === revision) abort = undefined
    }
  }
  async function refresh() {
    assertAlive()
    const query = accumulating
      ? querySnapshot({
          ...state.query,
          pagination: initialPagination(state.query.pagination?.size),
        })
      : state.query
    return read(query)
  }
  async function retry() {
    assertAlive()
    if (!failed || pending() || disabled()) return false
    return read(failed.query, failed.append)
  }
  async function setQuery(
    patch: Partial<Pick<UiListQuery<F, S>, 'filters' | 'sort'>>,
  ) {
    assertAlive()
    return read(
      querySnapshot({
        filters: patch.filters ?? state.query.filters,
        sort: patch.sort ?? state.query.sort,
        pagination: initialPagination(state.query.pagination?.size),
      }),
    )
  }
  function select(key: UiListKey, selected: boolean) {
    assertAlive()
    assertKey(key)
    if (!options.selection) throw new Error('List selection is not enabled.')
    if (disabled()) return false
    const item = find(key)
    if (
      selected &&
      (item === undefined ||
        options.itemDisabled?.(item) === true ||
        options.selectable?.(item) === false)
    )
      return false
    const keys = new Set(state.selectedKeys)
    if (selected === keys.has(key)) return false
    if (selected && options.selection === 'single') keys.clear()
    if (selected) keys.add(key)
    else keys.delete(key)
    publish({ selectedKeys: Object.freeze([...keys]) })
    return true
  }
  function applyConfirmed(change: UiListChange<T>) {
    assertAlive()
    const key = change.kind === 'upsert' ? keyOf(change.item) : change.key
    assertKey(key)
    const previous = state.result
    let result = previous
    const known = change.reconciliation !== 'unknown'
    if (change.reconciliation !== 'unknown') {
      count(change.reconciliation.total, 'Confirmed total')
      if (change.kind === 'upsert') {
        count(change.reconciliation.index, 'Insertion index')
        if (
          change.reconciliation.exclude &&
          change.reconciliation.index !== undefined
        )
          throw new Error(
            'Excluded items cannot also specify insertion placement.',
          )
      }
    }
    if (previous) {
      let values = [...previous.items]
      const oldIndex = values.findIndex((item) => keyOf(item) === key)
      const reconciliation = change.reconciliation
      if (change.kind === 'remove')
        values = values.filter((item) => keyOf(item) !== key)
      else if (reconciliation === 'unknown') {
        if (oldIndex !== -1) values[oldIndex] = change.item
      } else if (
        change.reconciliation !== 'unknown' &&
        change.reconciliation.exclude
      )
        values = values.filter((item) => keyOf(item) !== key)
      else {
        const index =
          (change.reconciliation !== 'unknown'
            ? change.reconciliation.index
            : undefined) ?? oldIndex
        if (index < 0)
          throw new Error('Known insertion requires an explicit index.')
        if (oldIndex !== -1) values.splice(oldIndex, 1)
        count(index, 'Insertion index')
        if (index > values.length)
          throw new Error('Insertion index exceeds accepted items.')
        values.splice(index, 0, change.item)
      }
      let page = previous.pagination && { ...previous.pagination }
      if (page) {
        if (reconciliation === 'unknown') {
          page.total = undefined
          if (page.kind === 'cursor') page.offset = undefined
        } else {
          count(reconciliation.total, 'Confirmed total')
          if (
            page.total !== undefined &&
            values.length !== previous.items.length &&
            reconciliation.total === undefined
          )
            throw new Error(
              'Membership changes require an authoritative total or unknown reconciliation.',
            )
          page.total = reconciliation.total ?? page.total
          if (page.kind === 'numbered' && page.total !== undefined)
            page.hasNext = page.number * page.size < page.total
          if (page.total !== undefined && page.total < values.length)
            throw new Error('Confirmed total is smaller than accepted items.')
        }
      }
      if (page && !accumulating && values.length > page.size)
        throw new Error(
          'Confirmed change exceeds the accepted page; use unknown reconciliation and refresh.',
        )
      result = Object.freeze({
        ...previous,
        items: validateItems(values),
        pagination: page && Object.freeze(page),
        complete:
          known &&
          previous.complete &&
          (page?.total === undefined || page.total === values.length),
      })
    }
    const interruptedQuery =
      pending() &&
      previous !== undefined &&
      !sameSnapshot(previous.query, state.query)
    invalidateRead()
    failed = undefined
    const outsideBounds =
      result?.pagination?.kind === 'numbered' &&
      result.pagination.total !== undefined &&
      result.pagination.number >
        Math.max(1, Math.ceil(result.pagination.total / result.pagination.size))
    publish({
      result,
      activity: 'idle',
      error: null,
      failedRead: undefined,
      stale:
        !known || !previous || state.stale || interruptedQuery || outsideBounds,
      ...(change.kind === 'remove'
        ? {
            selectedKeys: Object.freeze(
              state.selectedKeys.filter((candidate) => candidate !== key),
            ),
          }
        : {}),
    })
  }
  type Action = 'create' | 'update' | 'remove' | 'activate'
  const actions = shallowRef(
    new Map<
      UiListKey,
      { kind: Action; pending: boolean; error: unknown | null }
    >(),
  )
  function setAction(
    key: UiListKey,
    value: { kind: Action; pending: boolean; error: unknown | null },
  ) {
    actions.value = new Map(actions.value).set(key, value)
  }
  async function mutate(
    kind: 'create' | 'update' | 'remove' | 'activate',
    key: UiListKey,
    item?: T,
  ) {
    assertAlive()
    const operation = options[kind]
    if (!operation) throw new Error(`List ${kind} operation is not configured.`)
    if (disabled() || actions.value.get(key)?.pending) return false
    const accepted = find(key)
    if (
      kind !== 'create' &&
      (accepted === undefined || options.itemDisabled?.(accepted))
    )
      return false
    if (kind === 'remove' && options.removable?.(accepted!) === false)
      return false
    if (kind === 'activate' && options.activatable?.(accepted!) === false)
      return false
    const mutationQuery = state.result?.query
    setAction(key, { kind, pending: true, error: null })
    try {
      if (kind === 'activate') await options.activate!(accepted!)
      else {
        const change =
          kind === 'create'
            ? await options.create!(item!)
            : kind === 'update'
              ? await options.update!(key, item!)
              : await options.remove!(key)
        if (state.disposed) return false
        if (
          kind === 'remove' &&
          (change.kind !== 'remove' || change.key !== key)
        )
          throw new Error('Remove result must confirm the requested key.')
        if (
          kind === 'update' &&
          (change.kind !== 'upsert' || keyOf(change.item) !== key)
        )
          throw new Error('Update result must preserve item identity.')
        // Placement/count knowledge belongs to the query active at dispatch.
        // A later query must not inherit reconciliation for a different window.
        applyConfirmed(
          sameSnapshot(mutationQuery, state.result?.query)
            ? change
            : { ...change, reconciliation: 'unknown' },
        )
      }
      if (state.disposed) return false
      setAction(key, { kind, pending: false, error: null })
      return true
    } catch (error) {
      if (!state.disposed)
        setAction(key, {
          kind,
          pending: false,
          error: error ?? new Error('List operation failed.'),
        })
      return false
    }
  }
  const contexts = new Map<UiListKey, UiListItemContext<T>>()
  function context(key: UiListKey) {
    assertKey(key)
    const cached = contexts.get(key)
    if (cached) return cached
    function button(kind: 'remove' | 'activate'): UiButtonBinding | undefined {
      if (!options[kind]) return undefined
      const binding: UiButtonBinding = Object.freeze({
        target: 'button',
        type: 'button',
        get disabled() {
          const item = find(key)
          return (
            disabled() ||
            actions.value.get(key)?.pending === true ||
            item === undefined ||
            options.itemDisabled?.(item) === true ||
            (kind === 'remove'
              ? options.removable?.(item)
              : options.activatable?.(item)) === false
          )
        },
        get loading() {
          const action = actions.value.get(key)
          return (
            !state.disposed && action?.pending === true && action.kind === kind
          )
        },
        async activate() {
          if (!binding.disabled) await mutate(kind, key)
        },
      })
      return binding
    }
    const value: UiListItemContext<T> = Object.freeze({
      key,
      get item() {
        return find(key)
      },
      get selected() {
        return state.selectedKeys.includes(key)
      },
      get selectable() {
        const item = find(key)
        return (
          !disabled() &&
          Boolean(options.selection) &&
          item !== undefined &&
          options.itemDisabled?.(item) !== true &&
          options.selectable?.(item) !== false
        )
      },
      get disabled() {
        const item = find(key)
        return (
          disabled() ||
          item === undefined ||
          options.itemDisabled?.(item) === true
        )
      },
      get pending() {
        return !state.disposed && actions.value.get(key)?.pending === true
      },
      get error() {
        return actions.value.get(key)?.error ?? null
      },
      bindings: Object.freeze({
        removeButton: button('remove'),
        activateButton: button('activate'),
      }),
      requestSelected(selected: boolean) {
        if (value.selectable) select(key, selected)
      },
    })
    if (!state.disposed) contexts.set(key, value)
    return value
  }
  const acceptedPage = () => state.result?.pagination
  function hasNext() {
    const page = acceptedPage()
    if (!page) return false
    return page.kind === 'cursor'
      ? page.next !== null
      : page.total === undefined
        ? page.hasNext === true
        : page.number * page.size < page.total
  }
  const navigationReady = () => !disabled() && !pending() && !state.stale
  async function next() {
    if (!navigationReady() || !hasNext()) return false
    const page = acceptedPage()!
    const pagination: UiListQuery['pagination'] =
      page.kind === 'numbered'
        ? { kind: 'numbered', number: page.number + 1, size: page.size }
        : { kind: 'cursor', cursor: page.next, size: page.size }
    return read(
      querySnapshot({ ...state.result!.query, pagination }),
      accumulating,
    )
  }
  const paginator: UiPaginatorBinding | undefined =
    config &&
    Object.freeze({
      target: 'paginator' as const,
      kind: config.kind,
      get requested() {
        return state.query.pagination!
      },
      get accepted() {
        return acceptedPage()
      },
      get total() {
        return acceptedPage()?.total
      },
      get pageCount() {
        const page = acceptedPage()
        return page?.kind === 'numbered' && page.total !== undefined
          ? Math.ceil(page.total / page.size)
          : undefined
      },
      get range() {
        const page = acceptedPage()
        if (!page || accumulating) return undefined
        const offset =
          page.kind === 'numbered' ? (page.number - 1) * page.size : page.offset
        if (
          offset !== undefined &&
          (!Number.isSafeInteger(offset) ||
            !Number.isSafeInteger(offset + items().length))
        )
          return undefined
        return offset === undefined
          ? undefined
          : Object.freeze({
              start: items().length ? offset + 1 : 0,
              end: items().length ? offset + items().length : 0,
            })
      },
      pageSizes: Object.freeze([...(config.pageSizes ?? [])]),
      get pending() {
        return pending()
      },
      get disabled() {
        return disabled()
      },
      get error() {
        return state.error
      },
      get canNext() {
        return navigationReady() && hasNext()
      },
      get canPrevious() {
        const page = acceptedPage()
        return (
          navigationReady() &&
          !accumulating &&
          Boolean(
            page &&
              (page.kind === 'numbered'
                ? page.number > 1
                : page.previous !== undefined),
          )
        )
      },
      get canFirst() {
        return (
          !disabled() && (state.result !== undefined || state.error !== null)
        )
      },
      get canJump() {
        return !disabled() && config.kind === 'numbered' && config.canJump
      },
      get canChangeSize() {
        return !disabled() && Boolean(config.pageSizes?.length)
      },
      next,
      async previous() {
        if (!paginator!.canPrevious) return false
        const page = acceptedPage()!
        const pagination: UiListQuery['pagination'] =
          page.kind === 'numbered'
            ? { kind: 'numbered', number: page.number - 1, size: page.size }
            : { kind: 'cursor', cursor: page.previous!, size: page.size }
        return read(querySnapshot({ ...state.result!.query, pagination }))
      },
      async first() {
        if (!paginator!.canFirst) return false
        return read(
          querySnapshot({
            ...state.query,
            pagination: initialPagination(state.query.pagination?.size),
          }),
        )
      },
      async goTo(number: number) {
        assertAlive()
        if (config.kind !== 'numbered' || !config.canJump)
          throw new Error('Source does not support page jumps.')
        positive(number, 'Page number')
        if (
          paginator!.pageCount !== undefined &&
          number > Math.max(1, paginator!.pageCount)
        )
          throw new Error('Requested page exceeds known bounds.')
        return read(
          querySnapshot({
            ...state.query,
            pagination: {
              kind: 'numbered',
              number,
              size: state.query.pagination!.size,
            },
          }),
        )
      },
      async setPageSize(size: number) {
        assertAlive()
        positive(size, 'Page size')
        if (!config.pageSizes?.includes(size))
          throw new Error('Page size is not supported.')
        return read(
          querySnapshot({
            ...state.query,
            pagination: initialPagination(size),
          }),
        )
      },
      async retry() {
        return state.disposed ? false : retry()
      },
    })
  const list: UiListBinding<T, F, S> = Object.freeze({
    target: 'list',
    sorting,
    continuation: accumulating ? 'accumulate' : 'none',
    get generation() {
      return generation.value
    },
    state,
    get items() {
      return items()
    },
    selection: options.selection ?? 'none',
    get disabled() {
      return disabled()
    },
    get canLoadMore() {
      return (
        accumulating && navigationReady() && state.error === null && hasNext()
      )
    },
    get hasMore() {
      return accumulating && hasNext()
    },
    get canRetry() {
      return !disabled() && !pending() && Boolean(failed)
    },
    itemKey: keyOf,
    context,
    async setQuery(
      patch: Partial<Pick<UiListQuery<F, S>, 'filters' | 'sort'>>,
    ) {
      return state.disposed ? false : setQuery(patch)
    },
    selectPage(selected: boolean) {
      if (state.disposed || disabled()) return
      if (options.selection !== 'multiple')
        throw new Error('Page selection requires multiple selection.')
      const keys = new Set(state.selectedKeys)
      for (const item of items()) {
        if (
          options.itemDisabled?.(item) ||
          options.selectable?.(item) === false
        )
          continue
        if (selected) keys.add(keyOf(item))
        else keys.delete(keyOf(item))
      }
      publish({ selectedKeys: Object.freeze([...keys]) })
    },
    async retry() {
      return state.disposed ? false : retry()
    },
    async loadMore() {
      return list.canLoadMore ? next() : false
    },
  })
  return Object.freeze({
    state,
    get hasColumnSort() {
      return !state.disposed && hasColumnPresentation(list, 'sort')
    },
    get hasColumnFilter() {
      return !state.disposed && hasColumnPresentation(list, 'filter')
    },
    bindings: Object.freeze({ list, paginator }),
    pagination: paginator,
    refresh,
    retry,
    setQuery,
    select,
    applyConfirmed,
    clearSelection() {
      assertAlive()
      if (!disabled()) publish({ selectedKeys: Object.freeze([]) })
    },
    create: (item: T) => mutate('create', keyOf(item), item),
    update: (key: UiListKey, item: T) => mutate('update', key, item),
    remove: (key: UiListKey) => mutate('remove', key),
    dispose() {
      if (state.disposed) return
      invalidateRead()
      failed = undefined
      continuations.clear()
      contexts.clear()
      actions.value = new Map()
      publish({ disposed: true, activity: 'idle' })
    },
  })
}
