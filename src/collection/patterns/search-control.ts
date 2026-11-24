import {
  createUiCollectionFilter,
  extendFilterControl,
  type UiCollectionFilterSource,
} from '../filter'
import { createUiFieldControl } from '../../controls/field'
import { createUiFilterFieldEditor } from '../filter-field'
import { createFilterPatternView } from './view'
import { filterSearchInput } from './search-view'
import { uiSearchFilterPresentationQuery } from '../../strategy/filter-presentation'
import type {
  UiSearchFilterDefinition,
  UiSearchFilterControl,
  UiSearchFilterEditorBinding,
} from './types'

export function createUiSearchFilterControl<F>(
  definition: UiSearchFilterDefinition<F>,
  source: UiCollectionFilterSource<F>,
): UiSearchFilterControl {
  let editor!: UiSearchFilterEditorBinding
  const control = createUiCollectionFilter(
    {
      ...definition,
      createEditor(context) {
        const field = createUiFieldControl(
          context.initialValue,
          definition.codec,
          [...(definition.rules ?? [])],
        )
        editor = Object.freeze({
          pattern: 'search',
          field,
          get placeholder() {
            return definition.placeholder
          },
          get searchLabel() {
            return definition.searchLabel
          },
        })
        return createUiFilterFieldEditor(
          context,
          field,
          createFilterPatternView(
            editor,
            uiSearchFilterPresentationQuery,
            () => filterSearchInput,
          ),
        )
      },
    },
    source,
  )
  return extendFilterControl(control, { pattern: 'search' as const, editor })
}
