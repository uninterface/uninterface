import { requireUiText } from '../text/source'
import { shallowReactive, shallowReadonly } from 'vue'
import type {
  UiEntry,
  UiEntryCollection,
  UiEntrySelection,
  UiEntrySource,
} from './types'

type Item = Exclude<UiEntry, { kind: 'separator' }>
interface Branch {
  source: UiEntrySource
  state: {
    entries: readonly UiEntry[]
    status: UiEntryCollection['status']
    error: unknown
    query: string
  }
  abort?: AbortController
  revision: number
  loaded: boolean
  pending?: Promise<void>
}
export interface UiEntryControl {
  collection(parentKey?: string): UiEntryCollection
  load(parentKey?: string): Promise<void>
  clear(parentKey?: string): void
  refresh(parentKey?: string): Promise<void>
  search(query: string): Promise<void>
  find(key: string): UiEntry | undefined
  describe(key: string): Item | undefined
  selectionFor(key: string): UiEntrySelection | undefined
  selectedKeys(scope: string): readonly string[]
  setSelectedKeys(scope: string, keys: readonly string[]): void
  choose(key: string): boolean
  dispose(): void
}

export function createUiEntryControl(
  source: UiEntrySource,
  options: {
    selection?: readonly UiEntrySelection[]
  } = {},
): UiEntryControl {
  let disposed = false
  const branches = shallowReactive(new Map<string | undefined, Branch>())
  const descriptions = shallowReactive(new Map<string, Item>())
  const scopes = (options.selection ?? []).map((scope) =>
    Object.freeze({
      ...scope,
      keys: scope.keys && Object.freeze([...scope.keys]),
      selectedKeys:
        scope.selectedKeys && Object.freeze([...scope.selectedKeys]),
    }),
  )
  const selections = shallowReactive(new Map<string, readonly string[]>())
  const occupied = new Set<string>()
  for (const scope of scopes) {
    if (
      !scope.key ||
      selections.has(scope.key) ||
      !['single', 'multiple'].includes(scope.mode)
    )
      throw new Error('Invalid entry selection scope.')
    if (!scope.keys && scopes.length > 1)
      throw new Error(
        'An all-items selection scope cannot overlap another scope.',
      )
    for (const key of scope.keys ?? []) {
      if (occupied.has(key))
        throw new Error(`Overlapping selection key: ${key}`)
      occupied.add(key)
    }
    selections.set(scope.key, [])
  }
  function alive() {
    if (disposed) throw new Error('Entry control is disposed.')
  }
  function makeBranch(source: UiEntrySource): Branch {
    return {
      source,
      revision: 0,
      loaded: typeof source !== 'function',
      state: shallowReactive({
        entries: typeof source === 'function' ? [] : source,
        status: typeof source === 'function' ? 'idle' : 'ready',
        error: null,
        query: '',
      }),
    }
  }
  branches.set(undefined, makeBranch(source))
  function walk(entries: readonly UiEntry[], visit: (entry: UiEntry) => void) {
    for (const entry of entries) {
      visit(entry)
      if (entry.kind === 'group') walk(entry.entries, visit)
      if (entry.kind === 'submenu') {
        const branch = branches.get(entry.key)
        if (branch?.source === entry.children) walk(branch.state.entries, visit)
        else if (typeof entry.children !== 'function')
          walk(entry.children, visit)
      }
    }
  }
  function validate(
    root: readonly UiEntry[],
    replacement?: { key: string | undefined; entries: readonly UiEntry[] },
  ) {
    const keys = new Set<string>()
    const ancestors = new Set<object>()
    function scan(entries: readonly UiEntry[]) {
      if (!Array.isArray(entries))
        throw new Error('Entry source must return an array.')
      if (ancestors.has(entries)) throw new Error('Cyclic entry structure.')
      ancestors.add(entries)
      for (const entry of entries) {
        if (!entry || typeof entry.key !== 'string')
          throw new Error('Every entry requires a string key.')
        if (keys.has(entry.key))
          throw new Error(`Duplicate entry key: ${entry.key}`)
        keys.add(entry.key)
        if (
          'href' in entry &&
          entry.href &&
          /^(?:javascript|data|vbscript):/i.test(
            entry.href.replace(/[\s\u0000-\u001f]/g, ''),
          )
        )
          throw new Error('Unsafe navigation URL.')
        if (
          ![undefined, 'item', 'submenu', 'group', 'separator'].includes(
            entry.kind,
          )
        )
          throw new Error('Unknown entry kind.')
        if (entry.kind !== 'separator')
          requireUiText(
            entry.label,
            `Entry ${entry.key} requires a text label.`,
          )
        if (entry.kind === 'group') scan(entry.entries)
        if (entry.kind === 'submenu') {
          if (replacement && replacement.key === entry.key)
            scan(replacement.entries)
          else {
            const cached = branches.get(entry.key)
            if (cached && cached.source === entry.children)
              scan(cached.state.entries)
            else if (typeof entry.children !== 'function') scan(entry.children)
          }
        }
      }
      ancestors.delete(entries)
    }
    scan(
      replacement && replacement.key === undefined ? replacement.entries : root,
    )
  }
  function reconcile() {
    const live = new Map<string, UiEntrySource>()
    walk(branches.get(undefined)!.state.entries, (entry) => {
      if (entry.kind !== 'separator') descriptions.set(entry.key, entry)
      if (entry.kind === 'submenu') live.set(entry.key, entry.children)
    })
    for (const [key, branch] of branches) {
      if (key !== undefined && live.get(key) !== branch.source) {
        branch.abort?.abort()
        branch.revision++
        branches.delete(key)
      }
    }
  }
  validate(branches.get(undefined)!.state.entries)
  reconcile()
  function find(key: string) {
    let result: UiEntry | undefined
    walk(branches.get(undefined)!.state.entries, (entry) => {
      if (entry.key === key) result = entry
    })
    return result
  }
  function branchFor(key?: string) {
    const existing = branches.get(key)
    if (existing) return existing
    const entry = key === undefined ? undefined : find(key)
    if (entry?.kind !== 'submenu') throw new Error(`Unknown submenu: ${key}`)
    const branch = makeBranch(entry.children)
    branches.set(key, branch)
    return branch
  }
  function run(
    key: string | undefined,
    force: boolean,
    query?: string,
  ): Promise<void> {
    alive()
    const branch = branchFor(key)
    if (!force && branch.pending) return branch.pending
    if (!force && branch.state.status === 'ready') return Promise.resolve()
    branch.abort?.abort()
    const abort = new AbortController()
    branch.abort = abort
    const revision = ++branch.revision
    const sameQuery = query === undefined || query === branch.state.query
    if (query !== undefined) branch.state.query = query
    if (!sameQuery) {
      branch.state.entries = []
      branch.loaded = false
      reconcile()
    }
    branch.state.status = branch.loaded ? 'refreshing' : 'loading'
    branch.state.error = null
    const current = () =>
      !disposed && branch.revision === revision && !abort.signal.aborted
    const task = (async () => {
      let entries: readonly UiEntry[]
      try {
        entries =
          typeof branch.source === 'function'
            ? await branch.source({
                signal: abort.signal,
                query: branch.state.query,
              })
            : branch.source
      } catch (error) {
        if (current()) {
          branch.state.error = error
          branch.state.status = 'error'
        }
        return
      }
      if (!current()) return
      try {
        validate(branches.get(undefined)!.state.entries, { key, entries })
        branch.state.entries = entries
        branch.state.status = 'ready'
        branch.loaded = true
        reconcile()
      } catch (error) {
        branch.state.error = error
        branch.state.status = 'error'
        throw error
      }
    })()
    branch.pending = task
    void task
      .finally(() => {
        if (branch.revision === revision) branch.pending = undefined
      })
      .catch(() => {})
    return task
  }
  function selectionFor(key: string) {
    return scopes.find((scope) => !scope.keys || scope.keys.includes(key))
  }
  function setSelectedKeys(scopeKey: string, keys: readonly string[]) {
    alive()
    const scope = scopes.find((scope) => scope.key === scopeKey)
    if (!scope) throw new Error(`Unknown selection scope: ${scopeKey}`)
    const unique = [...new Set(keys)]
    if (
      unique.some(
        (key) =>
          typeof key !== 'string' || (scope.keys && !scope.keys.includes(key)),
      )
    )
      throw new Error('Selected keys must belong to their scope.')
    if (scope.mode === 'single' && unique.length > 1)
      throw new Error('Single selection accepts at most one key.')
    selections.set(scopeKey, Object.freeze(unique))
  }
  for (const scope of scopes)
    setSelectedKeys(scope.key, scope.selectedKeys ?? [])
  return {
    collection: (key) => shallowReadonly(branchFor(key).state),
    load: (key) => run(key, false),
    clear(key) {
      alive()
      const branch = branchFor(key)
      branch.abort?.abort()
      branch.revision++
      branch.pending = undefined
      branch.loaded = false
      branch.state.entries = []
      branch.state.status = 'idle'
      branch.state.error = null
      reconcile()
    },
    refresh: (key) => run(key, true),
    search: (query) => {
      if (typeof source !== 'function')
        throw new Error(
          'Entry search requires a provider that interprets query.',
        )
      return run(undefined, true, query)
    },
    find,
    describe: (key) => descriptions.get(key),
    selectionFor,
    selectedKeys: (key) => {
      const value = selections.get(key)
      if (!value) throw new Error(`Unknown selection scope: ${key}`)
      return value
    },
    setSelectedKeys,
    choose(key) {
      alive()
      const entry = find(key)
      if (!entry || (entry.kind && entry.kind !== 'item') || entry.disabled)
        return false
      const scope = selectionFor(key)
      if (scope) {
        const selected = selections.get(scope.key)!
        setSelectedKeys(
          scope.key,
          scope.mode === 'single'
            ? [key]
            : selected.includes(key)
              ? selected.filter((value) => value !== key)
              : [...selected, key],
        )
      }
      return true
    },
    dispose() {
      disposed = true
      for (const branch of branches.values()) {
        branch.abort?.abort()
        branch.revision++
        branch.state.status = branch.loaded ? 'ready' : 'idle'
      }
    },
  }
}
