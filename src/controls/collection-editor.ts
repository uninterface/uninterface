import { effectScope, shallowReactive, toRaw, watch } from 'vue'
import type { UiButtonBinding } from '../bindings/button'
import type {
  UiListBinding,
  UiListItemContext,
  UiListKey,
  UiListQuery,
  UiListResult,
} from '../bindings/list'
import type { UiCollectionSummarySource } from '../collection/summary'
import { collectionEditorSessions } from '../collection/editor-protocol'
import { hasColumnPresentation } from '../table/presentation'
import {
  createUiListControl,
  type UiListControl,
  type UiListOptions,
} from './list'
import type { UiListValueControl, UiListValueEditor } from './list-value'

export interface UiCollectionEditorOptions<
  T,
  E extends UiListValueEditor<T>,
  F = Record<string, unknown>,
  S extends string = string,
> {
  value: UiListValueControl<T, E>
  createItem?: () => T | Promise<T>
  disabled?: () => boolean
  /** A synchronous local view of the complete owned draft, never a remote read. */
  presentation?: Pick<
    UiListOptions<T, F, S>,
    'query' | 'sorting' | 'pagination'
  > & {
    project(items: readonly T[], query: UiListQuery<F, S>): UiListResult<T>
  }
}

export interface UiCollectionEditorRow<T, E extends UiListValueEditor<T>> {
  readonly key: UiListKey
  readonly item: T | undefined
  readonly editor: E | undefined
  readonly bindings: { readonly removeButton: UiButtonBinding }
}

export interface UiCollectionEditorControl<
  T,
  E extends UiListValueEditor<T>,
  F = Record<string, unknown>,
  S extends string = string,
> {
  readonly value: UiListValueControl<T, E>
  /** Owned projection; borrowers may change its query, but must not dispose it. */
  readonly list: Pick<
    UiListControl<T, F, S>,
    | 'state'
    | 'bindings'
    | 'pagination'
    | 'hasColumnSort'
    | 'hasColumnFilter'
    | 'setQuery'
    | 'refresh'
    | 'retry'
  >
  readonly bindings: {
    readonly list: UiListBinding<T, F, S>
    readonly addButton: UiButtonBinding | undefined
  }
  readonly state: {
    readonly pending: boolean
    readonly adding: boolean
    readonly error: unknown | null
    readonly disposed: boolean
  }
  readonly summarySource: UiCollectionSummarySource<T>
  row(key: UiListKey): UiCollectionEditorRow<T, E>
  add(): Promise<boolean>
  remove(key: UiListKey): Promise<boolean>
  /** Ends coordination and the projection, without disposing the borrowed value. */
  dispose(): void
}

export function createUiCollectionEditorControl<
  T,
  E extends UiListValueEditor<T>,
  F = Record<string, unknown>,
  S extends string = string,
