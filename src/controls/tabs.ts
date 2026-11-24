import { getCurrentInstance, shallowRef, useId } from 'vue'
import type { UiTabsBinding, UiTabPanelBinding } from '../bindings/tabs'
import { assertTabKey, tabAssociation } from '../tabs/association'
export interface UiTabsOptions {
  selectedKey: string
  /** Optional in setup; supply outside setup for SSR-stable identity. */
  id?: string
}
export interface UiTabsState {
  readonly selectedKey: string
  readonly disposed: boolean
}
export interface UiTabsControl {
  readonly state: UiTabsState
  readonly bindings: {
    readonly tabs: UiTabsBinding
    readonly panel: (key: string) => UiTabPanelBinding
  }
  select(key: string): boolean
  dispose(): void
}
let sequence = 0
export function createUiTabsControl(options: UiTabsOptions): UiTabsControl {
  assertTabKey(options.selectedKey)
  const id =
    options.id ??
    (getCurrentInstance() ? useId() : `external-tabs-${++sequence}`)
  assertTabKey(id)
  const current = shallowRef({
    selectedKey: options.selectedKey,
    disposed: false,
  })
  const state: UiTabsState = Object.freeze({
    get selectedKey() {
      return current.value.selectedKey
    },
    get disposed() {
      return current.value.disposed
    },
  })
  function select(key: string) {
    if (state.disposed) throw new Error('Tabs control has been disposed.')
    assertTabKey(key)
    // Owners may prepare selection before mounting or before adding its declaration.
    if (key === state.selectedKey) return false
    current.value = { selectedKey: key, disposed: false }
    return true
  }
  const tabs: UiTabsBinding = Object.freeze({
    target: 'tabs',
    id,
    get selectedKey() {
      return state.selectedKey
    },
    get disabled() {
      return state.disposed
    },
    requestSelected(key: string) {
      if (state.disposed) return
      const item = tabAssociation(tabs).items.find((item) => item.key === key)
      if (item && !item.disabled) select(key)
    },
  })
  const panels = new Map<string, UiTabPanelBinding>()
  return Object.freeze({
    state,
    bindings: Object.freeze({
      tabs,
      panel(key: string) {
        assertTabKey(key)
        let binding = panels.get(key)
        if (!binding) {
          if (state.disposed) throw new Error('Tabs control has been disposed.')
          binding = Object.freeze({
            target: 'tab-panel' as const,
            value: key,
            tabs,
          })
          panels.set(key, binding)
        }
        return binding
      },
    }),
    select,
    dispose() {
      if (!state.disposed) current.value = { ...current.value, disposed: true }
    },
  })
}
