import { createUiStrategy, createUiStrategyQuery } from './definitions'
import {
  resolveLayoutFraming,
  type UiLayoutFraming,
} from '../presentation/layout-framing'

export const uiLayoutFramingQuery =
  /* @__PURE__ */ createUiStrategyQuery<UiLayoutFraming>({
    name: 'layout-framing',
    agree: (answers) =>
      answers.every(
        (value) =>
          JSON.stringify(resolveLayoutFraming(value)) ===
          JSON.stringify(resolveLayoutFraming(answers[0])),
      )
        ? answers[0]
        : undefined,
  })

export const uiLayoutFraming =
  /* @__PURE__ */ createUiStrategy<UiLayoutFraming>({
    name: 'layout-framing',
    answers: (value) => [
      uiLayoutFramingQuery.answer(resolveLayoutFraming(value)),
    ],
  })
