import type { UiThemeColor } from './theme'
import type { UiZOrder } from '../stacking/authoring'

/** Passive observation of completed work; operation lifetime stays with its owner. */
export interface UiProgressBarProps {
  'aria-label': string
  value?: number | null
  max?: number
  'aria-valuetext'?: string
  color?: UiThemeColor
  zOrder?: UiZOrder
}

/** One semantic resolution path for standalone and composed bars. */
export function resolveProgressBar(props: UiProgressBarProps) {
  const value = props.value ?? null
  const max = props.max === undefined ? 100 : props.max
  if (typeof props['aria-label'] !== 'string' || !props['aria-label'].trim())
    throw new Error('UiProgressBar requires a nonempty aria-label.')
  if (!Number.isFinite(max) || max <= 0)
    throw new Error('UiProgressBar max must be finite and greater than zero.')
  if (value !== null && (!Number.isFinite(value) || value < 0 || value > max))
    throw new Error('UiProgressBar value must be finite and within 0..max.')
  if (
    props['aria-valuetext'] !== undefined &&
    typeof props['aria-valuetext'] !== 'string'
  )
    throw new Error('UiProgressBar aria-valuetext must be a string.')
  return {
    value,
    max,
    fraction: value === null ? null : value / max,
    label: props['aria-label'],
    valueText: props['aria-valuetext'],
    color: props.color === undefined ? ('primary' as const) : props.color,
  }
}
