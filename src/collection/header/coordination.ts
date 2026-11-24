import { shallowRef } from 'vue'
import type { UiCollectionHeaderViewContext } from '../header'

// Both built-ins register the same query surface so a disappearing focused editor
// can hand focus to the disclosure. This helper neither arranges nor opens anything.
const queryKey = Symbol('collection-header-query-surface')
export function querySurface(context: UiCollectionHeaderViewContext) {
  return context.state(queryKey, () => ({
    element: shallowRef<HTMLElement>(),
    // Built-in presentation history is transient, separate from owner-held drafts.
    arrangement: undefined as 'long-row' | 'narrow-expandable' | undefined,
  }))
}
