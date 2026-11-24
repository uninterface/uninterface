import { inject, type Component, type InjectionKey } from 'vue'
import type {
  UiCollectionFilterBinding,
  UiFilterCommitResult,
  UiFilterPresentationContext,
} from './filter'

export interface UiCollectionFilterViewContext {
  readonly binding: UiCollectionFilterBinding
  /** Render this stable view once when customizing the host slot. */
  readonly editor: Component
  readonly presentation: UiFilterPresentationContext
  /** Same operation for keyboard and buttons; emits the host's applied event. */
  submit(): Promise<UiFilterCommitResult>
  clear(): UiFilterCommitResult
}
export const filterViewKey: InjectionKey<UiCollectionFilterViewContext> =
  Symbol('filter editor')
export const filterHostKey: InjectionKey<{
  readonly presentation: UiFilterPresentationContext
  register(binding: UiCollectionFilterBinding): () => void
}> = Symbol('filter host')
export function useUiCollectionFilter(): UiCollectionFilterViewContext {
  const context = inject(filterViewKey)
  if (!context)
    throw new Error('useUiCollectionFilter requires UiCollectionFilter.')
  return context
}
export const defaultFilterPresentation: UiFilterPresentationContext =
  Object.freeze({
    usage: 'filter-row',
    container: 'inline',
    labelProvided: false,
    summaryProvided: false,
    arrangement: 'single-row',
    submission: 'individual',
  })
