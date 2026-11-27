import type { CSSProperties } from 'vue'
import type { UiLayoutViewBinding } from './index'

export function startEndLayoutItemStyle(
  binding: UiLayoutViewBinding,
  key: string,
): CSSProperties | undefined {
  if (!binding.startEnd) return
  return {
    flex: '0 0 auto',
    maxInlineSize: '100%',
    // The auto margin consumes spare space on the end group's own flex line.
    marginInlineStart: key === 'end' ? 'auto' : undefined,
  }
}
