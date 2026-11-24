import type { UiTextSource } from '../text/source'
import type { VNodeChild } from 'vue'
import type { UiThemeColor } from '../presentation/theme'
import type { UiIconName } from '../icons/catalogue'

interface EntryIdentity {
  key: string
}
interface EntryDescription extends EntryIdentity {
  label: UiTextSource
  description?: UiTextSource
  render?: () => VNodeChild
  icon?: { name: UiIconName; tone?: UiThemeColor }
}
export type UiEntry =
  | (EntryDescription & {
      kind?: 'item'
      disabled?: boolean
      shortcut?: UiTextSource
      href?: string
    })
  | (EntryDescription & {
      kind: 'submenu'
      disabled?: boolean
      children: UiEntrySource
    })
  | (EntryDescription & { kind: 'group'; entries: readonly UiEntry[] })
  | (EntryIdentity & { kind: 'separator' })

export type UiEntrySource =
  | readonly UiEntry[]
  | ((request: {
      signal: AbortSignal
      query: string
    }) => readonly UiEntry[] | Promise<readonly UiEntry[]>)

export interface UiEntryCollection {
  readonly entries: readonly UiEntry[]
  readonly status: 'idle' | 'loading' | 'ready' | 'refreshing' | 'error'
  readonly error: unknown
  readonly query: string
}

export interface UiEntrySelection {
  readonly key: string
  readonly mode: 'single' | 'multiple'
  /** Omit for all ordinary items. Scopes must not overlap. */
  readonly keys?: readonly string[]
  readonly selectedKeys?: readonly string[]
}
