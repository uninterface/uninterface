import type { UiEntry } from './types'
import { requireUiText, resolveUiText } from '../text/source'

/** Backend projection: all text and loaded descendants are resolved by core. */
export type ResolvedEntry<T = UiEntry> = T extends { kind: 'separator' }
  ? T
  : Omit<T, 'label' | 'description' | 'shortcut' | 'entries' | 'children'> & {
      label: string
      description?: string
    } & (T extends { kind: 'group' }
        ? { entries: readonly ResolvedEntry[] }
        : T extends { kind: 'submenu' }
          ? { children: readonly ResolvedEntry[] }
          : { shortcut?: string })

export function resolveEntry(entry: UiEntry): ResolvedEntry {
  if (entry.kind === 'separator') return entry
  const { label, description, ...metadata } = entry
  const resolved = {
    ...metadata,
    label: requireUiText(label, `Entry ${entry.key} requires a text label.`),
    description: resolveUiText(description),
  }
  // useEntryView fills these with the already loaded child projections.
  if (resolved.kind === 'group') return { ...resolved, entries: [] }
  if (resolved.kind === 'submenu') return { ...resolved, children: [] }
  return { ...resolved, shortcut: resolveUiText(resolved.shortcut) }
}
