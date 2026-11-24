import { defineComponent, type Component } from 'vue'
import { useUiCollectionFilter } from '../filter-context'
import { useUiStrategy } from '../../strategy/context'
import type { UiStrategyQuery } from '../../strategy/types'
import type {
  UiFilterAdaptation,
  UiFilterSelection,
  UiFilterViewContext,
} from './types'

/** A stable rendering boundary; no additional editor owner or strategy depth. */
export function createFilterPatternView<E extends { readonly pattern: string }>(
  editor: E,
  query: UiStrategyQuery<UiFilterSelection<E>, UiFilterViewContext<E>>,
  defaultAdaptation: (context: UiFilterViewContext<E>) => UiFilterAdaptation<E>,
): Component {
  return defineComponent({
    name: 'UiFilterPatternView',
    setup() {
      const filter = useUiCollectionFilter()
      const context: UiFilterViewContext<E> = {
        get binding() {
          return filter.binding
        },
        editor,
        get presentation() {
          return filter.presentation
        },
        submit: () => filter.submit(),
        clear: () => filter.clear(),
      }
      const selection = useUiStrategy(
        query,
        (value) =>
          typeof value === 'function' ||
          (!!value &&
            value.pattern === editor.pattern &&
            typeof value.view === 'function'),
        () => context,
      )
      return () => {
        const resolved = selection.value
        const adaptation =
          resolved.status === 'answered' && typeof resolved.value !== 'function'
            ? resolved.value
            : defaultAdaptation(context)
        return adaptation.view(context)
      }
    },
  })
}
