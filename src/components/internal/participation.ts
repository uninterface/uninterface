import type { VNode } from 'vue'

// Explicit core-component participation, never inspect opaque component internals.
// A containing layout tracks this predicate's reactive reads before allocating space.
export const layoutParticipation = Symbol('uninterface.layoutParticipation')
export function participatesInLayout(node: VNode): boolean {
  const type = node.type as {
    [layoutParticipation]?: (props: VNode['props']) => boolean
  }
  return type?.[layoutParticipation]?.(node.props) ?? true
}
