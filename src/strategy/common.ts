import type { UiButtonVariant } from '../presentation/button'
import {
  hierarchyLevels,
  type UiHierarchyLevel,
} from '../presentation/hierarchy'
import { createUiStrategy, createUiStrategyQuery } from './definitions'
import type { UiControlSize, UiLayoutDensity } from './types'

function common<T extends string | number>(name: string, values: readonly T[]) {
  // This is the documented agreement of these common queries, not a global rule.
  const query = createUiStrategyQuery<T>({
    name,
    agree: (answers) =>
      answers.every((value) => value === answers[0]) ? answers[0] : undefined,
  })
  const strategy = createUiStrategy<T>({
    name,
    answers: (value) => {
      if (!values.includes(value))
        throw new Error(`${name}: unsupported value ${String(value)}.`)
      return [query.answer(value)]
    },
  })
  return { query, strategy }
}
const size = /* @__PURE__ */ common<UiControlSize>(
  'control-size',
  [-2, -1, 0, 1, 2],
)
export const uiControlSize = size.strategy
export const uiControlSizeQuery = size.query
const density = /* @__PURE__ */ common<UiLayoutDensity>(
  'layout-density',
  [-1, 0, 1],
)
export const uiLayoutDensity = density.strategy
export const uiLayoutDensityQuery = density.query
const labels = /* @__PURE__ */ common('field-labels', [
  'show',
  'above',
  'beside',
  'beside-far',
  'beside-near',
  'floating',
  'hidden',
] as const)
export const uiFieldLabels = labels.strategy
export const uiFieldLabelsQuery = labels.query
const checkable = /* @__PURE__ */ common('checkable-presentation', [
  'adapt',
  'flushed',
  'control-aligned',
  'separated',
] as const)
export const uiCheckablePresentation = checkable.strategy
export const uiCheckablePresentationQuery = checkable.query
const required = /* @__PURE__ */ common('required-annotations', [
  'prefix',
  'suffix',
  'yes',
  'no',
] as const)
export const uiRequiredAnnotations = required.strategy
export const uiRequiredAnnotationsQuery = required.query
const help = /* @__PURE__ */ common('field-help', [
  'together',
  'replace-help',
] as const)
export const uiFieldHelp = help.strategy
export const uiFieldHelpQuery = help.query
const failure = /* @__PURE__ */ common('validation-failure', [
  'none',
  'show',
  'show-below',
  'show-embedded',
  'show-tooltip',
] as const)
export const uiValidationFailure = failure.strategy
export const uiValidationFailureQuery = failure.query

const buttonVariant = /* @__PURE__ */ common<UiButtonVariant>(
  'button-variant',
  ['filled', 'outline', 'neutral', 'soft', 'text', 'icon'],
)
export const uiButtonVariant = buttonVariant.strategy
export const uiButtonVariantQuery = buttonVariant.query

const collectionActionVariant = /* @__PURE__ */ common(
  'collection-action-variant',
  ['bordered', 'soft', 'text'] as const,
)
export const uiCollectionActionVariant = collectionActionVariant.strategy
export const uiCollectionActionVariantQuery = collectionActionVariant.query

const buttonWidth = /* @__PURE__ */ common('button-width', [
  'content',
  'full',
] as const)
export const uiButtonWidth = buttonWidth.strategy
export const uiButtonWidthQuery = buttonWidth.query

const hierarchy = /* @__PURE__ */ common<UiHierarchyLevel>(
  'hierarchy-level',
  hierarchyLevels,
)
export const uiHierarchyLevel = hierarchy.strategy
export const uiHierarchyLevelQuery = hierarchy.query
