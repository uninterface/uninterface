import {
  computed,
  inject,
  provide,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue'
import { useUiStrategy } from '../strategy/context'
import {
  uiFieldLabelsQuery,
  uiCheckablePresentationQuery,
  uiRequiredAnnotationsQuery,
  uiFieldHelpQuery,
  uiValidationFailureQuery,
} from '../strategy/common'
import type { UiFieldViewBinding } from './index'
import { useModalValidationTooltipFallback } from '../stacking/overlays'
import { useFieldFeedbackTiming } from './fieldFeedback'

type LabelPosition =
  | 'show'
  | 'above'
  | 'beside'
  | 'beside-far'
  | 'beside-near'
  | 'floating'
  | 'hidden'
type FailureMode = 'show-below' | 'show-embedded' | 'show-tooltip'
type LabelPlacement = 'above' | 'beside' | 'floating'
type BesideLabels = 'beside-far' | 'beside-near'
type ResolvedLabels =
  | Exclude<LabelPosition, 'show' | 'beside'>
  | 'integrated'
  | 'adjacent'

/** Fulfill an agreed label intent through its documented generalization chain. */
function resolveLabels(
  value: LabelPosition,
  supports: (value: LabelPlacement) => boolean,
  visibleDefault: Exclude<ResolvedLabels, 'hidden'>,
  beside: (value: LabelPosition) => BesideLabels,
): ResolvedLabels {
  if (value === 'hidden') return value
  if (value === 'show') return visibleDefault
  if (value === 'beside' || value === 'beside-far' || value === 'beside-near')
    return supports('beside') ? beside(value) : visibleDefault
  return supports(value) ? value : visibleDefault
}

/** Policy only: backends declare concrete treatments and choose their own defaults. */
export function useUiFieldStrategies(
  binding: () => UiFieldViewBinding,
  defaults: {
    help?: 'together' | 'replace-help'
    showRequiredAnnotations?: boolean | (() => boolean)
    requiredAnnotations?: 'prefix' | 'suffix' | (() => 'prefix' | 'suffix')
    labels?: readonly LabelPlacement[] | ((value: LabelPlacement) => boolean)
    defaultLabels?: () => ResolvedLabels
    defaultBeside?: () => BesideLabels
    besideAlignments?: readonly ('near' | 'far')[]
    checkableModes?: readonly ('flushed' | 'control-aligned' | 'separated')[]
    failureModes?: readonly [FailureMode, ...FailureMode[]]
    defaultFailure?: () => FailureMode | 'none'
    feedbackRoot?: Ref<unknown>
  } = {},
) {
  // Agree on requested intent before applying native support or fallback.
  const labels = useUiStrategy(uiFieldLabelsQuery, [
    'show',
    'above',
    'beside',
    'beside-far',
    'beside-near',
    'floating',
    'hidden',
  ])
  const supportsLabel = (value: LabelPlacement) => {
    const supported = defaults.labels ?? ['above']
    return typeof supported === 'function'
      ? supported(value)
      : supported.includes(value)
  }
  const checkable = useUiStrategy(uiCheckablePresentationQuery, [
    'adapt',
    'flushed',
    'control-aligned',
    'separated',
  ])
  const annotations = useUiStrategy(uiRequiredAnnotationsQuery, [
    'prefix',
    'suffix',
    'yes',
    'no',
  ])
  const help = useUiStrategy(uiFieldHelpQuery, ['together', 'replace-help'])
  // All requests participate in agreement before native approximation.
  const failure = useUiStrategy(uiValidationFailureQuery, [
    'none',
    'show',
    'show-below',
    'show-embedded',
    'show-tooltip',
  ])
  const needsInlineFailure = useModalValidationTooltipFallback()
  const policy = computed(() => {
    const field = binding()
    const nativeLabels = defaults.defaultLabels?.() ?? 'above'
    const visibleLabels = nativeLabels === 'hidden' ? 'above' : nativeLabels
    const defaultBeside =
      defaults.defaultBeside?.() ??
      (nativeLabels === 'beside-near' || nativeLabels === 'beside-far'
        ? nativeLabels
        : 'beside-far')
    const beside = (value: LabelPosition): BesideLabels => {
      const requested =
        value === 'beside-near' || value === 'beside-far'
          ? value
          : defaultBeside
      return !defaults.besideAlignments ||
        defaults.besideAlignments.includes(
          requested === 'beside-near' ? 'near' : 'far',
        )
        ? requested
        : defaultBeside
    }
    const requestedLabels =
      labels.value.status === 'answered' ? labels.value.value : undefined
    // Resolve the ordinary placement before any dependent presentation.
    const effectiveLabels = requestedLabels
      ? resolveLabels(requestedLabels, supportsLabel, visibleLabels, beside)
      : nativeLabels
    const requestedCheckable =
      checkable.value.status === 'answered' ? checkable.value.value : 'adapt'
    // Adapt follows effective placement, including native defaults and fallback.
    // Responsive stacking is fulfilled by the backend without hiding labels.
    const adaptiveCheckable = effectiveLabels.startsWith('beside')
      ? 'control-aligned'
      : 'flushed'
    const selectedCheckable =
      requestedCheckable === 'adapt' ? adaptiveCheckable : requestedCheckable
    const checkableMode = !field.checkable
      ? undefined
      : !defaults.checkableModes ||
          defaults.checkableModes.includes(selectedCheckable)
        ? selectedCheckable
        : defaults.checkableModes.includes(adaptiveCheckable)
          ? adaptiveCheckable
          : 'flushed'
    const checkableLabels: ResolvedLabels =
      checkableMode === 'separated' ||
      (field.group && checkableMode === 'control-aligned')
        ? beside(
            // Resolve text alignment separately for supported checkable columns.
            requestedLabels?.startsWith('beside')
              ? requestedLabels
              : effectiveLabels.startsWith('beside')
                ? (effectiveLabels as BesideLabels)
                : 'beside',
          )
        : field.group
          ? 'above'
          : 'adjacent'
    const resolvedLabels = field.checkable ? checkableLabels : effectiveLabels
    const labelAlignment =
      resolvedLabels === 'beside-near'
        ? 'near'
        : resolvedLabels === 'beside-far'
          ? 'far'
          : undefined
    const markerPosition =
      typeof defaults.requiredAnnotations === 'function'
        ? defaults.requiredAnnotations()
        : (defaults.requiredAnnotations ?? 'suffix')
    const requestedAnnotations =
      annotations.value.status === 'answered'
        ? annotations.value.value
        : (
              typeof defaults.showRequiredAnnotations === 'function'
                ? defaults.showRequiredAnnotations()
                : (defaults.showRequiredAnnotations ?? true)
            )
          ? 'yes'
          : 'no'
    const requiredAnnotations =
      requestedAnnotations === 'yes' ? markerPosition : requestedAnnotations
    const helpMode =
      help.value.status === 'answered'
        ? help.value.value
        : (defaults.help ?? 'replace-help')
    const requestedFailure =
      failure.value.status === 'answered' ? failure.value.value : undefined
    const modes = defaults.failureModes ?? (['show-below'] as const)
    const nativeFailure = defaults.defaultFailure?.() ?? modes[0]
    const visibleFailure = nativeFailure === 'none' ? modes[0] : nativeFailure
    const resolvedFailure = !requestedFailure
      ? nativeFailure
      : requestedFailure === 'none'
        ? 'none'
        : (requestedFailure === 'show-below' ||
              requestedFailure === 'show-embedded' ||
              requestedFailure === 'show-tooltip') &&
            modes.includes(requestedFailure)
          ? requestedFailure
          : visibleFailure
    const failureMode =
      resolvedFailure === 'show-tooltip' &&
      modes.includes('show-below') &&
      needsInlineFailure()
        ? 'show-below'
        : resolvedFailure
    const showFailure = failureMode !== 'none'
    const issue = showFailure ? field.issue : null
    const descriptions = filterDescriptions(
      field.describedBy,
      field.id,
      issue,
      helpMode,
      showFailure,
    )
    return {
      active: [
        labels.value,
        checkable.value,
        annotations.value,
        help.value,
        failure.value,
      ].some((answer) => answer.status === 'answered'),
      labelsSpecified: labels.value.status === 'answered',
      requestedLabels,
      checkableMode,
      labelAlignment,
      checkableLabelAlignment: field.checkable ? labelAlignment : undefined,
      labels: resolvedLabels,
      requiredAnnotations,
      annotationsSpecified: annotations.value.status === 'answered',
      failureSpecified: failure.value.status === 'answered',
      markerPosition:
        requiredAnnotations === 'no' ? markerPosition : requiredAnnotations,
      marker:
        field.requiredLabel && requiredAnnotations !== 'no'
          ? 'required'
          : undefined,
      help: helpMode,
      requestedFailure,
      failure: failureMode,
      showFailure,
      issue,
      showHelp: Boolean(field.help && !(issue && helpMode === 'replace-help')),
      describedBy: descriptions,
    } as const
  })
  const feedback =
    defaults.feedbackRoot &&
    useFieldFeedbackTiming(
      defaults.feedbackRoot,
      () => policy.value.issue,
      () => policy.value.showHelp,
    )
  const presentation = computed(() => ({
    ...policy.value,
    inlineFeedbackDeferred: feedback?.deferred.value ?? false,
    showHelp: feedback?.deferred.value
      ? feedback.previousHelp.value
      : policy.value.showHelp,
  }))
  provide(key, presentation)
  return presentation
}
const key: InjectionKey<
  ComputedRef<ReturnType<typeof useUiFieldStrategies>['value']>
> = Symbol('uninterface.field-strategies')
export function useUiFieldStrategyContext() {
  return inject(key, undefined)
}

function filterDescriptions(
  describedBy: string | undefined,
  id: string,
  issue: unknown,
  help: 'together' | 'replace-help',
  showFailure: boolean,
) {
  return (
    describedBy
      ?.split(/\s+/)
      .filter(
        (value) =>
          value &&
          !(value === `${id}-issue` && !showFailure) &&
          !(value === `${id}-help` && issue && help === 'replace-help'),
      )
      .join(' ') || undefined
  )
}

/** Visual error state only. Never use this to overwrite semantic aria-invalid. */
export function useUiFieldFailure(binding: () => { invalid: boolean }) {
  return computed(() => binding().invalid)
}

/** Preserve caller descriptions and remove associations only to hidden feedback. */
export function useUiFieldDescription(
  binding: () => { id: string; describedBy?: string; invalid: boolean },
  defaultHelp: 'together' | 'replace-help' = 'together',
) {
  const policy = useUiFieldStrategyContext()
  return computed(() => {
    const value = binding()
    const showFailure = policy?.value.showFailure !== false
    return filterDescriptions(
      value.describedBy,
      value.id,
      value.invalid && showFailure,
      policy?.value.help ?? defaultHelp,
      showFailure,
    )
  })
}
