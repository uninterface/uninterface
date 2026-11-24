/** Ordinary content hosting; concrete insets belong to the backend. */
export interface UiContentProps {
  inset?: 'default' | 'none'
  height?: 'content' | 'full'
  scroll?: 'none' | 'horizontal' | 'vertical' | 'both'
  'aria-label'?: string
}

export function resolveContent(props: UiContentProps) {
  const inset = props.inset ?? 'default'
  const height = props.height ?? 'content'
  const scroll = props.scroll ?? 'none'
  if (!['default', 'none'].includes(inset))
    throw new Error('UiContent: unsupported inset.')
  if (!['content', 'full'].includes(height))
    throw new Error('UiContent: unsupported height.')
  if (!['none', 'horizontal', 'vertical', 'both'].includes(scroll))
    throw new Error('UiContent: unsupported scroll.')
  if (scroll !== 'none' && !props['aria-label']?.trim())
    throw new Error(
      'UiContent: a scroll region requires a meaningful aria-label.',
    )
  if ((scroll === 'vertical' || scroll === 'both') && height !== 'full')
    throw new Error(
      'UiContent: vertical scrolling requires full height in a bounded parent.',
    )
  return { inset, height, scroll, label: props['aria-label'] }
}
