import { participatesInLayout } from '../components/internal/participation'
import type { UiZLayoutProps } from '../stacking/authoring'
import { Comment, Fragment, Text, type VNode } from 'vue'

export interface UiLayoutOptions {
  direction?: 'horizontal' | 'vertical'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  division?: 'content' | 'equal' | readonly (number | 'content')[]
  width?: 'content' | 'full'
  height?: 'content' | 'full'
  wrap?: boolean
  scroll?: 'none' | 'horizontal' | 'vertical' | 'both'
}
export interface UiLayoutProps extends UiLayoutOptions, UiZLayoutProps {
  'aria-label'?: string
}
export interface UiResolvedLayout {
  direction: 'horizontal' | 'vertical'
  align: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  division: 'content' | 'equal' | readonly (number | 'content')[]
  width: 'content' | 'full'
  height: 'content' | 'full'
  wrap: boolean
  scroll: 'none' | 'horizontal' | 'vertical' | 'both'
}
const defaults: UiResolvedLayout = {
  direction: 'vertical',
  align: 'stretch',
  division: 'content',
  width: 'full',
  height: 'content',
  wrap: false,
  scroll: 'none',
}
const keys = Object.keys(defaults) as (keyof UiLayoutOptions)[]
function fail(message: string): never {
  throw new Error(`UiLayout: ${message}`)
}

export function resolveLayout(
  props: UiLayoutProps,
  count: number,
): UiResolvedLayout {
  const result = { ...defaults }
  for (const key of keys) {
    if (props[key] !== undefined) Object.assign(result, { [key]: props[key] })
  }
  for (const [key, allowed] of Object.entries({
    direction: ['horizontal', 'vertical'],
    align: ['start', 'center', 'end', 'stretch', 'baseline'],
    width: ['content', 'full'],
    height: ['content', 'full'],
    scroll: ['none', 'horizontal', 'vertical', 'both'],
  })) {
    if (!allowed.includes(result[key as 'direction']))
      fail(`unsupported ${key}.`)
  }
  if (result.align === 'baseline' && result.direction !== 'horizontal')
    fail('baseline alignment requires a horizontal layout.')
  if (typeof result.wrap !== 'boolean') fail('wrap must be a boolean.')
  const division = result.division
  if (Array.isArray(division)) {
    if (division.length !== count)
      fail('division must have one entry per participating child.')
    if (
      division.some(
        (value) =>
          value !== 'content' &&
          (typeof value !== 'number' || !Number.isFinite(value) || value <= 0),
      )
    ) {
      fail('division entries must be positive finite shares or "content".')
    }
  } else if (division !== 'content' && division !== 'equal')
    fail('unsupported division.')
  const shares =
    division === 'equal' ||
    (Array.isArray(division) && division.some((v) => typeof v === 'number'))
  if (
    shares &&
    result[result.direction === 'horizontal' ? 'width' : 'height'] !== 'full'
  ) {
    fail('proportional division requires full extent on the arrangement axis.')
  }
  if (
    result.wrap &&
    (result.direction !== 'horizontal' || division !== 'content')
  ) {
    fail('wrapping requires horizontal content division.')
  }
  if (result.scroll !== 'none' && !props['aria-label']?.trim())
    fail('a scroll region requires a meaningful aria-label.')
  if (['vertical', 'both'].includes(result.scroll) && result.height !== 'full')
    fail('vertical scrolling requires full height in a bounded parent.')
  if (['horizontal', 'both'].includes(result.scroll) && result.width !== 'full')
    fail('horizontal scrolling requires full width.')
  return result
}

/** Fragments and v-for are transparent; hidden/comment-only children take no share. */
export function layoutChildren(
  children: VNode[],
  symbolKeys = new Map<symbol, number>(),
): { key: string; node: VNode }[] {
  const result: { key: string; node: VNode }[] = []
  function visit(nodes: VNode[], prefix: string) {
    nodes.forEach((node, index) => {
      let identity = node.key
      if (typeof identity === 'symbol') {
        if (!symbolKeys.has(identity)) symbolKeys.set(identity, symbolKeys.size)
        identity = symbolKeys.get(identity)!
      }
      const part =
        node.key == null
          ? ['position', index]
          : ['key', typeof node.key, identity]
      const key = `${prefix}/${encodeURIComponent(JSON.stringify(part))}`
      if (node.type === Fragment) visit(node.children as VNode[], key)
      else if (
        node.type !== Comment &&
        participatesInLayout(node) &&
        !(node.type === Text && !String(node.children).trim())
      )
        result.push({ key, node })
    })
  }
  visit(children, '')
  if (new Set(result.map((item) => item.key)).size !== result.length)
    fail('child keys must be unique.')
  return result
}
