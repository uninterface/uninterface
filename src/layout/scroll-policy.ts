import type { UiRegionLayoutProps } from './regions'

export interface UiRegionScrollPolicy {
  groups: readonly {
    id: string
    regions: readonly ('start' | 'main' | 'end')[]
    axis: 'vertical'
    'aria-label': string
  }[]
}

export function resolveScrollPolicy(props: UiRegionLayoutProps) {
  const policy = props.scrollPolicy
  if (policy === undefined) return undefined
  const fail = (message: string): never => {
    throw new Error(`UiRegionLayout scroll-policy: ${message}`)
  }
  if (!policy || !Array.isArray(policy.groups) || policy.groups.length !== 1)
    fail('one scroll group is supported.')
  const group = policy.groups[0]
  if (!group || typeof group.id !== 'string' || !group.id.trim())
    fail('a nonempty group id is required.')
  if (
    group.axis !== 'vertical' ||
    (props.direction ?? 'vertical') !== 'vertical'
  )
    fail('this capability supports vertical groups in vertical arrangements.')
  const allowed = ['main', 'start,main', 'main,end', 'start,main,end']
  if (
    !Array.isArray(group.regions) ||
    !allowed.includes(group.regions.join(','))
  )
    fail('regions must be consecutive, ordered, unique and include main.')
  if (typeof group['aria-label'] !== 'string' || !group['aria-label'].trim())
    fail('the scroll group requires an aria-label.')
  if (!props['aria-label']?.trim())
    fail('the layout requires an aria-label for overflow access.')
  if (props.scroll !== undefined && props.scroll !== 'none')
    fail('whole-layout scroll and scroll-policy cannot be combined.')
  if (
    props.division !== undefined ||
    props.align !== undefined ||
    props.height !== undefined
  )
    fail(
      'group allocation owns height, alignment and division; omit these overrides.',
    )
  if (props.width !== undefined && props.width !== 'full')
    fail('group allocation requires full width.')
  return { ...group, regions: [...group.regions] }
}
