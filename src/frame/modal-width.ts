/** Shared outer-width policy. Backend surfaces own viewport clearance and native insets. */
export interface ModalWidthOptions {
  width?: 'auto' | 'available'
  preferredWidth?: number | string
  minWidth?: number | string
  maxWidth?: number | string
}
const length = /^(?:\d+(?:\.\d+)?|\.\d+)(px|rem|em)$/
const percentage = /^(?:\d+(?:\.\d+)?|\.\d+)%$/
export function validateModalWidth(options: ModalWidthOptions) {
  if (
    options.width !== undefined &&
    !['auto', 'available'].includes(options.width)
  )
    throw new Error('UiModal width must be auto or available.')
  if (options.width === 'available' && options.preferredWidth !== undefined)
    throw new Error(
      'UiModal available width cannot also specify preferredWidth.',
    )
  for (const key of ['preferredWidth', 'minWidth', 'maxWidth'] as const) {
    const value = options[key]
    if (value === undefined) continue
    const valid =
      typeof value === 'number'
        ? Number.isFinite(value) && value > 0
        : typeof value === 'string' &&
          ((length.test(value) && parseFloat(value) > 0) ||
            (key === 'preferredWidth' &&
              percentage.test(value) &&
              parseFloat(value) > 0 &&
              parseFloat(value) <= 100))
    if (!valid)
      throw new Error(
        `UiModal ${key} requires a positive px/rem/em length${key === 'preferredWidth' ? ' or a percentage up to 100%' : ''}.`,
      )
  }
}
export function modalLengthPixels(
  value: number | string,
  em: number,
  rem: number,
) {
  if (typeof value === 'number') return value
  return (
    parseFloat(value) *
    (value.endsWith('rem') ? rem : value.endsWith('em') ? em : 1)
  )
}
export function validateModalWidthBounds(
  options: ModalWidthOptions,
  em: number,
  rem: number,
) {
  validateModalWidth(options)
  if (
    options.minWidth !== undefined &&
    options.maxWidth !== undefined &&
    modalLengthPixels(options.minWidth, em, rem) >
      modalLengthPixels(options.maxWidth, em, rem)
  )
    throw new Error('UiModal minWidth must not exceed maxWidth.')
}
const cssLength = (value: number | string) =>
  typeof value === 'number' ? `${value}px` : value
export function modalWidthExpression(options: ModalWidthOptions) {
  validateModalWidth(options)
  const available = 'var(--uninterface-modal-available-width)'
  const preferred =
    options.width === 'available'
      ? available
      : typeof options.preferredWidth === 'string' &&
          options.preferredWidth.endsWith('%')
        ? `calc(${available} * ${parseFloat(options.preferredWidth) / 100})`
        : cssLength(options.preferredWidth ?? '32rem')
  return `min(${available}, ${options.maxWidth === undefined ? available : cssLength(options.maxWidth)}, max(${cssLength(options.minWidth ?? 0)}, ${preferred}))`
}
