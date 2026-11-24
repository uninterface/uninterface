/** Producer-independent expansion projection for a persistent drawer panel. */
export interface UiDrawerBinding {
  readonly target: 'drawer'
  readonly expanded: boolean
  readonly disabled: boolean
  readonly requestExpanded: (expanded: boolean) => void
}
export function assertDrawerBinding(binding: UiDrawerBinding) {
  if (
    binding.target !== 'drawer' ||
    typeof binding.expanded !== 'boolean' ||
    typeof binding.disabled !== 'boolean' ||
    typeof binding.requestExpanded !== 'function'
  )
    throw new Error('UiDrawer requires a drawer expansion binding.')
}
