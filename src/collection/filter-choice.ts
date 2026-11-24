import { createUiFieldControl } from '../controls/field'
import { createUiEntryControl } from '../entries/control'
import type { UiEntrySource } from '../entries/types'
import type { UiFilterEditorContext, UiFilterEditorInstance } from './filter'
import { createUiFilterFieldEditor } from './filter-field'
import { createFilterPatternView } from './patterns/view'
import { defaultChoiceAdaptation } from './patterns/choice-views'
import { uiChoiceFilterPresentationQuery } from '../strategy/filter-presentation'

export interface UiChoiceFilterEditorOptions {
  readonly selection: 'single' | 'multiple'
  readonly options: UiEntrySource
}
/** Common selection presentation; query meaning and commit policy stay in the definition. */
export function createUiChoiceFilterEditor<K extends string>(
  context: UiFilterEditorContext<readonly K[]>,
  options: UiChoiceFilterEditorOptions & { selection: 'multiple' },
): UiFilterEditorInstance<readonly K[]>
export function createUiChoiceFilterEditor<K extends string>(
  context: UiFilterEditorContext<K>,
  options: UiChoiceFilterEditorOptions & { selection: 'single' },
): UiFilterEditorInstance<K>
export function createUiChoiceFilterEditor(
  context: UiFilterEditorContext<any>,
  options: UiChoiceFilterEditorOptions,
): UiFilterEditorInstance<any> {
  if (!['single', 'multiple'].includes(options.selection))
    throw new Error('Unsupported choice-filter selection.')
  if (
    options.selection === 'multiple'
      ? !Array.isArray(context.initialValue) ||
        context.initialValue.some((key: unknown) => typeof key !== 'string') ||
        new Set(context.initialValue).size !== context.initialValue.length
      : typeof context.initialValue !== 'string'
  )
    throw new Error(
      'Choice-filter values must match the declared selection mode.',
    )
  const choices = createUiEntryControl(options.options)
  const field = createUiFieldControl(
    context.initialValue,
    undefined,
    [],
    options.selection === 'multiple'
      ? {
          inputEquals: (a: string[], b: string[]) =>
            a.length === b.length && a.every((key) => b.includes(key)),
        }
      : {},
  )
  const editor = createUiFilterFieldEditor(
    context,
    field,
    createFilterPatternView(
      {
        pattern: 'choice' as const,
        field,
        choices,
        selection: options.selection,
      },
      uiChoiceFilterPresentationQuery,
      defaultChoiceAdaptation,
    ),
  )
  return {
    view: editor.view,
    get dirty() {
      return editor.dirty
    },
    get validating() {
      return editor.validating
    },
    validate: editor.validate,
    replace: editor.replace,
    dispose() {
      editor.dispose()
      choices.dispose()
    },
  }
}
