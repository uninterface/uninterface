import { effectScope, shallowRef, watch, type Component } from 'vue'

/** Usage is extensible without requiring editors to recognize every custom host. */
export interface UiFilterPresentationContext {
  readonly usage:
    | 'table-column'
    | 'filter-row'
    | 'filter-form'
    | 'filter-badge'
    | (string & {})
  readonly container: 'inline' | 'popover' | 'panel' | 'dialog'
  readonly labelProvided: boolean
  readonly summaryProvided: boolean
  readonly arrangement: 'single-row' | 'stacked'
  /** Group submission is intentionally not advertised before transactions exist. */
  readonly submission: 'individual'
}
export interface UiFilterSummary {
  /** Applied-value description; hosts supply the criterion label separately. */
  readonly text: string
  readonly items?: readonly { readonly key: string; readonly text: string }[]
}
export type UiFilterEditingPolicy =
  | { readonly commit: 'explicit' }
  | { readonly commit: 'live'; readonly debounceMs?: number }
export type UiFilterCommitResult =
  | 'committed'
  | 'unchanged'
  | 'invalid'
  | 'unavailable'
  | 'superseded'
export interface UiFilterEditorContext<V> {
  readonly initialValue: V
  /** Notify real draft edits, never initialization or external synchronization. */
  changed(): void
}
export interface UiFilterEditorInstance<V> {
  readonly view: Component
  readonly dirty: boolean
  readonly validating: boolean
  validate(): Promise<{ valid: true; value: V } | { valid: false }>
  replace(value: V): void
  dispose(): void
}
export interface UiCollectionFilterDefinition<F, V> {
  readonly key: string
  label(): string
  readonly fieldKeys?: readonly string[]
  read(filters: Readonly<F>): V
  write(filters: Readonly<F>, value: V): F
  equals(a: V, b: V): boolean
  isActive(value: V): boolean
  clear?(filters: Readonly<F>): F
  summarize(value: V): UiFilterSummary
  removeSummaryItem?(filters: Readonly<F>, key: string): F
  available?(): boolean
  disabled?(): boolean
  readonly editing: UiFilterEditingPolicy
  createEditor(context: UiFilterEditorContext<V>): UiFilterEditorInstance<V>
}
/** Commit is synchronous query acceptance, never remote read completion. */
export interface UiCollectionFilterSource<F> {
  read(): Readonly<F>
  update(transform: (current: Readonly<F>) => F): boolean
  disabled?(): boolean
}
export interface UiCollectionFilterBinding {
  readonly target: 'collection-filter'
  readonly key: string
  readonly label: string
  readonly fieldKeys: readonly string[]
  readonly active: boolean
  readonly available: boolean
  readonly disabled: boolean
  readonly dirty: boolean
  readonly validating: boolean
  readonly error: unknown
  readonly summary: UiFilterSummary
  readonly canClear: boolean
  readonly canRemoveSummaryItem: boolean
  readonly editing: UiFilterEditingPolicy
  commit(): Promise<UiFilterCommitResult>
  clear(): UiFilterCommitResult
  removeSummaryItem(key: string): UiFilterCommitResult
  discard(): void
}
export interface UiCollectionFilterControl {
  readonly binding: UiCollectionFilterBinding
  dispose(): void
}

// A view borrows one editor; summaries and triggers do not claim it.
interface InternalFilter {
  view: Component
  claim(owner: symbol): () => void
}
const internals = new WeakMap<UiCollectionFilterBinding, InternalFilter>()
export function filterInternals(
  binding: UiCollectionFilterBinding,
): InternalFilter {
  const value = internals.get(binding)
  if (!value)
    throw new Error('UiCollectionFilter requires a factory-created binding.')
  return value
}

