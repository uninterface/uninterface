import type { UiTableColumnDefinition } from '../bindings/table-column'

const length = /^(?:\d+(?:\.\d+)?|\.\d+)(px|rem|em)$/
export function validateColumnSizing(column: UiTableColumnDefinition) {
  for (const key of ['preferredWidth', 'minWidth'] as const) {
    const value = column[key]
    if (
      value !== undefined &&
      value !== 'content' &&
      !(typeof value === 'number'
        ? Number.isFinite(value) && value > 0
        : typeof value === 'string' &&
          length.test(value) &&
          parseFloat(value) > 0)
    )
      throw new Error(
        `Column ${key} requires content, a positive pixel number or px/rem/em length.`,
      )
  }
  for (const key of ['spring', 'resizable'] as const)
    if (column[key] !== undefined && typeof column[key] !== 'boolean')
      throw new Error(`Column ${key} must be boolean.`)
  if (
    column.align !== undefined &&
    !['left', 'center', 'right'].includes(column.align)
  )
    throw new Error('Column align must be left, center or right.')
}
export function columnPixels(
  value: string | number | undefined,
  fallback: number,
  em: number,
  rem: number,
) {
  if (value === undefined) return fallback
  if (typeof value === 'number') return value
  return (
    parseFloat(value) *
    (value.endsWith('rem') ? rem : value.endsWith('em') ? em : 1)
  )
}
export interface ColumnAllocation {
  preferred: number
  min: number
  spring: boolean
}
/** Allocation only; measurement, native markup and feedback stay with the view. */
export function allocateColumns(
  columns: readonly ColumnAllocation[],
  available: number,
  allowOverflow: boolean,
) {
  if (columns.length && !columns.some((c) => c.spring))
    throw new Error('A table requires at least one spring column.')
  const widths = columns.map((c) => Math.max(c.min, c.preferred))
  let remainder = available - widths.reduce((a, b) => a + b, 0)
  if (remainder > 0) {
    const count = columns.filter((c) => c.spring).length
    columns.forEach((c, i) => {
      if (c.spring) widths[i] += remainder / count
    })
  } else {
    let active = columns.flatMap((c, i) =>
      c.spring && widths[i] > c.min ? [i] : [],
    )
    while (remainder < -0.001 && active.length) {
      const share = -remainder / active.length
      for (const i of active) {
        const shrink = Math.min(share, widths[i] - columns[i].min)
        widths[i] -= shrink
        remainder += shrink
      }
      active = active.filter((i) => widths[i] > columns[i].min + 0.001)
    }
  }
  const total = widths.reduce((a, b) => a + b, 0)
  return { widths, total, fits: allowOverflow || total <= available + 0.5 }
}
export function resizeColumns(
  widths: readonly number[],
  minima: readonly number[],
  index: number,
  delta: number,
) {
  const next = [...widths]
  if (index < 0 || index + 1 >= next.length) return next
  const change = Math.max(
    minima[index] - next[index],
    Math.min(delta, next[index + 1] - minima[index + 1]),
  )
  next[index] += change
  next[index + 1] -= change
  return next
}
