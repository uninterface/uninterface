import { computed, ref, watch } from 'vue'
import { useUiI18n } from '../i18n/context'
import { temporalPresentation } from '../temporal/presentation'
import type { UiTemporalEditorViewProps } from './index'
export function useUiTemporalEditor(props: UiTemporalEditorViewProps) {
  const i18n = useUiI18n()
  const focused = ref(false),
    text = ref(''),
    last = ref<string>()
  const context = computed(() => ({
    kind: props.kind,
    dateFormatWish: props.dateFormatWish,
    locale: props.presentation?.locale ?? i18n.state.value.formattingLocale,
    precision: props.precision,
    hourCycle: props.presentation?.hourCycle ?? ('h23' as const),
  }))
  // Keep the current draft's parsing grammar until editing ends.
  const activeContext = ref(context.value)
  const presentation = computed(() => temporalPresentation(activeContext.value))
  const format = (value: string) => presentation.value.format(value)
  const parse = (value: string) => presentation.value.parse(value)
  watch(
    () => props.value,
    (value) => {
      if (!focused.value || value !== last.value) text.value = format(value)
      last.value = undefined
    },
    { immediate: true },
  )
  watch(context, () => {
    if (!focused.value) {
      activeContext.value = context.value
      text.value = format(props.value)
    }
  })
  function update(value: string) {
    text.value = value
    last.value = parse(value)
    props.update(last.value)
  }
  async function blur() {
    focused.value = false
    activeContext.value = context.value
    const result = await props.blur()
    text.value = format(props.value)
    return result
  }
  return { text, focused, update, blur }
}
