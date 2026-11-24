/** Width preferences for the cards-grid presentation, independent of list state. */
export interface UiCollectionPresentationOptions {
  minWidth?: string
  maxWidth?: string | 'default'
  stretchSingleColumn?: boolean
}

export function validateCollectionPresentationOptions(
  value: UiCollectionPresentationOptions | undefined,
): UiCollectionPresentationOptions | undefined {
  if (value === undefined) return undefined
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('UiCollectionView presentationOptions must be an object.')
  for (const key of Object.keys(value))
    if (
      key !== 'minWidth' &&
      key !== 'maxWidth' &&
      key !== 'stretchSingleColumn'
    )
      throw new Error(`UiCollectionView: unknown presentation option ${key}.`)
  for (const key of ['minWidth', 'maxWidth'] as const) {
    const width = value[key]
    if (width === undefined || (key === 'maxWidth' && width === 'default'))
      continue
    if (
      typeof width !== 'string' ||
      !/^(?:\d+(?:\.\d+)?|\.\d+)(?:rem|em|px)$/.test(width) ||
      !Number.isFinite(parseFloat(width)) ||
      parseFloat(width) <= 0
    )
      throw new Error(
        `UiCollectionView ${key} must be a positive rem, em or px length${key === 'maxWidth' ? ' or default' : ''}.`,
      )
  }
  if (
    value.stretchSingleColumn !== undefined &&
    typeof value.stretchSingleColumn !== 'boolean'
  )
    throw new Error('UiCollectionView stretchSingleColumn must be a boolean.')
  const { minWidth, maxWidth, stretchSingleColumn } = value
  if (
    minWidth &&
    maxWidth &&
    maxWidth !== 'default' &&
    minWidth.replace(/[\d.]/g, '') === maxWidth.replace(/[\d.]/g, '') &&
    parseFloat(minWidth) > parseFloat(maxWidth)
  )
    throw new Error('UiCollectionView maxWidth must be at least minWidth.')
  return { minWidth, maxWidth, stretchSingleColumn }
}
