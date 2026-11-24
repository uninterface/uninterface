import { createUiStrategy, createUiStrategyQuery } from './definitions'
import {
  resolveCardPresentation,
  sameCardPresentation,
  type UiCardPresentation,
} from '../presentation/card'

/** Whole-profile semantic unanimity; no attachment priority or partial merge. */
export const uiCardPresentationQuery =
  /* @__PURE__ */ createUiStrategyQuery<UiCardPresentation>({
    name: 'card-presentation',
    agree: (answers) =>
      answers.every((answer) => sameCardPresentation(answer, answers[0]))
        ? answers[0]
        : undefined,
  })

export const uiCardPresentation =
  /* @__PURE__ */ createUiStrategy<UiCardPresentation>({
    name: 'card-presentation',
    answers: (value) => [
      uiCardPresentationQuery.answer(resolveCardPresentation(value)),
    ],
  })
