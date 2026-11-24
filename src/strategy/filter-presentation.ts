import { createUiStrategy, createUiStrategyQuery } from './definitions'
import type {
  UiFilterSelection,
  UiFilterViewContext,
  UiSearchFilterEditorBinding,
  UiChoiceFilterEditorBinding,
  UiRangeFilterEditorBinding,
} from '../collection/patterns/types'

function presentation<E extends { readonly pattern: string }>(name: string) {
  const query = createUiStrategyQuery<
    UiFilterSelection<E>,
    UiFilterViewContext<E>
  >({
    name,
    agree: (answers, context) => {
      const selected = answers
        .map((answer) =>
          typeof answer === 'function' ? answer(context) : answer,
        )
        .filter((answer) => answer !== undefined)
      for (const answer of selected)
        if (
          answer.pattern !== context.editor.pattern ||
          typeof answer.view !== 'function'
        )
          throw new Error(
            `${name}: selector returned an incompatible filter adaptation.`,
          )
      return selected.length &&
        selected.every((answer) => answer === selected[0])
        ? selected[0]
        : undefined
    },
  })
  const strategy = createUiStrategy<UiFilterSelection<E>>({
    name,
    answers: (value) => [query.answer(value)],
  })
  return { query, strategy }
}
const search = /* @__PURE__ */ presentation<UiSearchFilterEditorBinding>(
  'search-filter-presentation',
)
const choice = /* @__PURE__ */ presentation<UiChoiceFilterEditorBinding<any>>(
  'choice-filter-presentation',
)
const range = /* @__PURE__ */ presentation<UiRangeFilterEditorBinding<any>>(
  'range-filter-presentation',
)
export const uiSearchFilterPresentation = search.strategy
export const uiSearchFilterPresentationQuery = search.query
export const uiChoiceFilterPresentation = choice.strategy
export const uiChoiceFilterPresentationQuery = choice.query
export const uiRangeFilterPresentation = range.strategy
export const uiRangeFilterPresentationQuery = range.query
