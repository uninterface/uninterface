import {
  createUiCollectionFilter,
  extendFilterControl,
  type UiCollectionFilterSource,
} from '../filter'
import { createUiFieldControl } from '../../controls/field'
import { createUiFilterFieldEditor } from '../filter-field'
import { createFilterPatternView } from './view'
import { filterRangeCompact } from './range-views'
import { uiRangeFilterPresentationQuery } from '../../strategy/filter-presentation'
import type { UiCodec } from '../../controls/codec'
import type {
  UiRangeFilterDefinition,
  UiRangeFilterControl,
  UiRangeFilterEditorBinding,
  UiFilterRange,
  UiRangeFilterDraft,
} from './types'

export function createUiRangeFilterControl<F, T>(
  definition: UiRangeFilterDefinition<F, T>,
  source: UiCollectionFilterSource<F>,
): UiRangeFilterControl<T> {
  let editor!: UiRangeFilterEditorBinding<T>
  const codec: UiCodec<UiFilterRange<T>, UiRangeFilterDraft> = {
    format: (value) => ({
      minimum:
        value.minimum === undefined
          ? ''
          : definition.codec.format(value.minimum),
      maximum:
        value.maximum === undefined
          ? ''
          : definition.codec.format(value.maximum),
    }),
    async parse(draft) {
      const minimum = draft.minimum.trim()
        ? await definition.codec.parse(draft.minimum)
        : { ok: true as const, value: undefined }
      if (!minimum.ok) return minimum
      const maximum = draft.maximum.trim()
        ? await definition.codec.parse(draft.maximum)
        : { ok: true as const, value: undefined }
      if (!maximum.ok) return maximum
      return {
        ok: true,
        value: { minimum: minimum.value, maximum: maximum.value },
      }
    },
  }
  const control = createUiCollectionFilter(
    {
      ...definition,
      createEditor(context) {
        const field = createUiFieldControl(
          context.initialValue,
          codec,
          [
            (value) => {
              if (value.minimum === undefined || value.maximum === undefined)
                return null
              const order = definition.compare(value.minimum, value.maximum)
              if (!Number.isFinite(order))
                throw new Error('Range comparator must return a finite number.')
              return order <= 0
                ? null
                : typeof definition.invalidRange === 'function'
                  ? definition.invalidRange()
                  : (definition.invalidRange ?? {
                      namespace: 'uninterface',
                      key: 'filterRangeInvalid',
                    })
            },
            ...(definition.rules ?? []),
          ],
          {
            inputEquals: (a, b) =>
              a.minimum === b.minimum && a.maximum === b.maximum,
          },
        )
        editor = Object.freeze({
          pattern: 'range',
          field,
          get minimumLabel() {
            return definition.minimumLabel
          },
          get maximumLabel() {
            return definition.maximumLabel
          },
          get minimumPlaceholder() {
            return definition.minimumPlaceholder
          },
          get maximumPlaceholder() {
            return definition.maximumPlaceholder
          },
          get applyLabel() {
            return definition.applyLabel
          },
          get clearLabel() {
            return definition.clearLabel
          },
          get inputmode() {
            return definition.inputmode
          },
        })
        return createUiFilterFieldEditor(
          context,
          field,
          createFilterPatternView(
            editor,
            uiRangeFilterPresentationQuery,
            () => filterRangeCompact,
          ),
        )
      },
    },
    source,
  )
  return extendFilterControl(control, { pattern: 'range' as const, editor })
}
