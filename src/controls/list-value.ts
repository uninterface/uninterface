import { computed, effectScope, shallowRef, toRaw, watch } from 'vue'
import {
  createUiFieldControl,
  fieldValidation,
  type PreparedFieldValue,
  type UiFieldControl,
} from './field'
import { claimFormFields, isFieldClaimed } from './form-fields'
import { copy, uiDefaultInputEquals } from './value'
import type { UiListKey } from '../bindings/list'
import type { UiParseResult } from './codec'

export interface UiListValueEditor<T> {
  readonly field: UiFieldControl<T, any>
  dispose(): void
}
export interface UiListValueOptions<T, E extends UiListValueEditor<T>> {
  initialValue: readonly T[]
  itemKey(item: T): UiListKey
  /** Return a fresh, exclusively owned record editor. Do not persist here. */
  createEditor(item: T): E
  /** Refresh typed rows on edits (default), or after explicit child validation. */
  projection?: 'change' | 'validate'
}
export interface UiListValueControl<
  T,
  E extends UiListValueEditor<T> = UiListValueEditor<T>,
> {
  readonly field: UiFieldControl<readonly T[]>
  readonly state: {
    /** Full order using last successfully parsed values, including hidden items. */
    readonly items: readonly T[]
    readonly revision: number
    readonly pending: boolean
    /** At least one raw draft is not represented by its last successful projection. */
    readonly stale: boolean
    readonly invalidKeys: readonly UiListKey[]
    readonly firstInvalidKey: UiListKey | undefined
    readonly disposed: boolean
  }
  editor(key: UiListKey): E
  /** The value owner's identity rule, shared by borrowing projections. */
  itemKey(item: T): UiListKey
  /** Safe lookup for a view finishing a render after membership changed. */
  findEditor(key: UiListKey): E | undefined
  insert(item: T, options?: { before?: UiListKey }): Promise<boolean>
  remove(key: UiListKey): Promise<boolean>
  replace(
    key: UiListKey,
    item: T,
    options?: { discardDraft?: boolean },
  ): Promise<boolean>
  move(key: UiListKey, options?: { before?: UiListKey }): Promise<boolean>
  revealInvalid(
    reveal: (key: UiListKey) => Promise<void>,
    focus: (editor: E, key: UiListKey) => boolean | Promise<boolean>,
  ): Promise<boolean>
  dispose(): void
}

/** Full draft ownership is independent of any filtered/paged presentation. */
export function createUiListValueControl<
  T,
  E extends UiListValueEditor<T> = UiListValueEditor<T>,
