import { h } from 'vue'
import RangeSurface from './views/RangeSurface.vue'
import UiButton from '../../components/UiButton.vue'
import UiIcon from '../../components/UiIcon.vue'
import UiInputFrame from '../../components/UiInputFrame.vue'
import UiTextInput from '../../components/UiTextInput.vue'
import UiLayout from '../../components/UiLayout.vue'
import type { UiInputProjection } from '../../input-frame/projection'
import type {
  UiFilterAdaptation,
  UiFilterViewContext,
  UiRangeFilterEditorBinding,
} from './types'
type Context = UiFilterViewContext<UiRangeFilterEditorBinding<any>>
type Parts = {
  minimum: UiInputProjection
  maximum: UiInputProjection
  applyLabel: string
  clearLabel: string
  minimumPlaceholder: string
  maximumPlaceholder: string
}
function input(
  context: Context,
  projection: UiInputProjection,
  placeholder: string,
) {
  return h(UiTextInput, {
    projection,
    inputmode: context.editor.inputmode ?? 'text',
    placeholder,
  })
}
function actions(context: Context, parts: Parts) {
  // Read live context inside the input-frame slot; a copied slot boolean can
  // outlive its render when the same editor moves between presentation contexts.
  return [
    context.binding.editing.commit === 'explicit' &&
      ['table-column', 'filter-badge'].includes(context.presentation.usage) &&
      context.presentation.container === 'popover' &&
      h(
        UiButton,
        {
          type: 'submit',
          disabled: context.binding.disabled,
          loading: context.binding.validating,
          variant: 'icon',
          color: 'success',
        },
        {
          icon: () => h(UiIcon, { name: 'confirm' }),
          default: () => parts.applyLabel,
        },
      ),
    h(
      UiButton,
      {
        disabled: !context.binding.canClear,
        variant: 'icon',
        color: 'danger',
        onClick: () => context.clear(),
      },
      {
        icon: () => h(UiIcon, { name: 'clear' }),
        default: () => parts.clearLabel,
      },
    ),
  ]
}
export const filterRangeCompact: UiFilterAdaptation<
  UiRangeFilterEditorBinding<any>
> = /* @__PURE__ */ Object.freeze<
  UiFilterAdaptation<UiRangeFilterEditorBinding<any>>
>({
  name: 'range-compact',
  pattern: 'range',
  view: (context) =>
    h(
      RangeSurface,
      { context },
      {
        default: (parts: Parts) =>
          h(
            UiInputFrame,
            {},
            {
              default: () => [
                input(context, parts.minimum, parts.minimumPlaceholder),
                h('span', { 'aria-hidden': 'true' }, '~'),
                input(context, parts.maximum, parts.maximumPlaceholder),
              ],
              trailing: () => actions(context, parts),
            },
          ),
      },
    ),
})
export const filterRangeStacked: UiFilterAdaptation<
  UiRangeFilterEditorBinding<any>
> = /* @__PURE__ */ Object.freeze<
  UiFilterAdaptation<UiRangeFilterEditorBinding<any>>
>({
  name: 'range-stacked',
  pattern: 'range',
  view: (context) =>
    h(
      RangeSurface,
      { context },
      {
        default: (parts: Parts) =>
          h(
            UiLayout,
            { direction: 'vertical' },
            {
              default: () => [
                h(
                  UiInputFrame,
                  { key: 'minimum' },
                  {
                    default: () =>
                      input(context, parts.minimum, parts.minimumPlaceholder),
                  },
                ),
                h(
                  UiInputFrame,
                  { key: 'maximum' },
                  {
                    default: () =>
                      input(context, parts.maximum, parts.maximumPlaceholder),
                    trailing: () => actions(context, parts),
                  },
                ),
              ],
            },
          ),
      },
    ),
})
