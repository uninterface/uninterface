/** Read-only expansion state and request routing, independent of the producer. */
export interface UiCollapsibleBinding {
  readonly target: 'collapsible'
  readonly expanded: boolean
  readonly disabled: boolean
  readonly requestExpanded: (expanded: boolean) => void
}

export function assertCollapsibleBinding(binding: UiCollapsibleBinding) {
  if (
    binding.target !== 'collapsible' ||
    typeof binding.expanded !== 'boolean' ||
    typeof binding.disabled !== 'boolean' ||
    typeof binding.requestExpanded !== 'function'
  )
    throw new Error('UiCollapsible: incompatible collapsible binding.')
}
