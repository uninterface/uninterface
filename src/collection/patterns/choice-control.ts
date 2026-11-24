import {
  createUiCollectionFilter,
  extendFilterControl,
  type UiCollectionFilterSource,
} from '../filter'
import { createUiFieldControl } from '../../controls/field'
import { createUiEntryControl } from '../../entries/control'
import { createUiFilterFieldEditor } from '../filter-field'
import { createFilterPatternView } from './view'
import { defaultChoiceAdaptation } from './choice-views'
import { uiChoiceFilterPresentationQuery } from '../../strategy/filter-presentation'
import type {
  UiChoiceFilterDefinition,
  UiChoiceFilterControl,
  UiChoiceFilterEditorBinding,
} from './types'

export function createUiChoiceFilterControl<
  F,
  V extends string | readonly string[],
>(
  definition: UiChoiceFilterDefinition<F, V>,
  source: UiCollectionFilterSource<F>,
): UiChoiceFilterControl<V> {
  let editor!: UiChoiceFilterEditorBinding<V>
  const control = createUiCollectionFilter<F, V>(
    {
      ...definition,
      createEditor(context) {
        const value = context.initialValue
        if (
          definition.selection === 'single'
            ? typeof value !== 'string'
            : definition.selection !== 'multiple' ||
              !Array.isArray(value) ||
              value.some((key) => typeof key !== 'string') ||
              new Set(value).size !== value.length
        )
          throw new Error(
            'Choice-filter values must match the declared selection mode.',
          )
        const field = createUiFieldControl<V, V>(
          value,
          undefined,
          [...(definition.rules ?? [])],
          {
            inputEquals: (a, b) =>
              Array.isArray(a) && Array.isArray(b)
                ? a.length === b.length && a.every((key) => b.includes(key))
                : a === b,
          },
        )
        const choices = createUiEntryControl(definition.options)
        editor = Object.freeze({
          pattern: 'choice',
          field,
          choices,
          selection: definition.selection,
          get applyLabel() {
            return definition.applyLabel
          },
          get clearLabel() {
            return definition.clearLabel
          },
        })
        const instance = createUiFilterFieldEditor(
          context,
          field,
          createFilterPatternView(
            editor,
            uiChoiceFilterPresentationQuery,
            defaultChoiceAdaptation,
          ),
        )
        return {
          ...instance,
          get dirty() {
            return instance.dirty
          },
          get validating() {
            return instance.validating
          },
          dispose() {
            instance.dispose()
            choices.dispose()
          },
        }
      },
    },
    source,
  )
  return extendFilterControl(control, { pattern: 'choice' as const, editor })
}