/** Create once in the business owner, independently of mounted filter views. */
export function createUiCollectionFilter<F, V>(
  definition: UiCollectionFilterDefinition<F, V>,
  source: UiCollectionFilterSource<F>,
): UiCollectionFilterControl {
  if (!definition.key.trim()) throw new Error('A filter needs a nonempty key.')
  const policy = Object.freeze({ ...definition.editing })
  if (!['explicit', 'live'].includes(policy.commit))
    throw new Error('Unsupported filter commit policy.')
  if (
    policy.commit === 'live' &&
    policy.debounceMs !== undefined &&
    (!Number.isFinite(policy.debounceMs) || policy.debounceMs < 0)
  )
    throw new Error('Filter debounce must be finite and nonnegative.')
  const scope = effectScope(true)
  const disposed = shallowRef(false)
  const error = shallowRef<unknown>(null)
  let version = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let synchronizing = false
  let publishing = false
  let current = definition.read(source.read())
  let owner: symbol | undefined
  let pending:
    | { version: number; promise: Promise<UiFilterCommitResult> }
    | undefined
  let editor!: UiFilterEditorInstance<V>
  const available = () => !disposed.value && (definition.available?.() ?? true)
  const disabled = () =>
    !available() || Boolean(source.disabled?.() || definition.disabled?.())
  function invalidate() {
    version++
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    pending = undefined
  }
  function replace(value: V) {
    synchronizing = true
    try {
      editor.replace(value)
    } finally {
      synchronizing = false
    }
  }
  function synchronize() {
    if (disposed.value) return
    const next = definition.read(source.read())
    if (definition.equals(next, current)) return
    current = next
    if (!publishing) {
      invalidate()
      error.value = null
      replace(next)
    }
  }
  function publish(
    transform: (filters: Readonly<F>) => F,
  ): UiFilterCommitResult {
    if (disabled()) return 'unavailable'
    let changed = false
    publishing = true
    let accepted: boolean
    try {
      accepted = source.update((latest) => {
        const next = transform(latest)
        changed = !definition.equals(
          definition.read(latest),
          definition.read(next),
        )
        return changed ? next : (latest as F)
      })
    } finally {
      publishing = false
    }
    if (!accepted) return 'unavailable'
    current = definition.read(source.read())
    replace(current)
    return changed ? 'committed' : 'unchanged'
  }
  function commit(): Promise<UiFilterCommitResult> {
    synchronize()
    if (disabled()) return Promise.resolve('unavailable')
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
    if (pending?.version === version) return pending.promise
    const revision = version
    error.value = null
    const promise = Promise.resolve().then(
      async (): Promise<UiFilterCommitResult> => {
        try {
          if (revision !== version || disposed.value) return 'superseded'
          if (disabled()) return 'unavailable'
          const result = await editor.validate()
          synchronize()
          if (revision !== version || disposed.value) return 'superseded'
          if (disabled()) return 'unavailable'
          if (!result.valid) return 'invalid'
          return publish((latest) => definition.write(latest, result.value))
        } catch (cause) {
          if (revision !== version || disposed.value) return 'superseded'
          error.value = cause
          throw cause
        } finally {
          if (pending?.version === revision) pending = undefined
        }
      },
    )
    pending = { version: revision, promise }
    return promise
  }
  function changed() {
    if (synchronizing || disposed.value) return
    invalidate()
    error.value = null
    if (policy.commit !== 'live' || disabled()) return
    const revision = version
    const run = () => {
      timer = undefined
      if (revision !== version || disposed.value) return
      // Errors are observable; background live work has no awaiting event caller.
      void commit().catch(() => {})
    }
    if (policy.debounceMs) timer = setTimeout(run, policy.debounceMs)
    else queueMicrotask(run)
  }
  function discard() {
    if (disposed.value) return
    invalidate()
    error.value = null
    current = definition.read(source.read())
    replace(current)
  }
  try {
    scope.run(() => {
      editor = definition.createEditor({ initialValue: current, changed })
      watch(() => definition.read(source.read()), synchronize, {
        flush: 'sync',
      })
      watch(
        disabled,
        (value) => {
          if (value) invalidate()
        },
        { flush: 'sync' },
      )
    })
  } catch (cause) {
    scope.stop()
    editor?.dispose()
    throw cause
  }
  const binding: UiCollectionFilterBinding = Object.freeze({
    target: 'collection-filter' as const,
    key: definition.key,
    fieldKeys: Object.freeze([...(definition.fieldKeys ?? [])]),
    editing: policy,
    get label() {
      return definition.label()
    },
    get active() {
      return definition.isActive(definition.read(source.read()))
    },
    get available() {
      return available()
    },
    get disabled() {
      return disabled()
    },
    get dirty() {
      return editor.dirty
    },
    get validating() {
      return editor.validating
    },
    get error() {
      return error.value
    },
    get summary() {
      return definition.summarize(definition.read(source.read()))
    },
    get canClear() {
      return (
        !disabled() &&
        Boolean(definition.clear) &&
        (definition.isActive(definition.read(source.read())) || editor.dirty)
      )
    },
    get canRemoveSummaryItem() {
      return !disabled() && Boolean(definition.removeSummaryItem)
    },
    commit,
    clear() {
      if (!binding.canClear || !definition.clear) return 'unavailable'
      invalidate()
      error.value = null
      return publish(definition.clear)
    },
    removeSummaryItem(key: string) {
      if (
        !binding.canRemoveSummaryItem ||
        !definition.removeSummaryItem ||
        !binding.summary.items?.some((item) => item.key === key)
      )
        return 'unavailable'
      invalidate()
      error.value = null
      return publish((latest) => definition.removeSummaryItem!(latest, key))
    },
    discard,
  })
  internals.set(binding, {
    view: editor.view,
    claim(next) {
      if (disposed.value) throw new Error('Filter has been disposed.')
      if (owner && owner !== next)
        throw new Error(`Filter "${binding.key}" already has an editor view.`)
      owner = next
      return () => {
        if (owner === next) owner = undefined
      }
    },
  })
  return Object.freeze({
    binding,
    dispose() {
      if (disposed.value) return
      disposed.value = true
      invalidate()
      scope.stop()
      editor.dispose()
    },
  })
}

/** Private factory composition: enriched bindings borrow exactly the original session. */
export function extendFilterControl<E extends object>(
  control: UiCollectionFilterControl,
  extension: E,
) {
  const binding = Object.freeze(
    Object.defineProperties(
      Object.create(Object.getPrototypeOf(control.binding)),
      {
        ...Object.getOwnPropertyDescriptors(control.binding),
        ...Object.getOwnPropertyDescriptors(extension),
      },
    ),
  ) as UiCollectionFilterBinding & E
  internals.set(binding, filterInternals(control.binding))
  return Object.freeze({ binding, dispose: control.dispose })
}
