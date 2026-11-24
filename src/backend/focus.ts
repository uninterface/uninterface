import { nextTick } from 'vue'

/** Focus and verify a backend-owned DOM target after pending Vue updates. */
export async function focusUiTarget(
  target: () => HTMLElement | null | undefined,
  disabled: () => boolean,
): Promise<boolean | null> {
  await nextTick()
  if (disabled()) return false
  const element = target()
  if (!element || !element.isConnected) return false
  element.focus()
  await nextTick()
  return !disabled() && element.matches(':focus')
}
