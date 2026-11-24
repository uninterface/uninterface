import { nextTick, type Ref } from 'vue'
import type { UiFocusHandle } from '../../backend'

export async function focusControl(
  view: Ref<UiFocusHandle | undefined>,
  disabled: () => boolean,
): Promise<boolean | null> {
  await nextTick()
  if (disabled()) return false
  return view.value ? view.value.focus() : false
}