>(options: UiListValueOptions<T, E>): UiListValueControl<T, E> {
  type Entry = {
    editor: E
    value: T
    revision: number
    pending: boolean
    invalid: boolean
    stale: boolean
    stop(): void
    release(): void
    unlock?: () => void
    disposed: boolean
  }
  const entries = new Map<UiListKey, Entry>()
  const projection = options.projection ?? 'change'
  const effects = effectScope(true)
  const version = shallowRef(0)
  const disposed = shallowRef(false)
  let synchronizing = false
  let operation: 'membership' | 'replace' | undefined
  let replacement: UiListKey | undefined
  let revealRevision = 0
  const touch = () => {
    version.value++
  }
  const issue = (
    key: 'listValueChanged' | 'listValueIdentity' | 'listValueInvalid',
  ) => ({ namespace: 'uninterface', key })
  function alive() {
    if (disposed.value) throw new Error('List value control has been disposed.')
  }
  function keyOf(item: T): UiListKey {
    const key = options.itemKey(item)
    if (
      (typeof key !== 'string' || !key.length) &&
      (typeof key !== 'number' || !Number.isFinite(key))
    )
      throw new Error(
        'Collection keys must be nonempty strings or finite numbers.',
      )
    return key
  }
  function keysOf(values: readonly T[]) {
    if (!Array.isArray(values))
      throw new Error('Collection value must be an array.')
    const keys = values.map(keyOf)
    if (new Set(keys).size !== keys.length)
      throw new Error('Duplicate collection key.')
    return keys
  }
  keysOf(options.initialValue)
  async function parse(
    snapshot: readonly T[],
    publish: boolean,
  ): Promise<UiParseResult<readonly T[]>> {
    const keys = keysOf(snapshot)
    const rows = keys.map((key) => entries.get(key))
    if (disposed.value || rows.some((row) => !row))
      return { ok: false, issue: issue('listValueChanged') }
    const revision = field.state.revision
    const results = await Promise.all(
      rows.map(async (row) => {
        const child = row!.editor.field
        if (publish) return fieldValidation(child).validateDraft()
        const revision = child.state.revision
        const result = await child.read()
        return {
          result,
          isCurrent: () => !row!.disposed && revision === child.state.revision,
        }
      }),
    )
    if (
      disposed.value ||
      revision !== field.state.revision ||
      rows.some((row) => row!.disposed) ||
      results.some((result) => !result?.isCurrent())
    )
      return { ok: false, issue: issue('listValueChanged') }
    const values: T[] = []
    let failed = false
    results.forEach((snapshot, index) => {
      const result = snapshot!.result
      if (!result.ok || keyOf(result.value as T) !== keys[index]) {
        failed = true
        if (publish) {
          rows[index]!.invalid = true
          rows[index]!.stale = true
        }
      } else {
        values.push(copy(result.value as T))
        if (publish) {
          rows[index]!.value = copy(result.value as T)
          rows[index]!.invalid = false
          rows[index]!.stale = false
        }
      }
      if (publish) {
        rows[index]!.revision++
        rows[index]!.pending = false
      }
    })
    if (publish) touch()
    return failed
      ? { ok: false, issue: issue('listValueInvalid') }
      : { ok: true, value: values }
  }
  const field = createUiFieldControl<readonly T[]>(
    options.initialValue,
    {
      format: (value) => {
        keysOf(value)
        return copy(value)
      },
      parse: (snapshot) => parse(snapshot, false),
    },
    [],
    { revalidateOn: projection },
  )
  const stopParser = fieldValidation(field).useValidationParser((input) =>
    parse(input as readonly T[], true),
  )
  function release(entry: Entry) {
    if (entry.disposed) return
    entry.disposed = true
    entry.stop()
    entry.unlock?.()
    fieldValidation(entry.editor.field).invalidate()
    entry.release()
    entry.editor.dispose()
  }
  async function project(key: UiListKey, entry: Entry) {
    const revision = ++entry.revision
    entry.pending = true
    touch()
    try {
      const result = await fieldValidation(entry.editor.field).inspect(
        copy(entry.editor.field.state.input),
      )
      if (
        disposed.value ||
        entry.disposed ||
        revision !== entry.revision ||
        entries.get(key) !== entry
      )
        return
      entry.invalid = !result.ok || keyOf(result.value as T) !== key
      if (result.ok && !entry.invalid) {
        entry.value = copy(result.value as T)
        entry.stale = false
      }
    } catch {
      if (!entry.disposed && revision === entry.revision) entry.invalid = true
    } finally {
      if (!entry.disposed && revision === entry.revision) {
        entry.pending = false
        touch()
      }
    }
  }
  function create(item: T, key: UiListKey): Entry {
    const editor = options.createEditor(copy(item))
    if (toRaw(editor.field) === field || isFieldClaimed(editor.field))
      throw new Error(
        'Child editor must be fresh and exclusively owned; self/duplicate participation is forbidden.',
      )
    const releaseClaim = claimFormFields([[key, editor.field]], field)
    const entry: Entry = {
      editor,
      value: copy(item),
      revision: 0,
      pending: false,
      invalid: false,
      stale: false,
      stop: () => {},
      release: releaseClaim,
      disposed: false,
    }
    try {
      if (field.state.effectiveDisabled)
        entry.unlock = fieldValidation(editor.field).lock()
      const stopDraft = effects.run(() =>
        watch(
          () => editor.field.state.revision,
          () => {
            if (synchronizing || disposed.value || entry.disposed) return
            field.notifyDraftChanged({
              parts: [String(key)],
              origin: editor.field.state.lastDraftChange?.origin,
            })
            const statusChanged = !entry.stale || entry.pending
            entry.revision++
            entry.stale = true
            entry.pending = false
            if (projection === 'change') void project(key, entry)
            else if (statusChanged) touch()
          },
          { flush: 'sync' },
        ),
      )!
      const stopValidation = fieldValidation(editor.field).onValidated(
        async () => {
          if (synchronizing || disposed.value || entry.disposed) return
          // A parent validation already collects every row in its own single pass.
          if (projection === 'validate' && !field.state.validating)
            await project(key, entry)
          if (!disposed.value && !entry.disposed)
            await fieldValidation(field).notifyValidated()
        },
      )
      entry.stop = () => {
        stopDraft()
        stopValidation()
      }
      return entry
    } catch (error) {
      release(entry)
      throw error
    }
  }
  fieldValidation(field).coordinateValues((input, kind) => {
    alive()
    const values = input as readonly T[]
    const keys = keysOf(values)
    if (kind === 'set' && !operation && field.dirty.value)
      throw new Error(
        'Replacing a dirty collection requires explicit operations or a new session.',
      )
    const added = new Map<UiListKey, Entry>()
    const commits: PreparedFieldValue[] = []
    try {
      values.forEach((item, index) => {
        const key = keys[index]
        const existing = entries.get(key)
        if (!existing) added.set(key, create(item, key))
        else if (kind !== 'set')
          commits.push(
            kind === 'reset'
              ? fieldValidation(existing.editor.field).prepareRestore(item)
              : fieldValidation(existing.editor.field).prepareAccept(item),
          )
        else if (
          (operation === 'replace' && key === replacement) ||
          operation === undefined
        ) {
          // Formatting is exercised by prepareAccept but replacement must retain
          // the old accepted baseline. Get the typed input through inspectable
          // staging on a fresh codec path, without accepting it into the child.
          commits.push(
            fieldValidation(existing.editor.field).prepareDraft(item),
          )
        }
      })
    } catch (error) {
      commits.forEach((commit) => commit.discard())
      added.forEach(release)
      throw error
    }
    return {
      discard() {
        commits.forEach((commit) => commit.discard())
        added.forEach(release)
      },
      commit() {
        synchronizing = true
        try {
          commits.forEach((commit) => commit())
          for (const [key, entry] of entries)
            if (!keys.includes(key)) {
              entries.delete(key)
              release(entry)
            }
          for (const [key, entry] of added) entries.set(key, entry)
          values.forEach((item, index) => {
            const key = keys[index],
              entry = entries.get(key)!
            if (
              kind !== 'set' ||
              added.has(key) ||
              operation === undefined ||
              (operation === 'replace' && key === replacement)
            ) {
              entry.revision++
              entry.value = copy(item)
              entry.invalid = false
              entry.pending = false
              entry.stale = false
              if (kind === 'reset') entry.editor.field.state.checked = false
            }
          })
          revealRevision++
        } finally {
          synchronizing = false
        }
      },
    }
  })
  const stopLifecycle = fieldValidation(field).onValueChange(() => touch())
  const stopDirty = field.trackDraft(() =>
    [...entries.values()].some((entry) => entry.editor.field.dirty.value),
  )
  let stopLock = () => {}
  try {
    // Use the same staging path for initial creation and later canonical/reset changes.
    field.accept(options.initialValue)
    stopLock = effects.run(() =>
      watch(
        () => field.state.effectiveDisabled,
        (disabled) => {
          for (const entry of entries.values()) {
            if (disabled && !entry.unlock)
              entry.unlock = fieldValidation(entry.editor.field).lock()
            else if (!disabled && entry.unlock) {
              entry.unlock()
              entry.unlock = undefined
            }
          }
        },
        { flush: 'sync' },
      ),
    )!
    if (projection === 'change')
      entries.forEach((entry, key) => {
        void project(key, entry)
      })
  } catch (error) {
    dispose()
    throw error
  }
  const values = computed(() => {
    void version.value
    return Object.freeze(
      field.state.input.map((item) => copy(entries.get(keyOf(item))!.value)),
    )
  })
  const invalidKeys = computed(() => {
    void version.value
    return Object.freeze(
      field.state.input.map(keyOf).filter((key) => {
        const entry = entries.get(key)
        return entry?.invalid || entry?.editor.field.state.issue != null
      }),
    )
  })
  async function change(
    values: readonly T[],
    kind: 'membership' | 'replace',
    key?: UiListKey,
  ) {
    alive()
    if (field.state.effectiveDisabled) return false
    operation = kind
    replacement = key
    let pending: Promise<void>
    try {
      pending = field.set(values)
    } finally {
      operation = undefined
      replacement = undefined
    }
    await pending
    return true
  }
  function current(key: UiListKey) {
    alive()
    const entry = entries.get(key)
    if (!entry) throw new Error(`Unknown collection key: ${String(key)}`)
    return entry
  }
  function before(values: readonly T[], key: UiListKey | undefined) {
    if (key === undefined) return values.length
    const index = values.findIndex((item) => keyOf(item) === key)
    if (index < 0) throw new Error('Unknown insertion target.')
    return index
  }
  function dispose() {
    if (disposed.value) return
    disposed.value = true
    revealRevision++
    effects.stop()
    stopLock()
    stopParser()
    stopDirty()
    stopLifecycle()
    fieldValidation(field).invalidate()
    fieldValidation(field).lock()
    entries.forEach(release)
    entries.clear()
    touch()
  }
  return Object.freeze({
    field,
    state: Object.freeze({
      get items() {
        return disposed.value ? [] : values.value
      },
      get revision() {
        return version.value
      },
      get pending() {
        void version.value
        return [...entries.values()].some((entry) => entry.pending)
      },
      get stale() {
        void version.value
        return (
          !disposed.value && [...entries.values()].some((entry) => entry.stale)
        )
      },
      get invalidKeys() {
        return disposed.value ? [] : invalidKeys.value
      },
      get firstInvalidKey() {
        return disposed.value ? undefined : invalidKeys.value[0]
      },
      get disposed() {
        return disposed.value
      },
    }),
    editor: (key: UiListKey) => current(key).editor,
    itemKey: keyOf,
    findEditor: (key: UiListKey) =>
      disposed.value ? undefined : entries.get(key)?.editor,
    async insert(item: T, at?: { before?: UiListKey }) {
      alive()
      const key = keyOf(item)
      if (entries.has(key)) throw new Error('Duplicate collection key.')
      const values = [...field.state.input]
      values.splice(before(values, at?.before), 0, copy(item))
      return change(values, 'membership')
    },
    async remove(key: UiListKey) {
      current(key)
      return change(
        field.state.input.filter((item) => keyOf(item) !== key),
        'membership',
      )
    },
    async replace(
      key: UiListKey,
      item: T,
      settings?: { discardDraft?: boolean },
    ) {
      const entry = current(key)
      if (keyOf(item) !== key)
        throw new Error('Replacement must retain its collection identity.')
      if (entry.editor.field.dirty.value && !settings?.discardDraft)
        throw new Error('Replacing a dirty editor requires discardDraft: true.')
      return change(
        field.state.input.map((value) =>
          keyOf(value) === key ? copy(item) : value,
        ),
        'replace',
        key,
      )
    },
    async move(key: UiListKey, at?: { before?: UiListKey }) {
      current(key)
      if (at?.before === key) return false
      const values = [...field.state.input]
      const index = values.findIndex((item) => keyOf(item) === key)
      const [item] = values.splice(index, 1)
      values.splice(before(values, at?.before), 0, item)
      if (uiDefaultInputEquals(values, field.state.input)) return false
      return change(values, 'membership')
    },
    async revealInvalid(
      reveal: (key: UiListKey) => Promise<void>,
      focus: (editor: E, key: UiListKey) => boolean | Promise<boolean>,
    ) {
      alive()
      const key = invalidKeys.value[0]
      if (key === undefined) return false
      const entry = entries.get(key)!,
        revision = ++revealRevision,
        draft = field.state.revision
      await reveal(key)
      if (
        disposed.value ||
        revision !== revealRevision ||
        draft !== field.state.revision ||
        entries.get(key) !== entry ||
        invalidKeys.value[0] !== key
      )
        return false
      return focus(entry.editor, key)
    },
    dispose,
  })
}
