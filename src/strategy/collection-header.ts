import { createUiStrategy, createUiStrategyQuery } from './definitions'
import type {
  UiCollectionHeaderContext,
  UiCollectionHeaderSelection,
} from '../collection/header'

/** Select first, then agree on adaptation identity in this header's current context. */
export const uiCollectionHeaderPresentationQuery =
  /* @__PURE__ */ createUiStrategyQuery<
    UiCollectionHeaderSelection,
    UiCollectionHeaderContext
  >({
    name: 'collection-header-presentation',
    agree: (answers, context) => {
      const selected = answers
        .map((answer) =>
          typeof answer === 'function' ? answer(context) : answer,
        )
        .filter((answer) => answer !== undefined)
      return selected.length &&
        selected.every((answer) => answer === selected[0])
        ? selected[0]
        : undefined
    },
  })

export const uiCollectionHeaderPresentation =
  /* @__PURE__ */ createUiStrategy<UiCollectionHeaderSelection>({
    name: 'collection-header-presentation',
    answers: (value) => [uiCollectionHeaderPresentationQuery.answer(value)],
  })
