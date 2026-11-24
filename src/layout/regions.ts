import { participatesInLayout } from '../components/internal/participation'
import { Comment, Fragment, Text, isVNode } from 'vue'
import type { UiLayoutProps } from './linear'
import type { UiRegionResizeBoundary } from './region-boundaries'
import type { UiRegionScrollPolicy } from './scroll-policy'

export interface UiRegionLayoutDivision {
  start?: number | 'content'
  main?: number | 'content'
  end?: number | 'content'
}

export interface UiRegionLayoutProps
  extends Omit<UiLayoutProps, 'division' | 'wrap' | 'align'> {
  align?: Exclude<UiLayoutProps['align'], 'baseline'>
  /** Designate a supporting allocation as navigation; its adjoining frame may own separation. */
  navigationRegion?: 'start' | 'end'
  division?: UiRegionLayoutDivision
  scrollPolicy?: UiRegionScrollPolicy
  resizeBoundaries?: readonly UiRegionResizeBoundary[]
}

export const regionNames = ['start', 'main', 'end'] as const

/** Inspect slot output, without executing child components or changing their keys. */
export function hasRegionContent(nodes: readonly unknown[]): boolean {
  return nodes.some((node) => {
    if (Array.isArray(node)) return hasRegionContent(node)
    if (typeof node === 'string') return Boolean(node.trim())
    if (typeof node === 'number') return true
    if (!isVNode(node) || node.type === Comment) return false
    if (node.type === Text) return Boolean(String(node.children ?? '').trim())
    if (node.type === Fragment)
      return hasRegionContent(Array.isArray(node.children) ? node.children : [])
    return participatesInLayout(node)
  })
}

/** Project stable named shares onto the currently participating regions. */
export function resolveRegions(
  props: UiRegionLayoutProps,
  participating: readonly (typeof regionNames)[number][],
): (number | 'content')[] {
  const division = props.division === undefined ? {} : props.division
  if (!division || typeof division !== 'object' || Array.isArray(division))
    throw new Error(
      'UiRegionLayout: division must be a named region allocation.',
    )
  for (const [region, share] of Object.entries(division)) {
    if (!regionNames.includes(region as (typeof regionNames)[number]))
      throw new Error(`UiRegionLayout: unknown division region ${region}.`)
    if (
      share !== undefined &&
      share !== 'content' &&
      (typeof share !== 'number' || !Number.isFinite(share) || share <= 0)
    )
      throw new Error(
        'UiRegionLayout: shares must be positive finite numbers or "content".',
      )
  }
  const fillsAxis =
    props.direction === 'horizontal'
      ? (props.width ?? 'full') === 'full'
      : (props.height ?? 'content') === 'full'
  return participating.map(
    (region) =>
      division[region] ?? (region === 'main' && fillsAxis ? 1 : 'content'),
  )
}
