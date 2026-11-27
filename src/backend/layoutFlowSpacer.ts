import type { CSSProperties } from 'vue'
import type { UiLayoutViewBinding } from './index'

export function flowSpacerLayoutStyle(
  binding: UiLayoutViewBinding,
): CSSProperties | undefined {
  if (!binding.spacers?.length) return
  return {
    display: 'flex',
    flexDirection: binding.direction === 'horizontal' ? 'row' : 'column',
    alignItems: binding.align,
  }
}

export function flowSpacerItemStyle(
  binding: UiLayoutViewBinding,
  key: string,
  gap: string,
): CSSProperties | undefined {
  if (!binding.spacers?.length) return
  if (!binding.spacers.includes(key)) {
    // An oversized peer may overflow its wrapper, but its wrapper must fit
    // on one line so the following spacer can stay at that line's end.
    return binding.wrap ? { maxInlineSize: '100%' } : undefined
  }

  const vertical = binding.direction === 'vertical'
  const full = vertical ? binding.height === 'full' : binding.width === 'full'
  const style: CSSProperties = { flex: full ? '1 0 0px' : '0 0 0px' }
  if (binding.items.length === 1) return style

  // Remove the one peer gap introduced by this empty item. An interior
  // spacer fits at the end of the preceding line when its next peer wraps.
  const first = key === binding.items[0]
  if (first && binding.items.length === binding.spacers.length) return style
  const offset = `calc(0px - (${gap}))`
  if (vertical) {
    if (first) style.marginBlockEnd = offset
    else style.marginBlockStart = offset
  } else if (first) style.marginInlineEnd = offset
  else style.marginInlineStart = offset
  return style
}
