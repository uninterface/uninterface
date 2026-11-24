import type { UiLayoutProps } from './linear'
import { resolveLayout } from './linear'

/** Equal-width, row-major allocation with an explicit reactive column count. */
export interface UiGridLayoutProps
  extends Pick<
    UiLayoutProps,
    'height' | 'scroll' | 'aria-label' | 'zOrder' | 'zParts'
  > {
  columns: number
}

export function resolveGrid(props: UiGridLayoutProps) {
  if (!Number.isSafeInteger(props.columns) || props.columns <= 0)
    throw new Error('UiGridLayout: columns must be a positive safe integer.')
  // Extent/scrolling semantics are shared with other layouts.
  const { height, scroll } = resolveLayout(
    {
      height: props.height,
      scroll: props.scroll,
      'aria-label': props['aria-label'],
    },
    0,
  )
  return { columns: props.columns, height, scroll }
}
