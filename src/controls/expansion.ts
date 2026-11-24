import { shallowRef } from 'vue'
import type { UiDrawerBinding } from '../bindings/drawer'
import type { UiCollapsibleBinding } from '../bindings/collapsible'

export type UiExpansionMode = 'single' | 'multiple'

export interface UiExpansionOptions {
  mode?: UiExpansionMode
  initialExpanded?: readonly string[]
}

export interface UiExpansionState {
  readonly mode: UiExpansionMode
  readonly expandedKeys: readonly string[]
  readonly disposed: boolean
}

export interface UiExpansionControl {
  readonly state: UiExpansionState
  readonly bindings: {
    readonly collapsible: (key: string) => UiCollapsibleBinding
    readonly drawer: (key: string) => UiDrawerBinding
  }
  expand(key: string): boolean
  collapse(key: string): boolean
  toggle(key: string): boolean
  setExpanded(keys: readonly string[]): boolean
  /** Supply the retained keys explicitly when narrowing a multi-open state. */
  setMode(mode: UiExpansionMode, expandedKeys?: readonly string[]): boolean
  dispose(): void
}

function assertKey(key: string) {
  if (typeof key !== 'string' || !key.trim())
    throw new Error('Expansion keys must be nonempty strings.')
}

function snapshot(
  mode: UiExpansionMode,
  keys: readonly string[],
  disposed = false,
): UiExpansionState {
  if (mode !== 'single' && mode !== 'multiple')
    throw new Error('Expansion mode must be single or multiple.')
  if (!Array.isArray(keys)) throw new Error('Expanded keys must be an array.')
  keys.forEach(assertKey)
  if (new Set(keys).size !== keys.length)
    throw new Error('Expanded keys must be unique.')
  if (mode === 'single' && keys.length > 1)
    throw new Error('Single expansion permits at most one expanded key.')
  return Object.freeze({
    mode,
    expandedKeys: Object.freeze([...keys]),
    disposed,
  })
}

/** Coordinates keyed expansion independently of mounting, layout or toolkits. */
export function createUiExpansionControl(
  options: UiExpansionOptions = {},
): UiExpansionControl {
  const current = shallowRef(
    snapshot(options.mode ?? 'single', options.initialExpanded ?? []),
  )
  const bindings = new Map<string, UiCollapsibleBinding>()
  const state: UiExpansionState = Object.freeze({
    get mode() {
      return current.value.mode
    },
    get expandedKeys() {
      return current.value.expandedKeys
    },
    get disposed() {
      return current.value.disposed
    },
  })
  function assertActive() {
    if (state.disposed) throw new Error('Expansion control has been disposed.')
  }
  function commit(mode: UiExpansionMode, keys: readonly string[]) {
    assertActive()
    const next = snapshot(mode, keys)
    const previous = current.value
    if (
      previous.mode === next.mode &&
      previous.expandedKeys.length === keys.length &&
      previous.expandedKeys.every((key, index) => key === keys[index])
    )
      return false
    // One reactive write: observers never see an invalid intermediate selection.
    current.value = next
    return true
  }
  function expand(key: string) {
    assertActive()
    assertKey(key)
    if (state.expandedKeys.includes(key)) return false
    return commit(
      state.mode,
      state.mode === 'single' ? [key] : [...state.expandedKeys, key],
    )
  }
  function collapse(key: string) {
    assertActive()
    assertKey(key)
    return commit(
      state.mode,
      state.expandedKeys.filter((value) => value !== key),
    )
  }
  function toggle(key: string) {
    assertActive()
    assertKey(key)
    return state.expandedKeys.includes(key) ? collapse(key) : expand(key)
  }
  function collapsible(key: string): UiCollapsibleBinding {
    assertKey(key)
    let binding = bindings.get(key)
    if (!binding) {
      assertActive()
      binding = Object.freeze({
        target: 'collapsible' as const,
        get expanded() {
          return state.expandedKeys.includes(key)
        },
        get disabled() {
          return state.disposed
        },
        requestExpanded(expanded: boolean) {
          if (state.disposed) return
          if (typeof expanded !== 'boolean')
            throw new Error('Expanded state must be boolean.')
          if (expanded) expand(key)
          else collapse(key)
        },
      })
      bindings.set(key, binding)
    }
    return binding
  }
  const drawerBindings = new Map<string, UiDrawerBinding>()
  function drawer(key: string): UiDrawerBinding {
    let binding = drawerBindings.get(key)
    if (!binding) {
      const source = collapsible(key)
      binding = Object.freeze({
        target: 'drawer' as const,
        get expanded() {
          return source.expanded
        },
        get disabled() {
          return source.disabled
        },
        requestExpanded: source.requestExpanded,
      })
      drawerBindings.set(key, binding)
    }
    return binding
  }
  return Object.freeze({
    state,
    bindings: Object.freeze({ collapsible, drawer }),
    expand,
    collapse,
    toggle,
    setExpanded: (keys: readonly string[]) => commit(state.mode, keys),
    setMode: (mode: UiExpansionMode, keys = state.expandedKeys) =>
      commit(mode, keys),
    dispose() {
      if (state.disposed) return
      current.value = snapshot(state.mode, [], true)
    },
  })
}