>(
  options: UiCollectionEditorOptions<T, E, F, S>,
): UiCollectionEditorControl<T, E, F, S> {
  const value = toRaw(options.value)
  const effects = effectScope(true)
  const operation = shallowReactive({
    pending: false,
    adding: false,
    key: undefined as UiListKey | undefined,
    error: null as unknown | null,
    disposed: false,
  })
  const session: {
    origin?: import('../collection/editor-protocol').EditorActionOrigin
  } = {}
  let generation = 0
  let projectedRevision = -1
  let activeOrigin: typeof session.origin
  let interrupted = false
  const ended = () => operation.disposed || value.state.disposed
  const restricted = () =>
    ended() ||
    value.field.state.effectiveDisabled ||
    Boolean(options.disabled?.())
  const disabled = () => restricted() || operation.pending
  const list = createUiListControl<T, F, S>({
    ...options.presentation,
    query: options.presentation?.query ?? { filters: {} as F, sort: [] },
    itemKey: value.itemKey,
    disabled: restricted,
    source: (query) => {
      const revision = value.state.revision
      const items = value.state.items
      const result = options.presentation
        ? options.presentation.project(value.state.items, query)
        : { items, complete: true }
      const allowed = new Set(items)
      if (result.items.some((item) => !allowed.has(item)))
        throw new Error(
          'Collection editor projections must return supplied draft items unchanged.',
        )
      projectedRevision = revision
      return result
    },
  })
  const rows = new Map<UiListKey, UiCollectionEditorRow<T, E>>()
  const contexts = new WeakMap<
    UiCollectionEditorRow<T, E>,
    UiListItemContext<T>
  >()
  function row(key: UiListKey): UiCollectionEditorRow<T, E> {
    const editor = value.findEditor(key)
    const cached = rows.get(key)
    if (cached && cached.editor === editor) return cached
    const current = () =>
      !ended() && editor !== undefined && value.findEditor(key) === editor
    const removeButton: UiButtonBinding = Object.freeze({
      target: 'button',
      type: 'button',
      get disabled() {
        return disabled() || !current()
      },
      get loading() {
        return current() && operation.pending && operation.key === key
      },
      async activate() {
        if (!removeButton.disabled) await remove(key)
      },
    })
    const result: UiCollectionEditorRow<T, E> = Object.freeze({
      key,
      get item() {
        return current()
          ? value.state.items.find((item) => value.itemKey(item) === key)
          : undefined
      },
      get editor() {
        return current() ? editor : undefined
      },
      bindings: Object.freeze({ removeButton }),
    })
    if (!ended()) rows.set(key, result)
    return result
  }
  const listBinding: UiListBinding<T, F, S> = Object.freeze(
    Object.create(list.bindings.list, {
      disabled: { get: disabled },
      context: {
        value(key: UiListKey) {
          const target = row(key)
          let context = contexts.get(target)
          if (!context) {
            const original = list.bindings.list.context(key)
            context = Object.freeze(
              Object.create(original, {
                bindings: { value: target.bindings },
                disabled: { get: () => target.bindings.removeButton.disabled },
                pending: { get: () => target.bindings.removeButton.loading },
                error: {
                  get: () => (operation.key === key ? operation.error : null),
                },
              }),
            ) as UiListItemContext<T>
            contexts.set(target, context)
          }
          return context
        },
      },
    }),
  )

  async function run(key?: UiListKey) {
    if (disabled() || (key !== undefined && !value.findEditor(key)))
      return false
    if (key === undefined && !options.createItem) return false
    const request = ++generation
    const draft = value.field.state.revision
    const origin = session.origin
    if (origin) origin.consumed = true
    activeOrigin = origin
    interrupted = false
    operation.pending = true
    operation.adding = key === undefined
    operation.key = key
    operation.error = null
    try {
      let addedKey: UiListKey | undefined
      let changed: boolean
      if (key === undefined) {
        const created = options.createItem!()
        const item =
          created && typeof (created as PromiseLike<T>).then === 'function'
            ? await created
            : (created as T)
        if (
          restricted() ||
          interrupted ||
          request !== generation ||
          draft !== value.field.state.revision
        )
          return false
        addedKey = value.itemKey(item)
        changed = await value.insert(item)
      } else changed = await value.remove(key)
      if (ended() || request !== generation || !changed) return false
      // Refresh is synchronous for the owned local source. A pending form lock
      // defers it to the watcher; it must never create a transient loading mask.
      if (!restricted() && projectedRevision !== value.state.revision)
        await list.refresh()
      if (addedKey !== undefined && !restricted() && !interrupted) {
        const revision = value.field.state.revision
        try {
          await origin?.added(
            addedKey,
            () =>
              !restricted() &&
              !interrupted &&
              request === generation &&
              revision === value.field.state.revision,
          )
        } catch (error) {
          // The draft was inserted successfully. A reveal/focus failure must
          // not report that insertion failed or invite a duplicate retry.
          if (!ended() && request === generation) operation.error = error
        }
      }
      return !ended() && request === generation
    } catch (error) {
      if (!ended() && request === generation)
        operation.error = error ?? new Error('Collection editing failed.')
      return false
    } finally {
      origin?.cancel()
      if (activeOrigin === origin) activeOrigin = undefined
      if (!operation.disposed && request === generation) {
        operation.pending = false
        operation.adding = false
      }
    }
  }
  const add = () => run()
  const remove = (key: UiListKey) => run(key)
  const addButton: UiButtonBinding | undefined =
    options.createItem &&
    Object.freeze({
      target: 'button' as const,
      type: 'button' as const,
      get disabled() {
        return disabled()
      },
      get loading() {
        return !ended() && operation.adding
      },
      async activate() {
        await add()
      },
    })
  function dispose() {
    if (operation.disposed) return
    operation.disposed = true
    generation++
    effects.stop()
    list.dispose()
    rows.clear()
    activeOrigin?.cancel()
    activeOrigin = undefined
    session.origin = undefined
  }
  const control: UiCollectionEditorControl<T, E, F, S> = Object.freeze({
    value,
    list: Object.freeze({
      state: list.state,
      bindings: Object.freeze({
        list: listBinding,
        paginator: list.bindings.paginator,
      }),
      pagination: list.pagination,
      get hasColumnSort() {
        return !ended() && hasColumnPresentation(listBinding, 'sort')
      },
      get hasColumnFilter() {
        return !ended() && hasColumnPresentation(listBinding, 'filter')
      },
      setQuery: list.setQuery,
      refresh: list.refresh,
      retry: list.retry,
    }),
    bindings: Object.freeze({ list: listBinding, addButton }),
    state: Object.freeze({
      get pending() {
        return !ended() && operation.pending
      },
      get adding() {
        return !ended() && operation.adding
      },
      get error() {
        return operation.error
      },
      get disposed() {
        return ended()
      },
    }),
    get summarySource() {
      const items = value.state.items
      return {
        scope: 'all' as const,
        coverage: 'complete' as const,
        status:
          value.state.stale ||
          value.state.pending ||
          value.state.invalidKeys.length
            ? ('stale' as const)
            : ('ready' as const),
        records: () => items[Symbol.iterator](),
      }
    },
    row,
    add,
    remove,
    dispose,
  })
  collectionEditorSessions.set(control, session)
  try {
    effects.run(() =>
      watch(
        () => [value.state.revision, restricted()] as const,
        () => {
          if (restricted() && operation.pending) interrupted = true
          if (value.state.disposed) {
            dispose()
            return
          }
          const keys = new Set(value.state.items.map(value.itemKey))
          for (const key of rows.keys()) if (!keys.has(key)) rows.delete(key)
          if (!restricted() && projectedRevision !== value.state.revision)
            void list.refresh()
        },
        { flush: 'sync' },
      ),
    )
    void list.refresh()
  } catch (error) {
    dispose()
    throw error
  }
  return control
}
