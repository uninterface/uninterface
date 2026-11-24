/** Selection and identity shared by one tab bar and its separately placed panels. */
export interface UiTabsBinding {
  readonly target: 'tabs'
  /** Stable, document-unique identity; use an SSR-stable value on a server. */
  readonly id: string
  readonly selectedKey: string
  readonly disabled: boolean
  readonly requestSelected: (key: string) => void
}
export interface UiTabPanelBinding {
  readonly target: 'tab-panel'
  readonly value: string
  readonly tabs: UiTabsBinding
}
