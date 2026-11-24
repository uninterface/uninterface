import { h } from 'vue'
import ChoiceSurface from './views/ChoiceSurface.vue'
import UiCheckboxGroup from '../../components/UiCheckboxGroup.vue'
import UiRadioGroup from '../../components/UiRadioGroup.vue'
import UiSelect from '../../components/UiSelect.vue'
import UiMultiSelect from '../../components/UiMultiSelect.vue'
import type {
  UiFilterAdaptation,
  UiFilterViewContext,
  UiChoiceFilterEditorBinding,
} from './types'

export const filterChoiceList: UiFilterAdaptation<
  UiChoiceFilterEditorBinding<any>
> = /* @__PURE__ */ Object.freeze<
  UiFilterAdaptation<UiChoiceFilterEditorBinding<any>>
>({
  name: 'choice-list',
  pattern: 'choice',
  view: (context) =>
    h(
      ChoiceSurface,
      { context, group: true },
      {
        default: () =>
          context.editor.selection === 'multiple'
            ? h(UiCheckboxGroup, { control: context.editor.choices })
            : h(UiRadioGroup, { control: context.editor.choices }),
      },
    ),
})
export const filterChoiceSelect: UiFilterAdaptation<
  UiChoiceFilterEditorBinding<any>
> = /* @__PURE__ */ Object.freeze<
  UiFilterAdaptation<UiChoiceFilterEditorBinding<any>>
>({
  name: 'choice-select',
  pattern: 'choice',
  view: (context) =>
    h(
      ChoiceSurface,
      { context },
      {
        default: () =>
          context.editor.selection === 'multiple'
            ? h(UiMultiSelect, { control: context.editor.choices })
            : h(UiSelect, { control: context.editor.choices }),
      },
    ),
})
export function defaultChoiceAdaptation(
  context: UiFilterViewContext<UiChoiceFilterEditorBinding<any>>,
) {
  const collection = context.editor.choices.collection()
  const items = collection.entries.filter((entry) => entry.kind !== 'separator')
  const value = context.editor.field.state.input
  const selected: readonly string[] = Array.isArray(value) ? value : [value]
  return selected.every((key) => items.some((entry) => entry.key === key)) &&
    ['table-column', 'filter-badge'].includes(context.presentation.usage) &&
    context.presentation.container === 'popover' &&
    collection.status === 'ready' &&
    items.length > 0 &&
    items.length <= 6 &&
    items.every((entry) => !entry.kind || entry.kind === 'item')
    ? filterChoiceList
    : filterChoiceSelect
}
