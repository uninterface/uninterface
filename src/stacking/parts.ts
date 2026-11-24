import {
  UiZOrderError,
  type UiZBand,
  type UiZHandle,
  type UiZOrder,
  type ZRegistration,
} from './model'

export type ZPartSelector = string | number | object | null | undefined
export type ZPartOrder = {
  band?: UiZBand
} & (
  | { position?: number; above?: never; below?: never }
  | {
      position?: never
      above?: readonly ZPartSelector[]
      below?: readonly ZPartSelector[]
    }
)
export type ZParts =
  | Readonly<Record<string, ZPartOrder>>
  | readonly { part: ZPartSelector; order: ZPartOrder }[]
export interface ZPart {
  readonly handle: UiZHandle
  readonly name?: string
  /** Outward component identity, distinct from the allocation identity. */
  readonly child?: UiZHandle
}

/** Resolve aliases before detecting duplicates. Source order is supplied before paint ordering. */
export function normalizeZParts(options: {
  declarations?: ZParts
  parts: readonly ZPart[]
  parent: UiZHandle
  /** Region layouts supply their fixed name vocabulary; other layouts use indices. */
  names?: readonly string[]
  reference: (object: object) => UiZHandle | undefined
  live: (handle: UiZHandle) => boolean
}) {
  const { parts, parent } = options
  const fail = (message: string): never => {
    throw new UiZOrderError('declaration', message, [`${parent.label}:zParts`])
  }
  const pending: ZPartSelector[] = []
  const select = (selector: ZPartSelector): UiZHandle | undefined => {
    if (selector == null) {
      pending.push(selector)
      return
    }
    if (typeof selector === 'number' || typeof selector === 'string') {
      if (options.names) {
        if (typeof selector !== 'string' || !options.names.includes(selector))
          fail('unknown named allocation.')
        const part = parts.find((p) => p.name === selector)
        if (!part) pending.push(selector)
        return part?.handle
      }
      if (typeof selector === 'string' && !/^(0|[1-9][0-9]*)$/.test(selector))
        fail('indices must be canonical zero-based integers.')
      const index = Number(selector)
      if (!Number.isSafeInteger(index) || index < 0 || index >= parts.length)
        fail('allocation index is out of range.')
      return parts[index]!.handle
    }
    const handle = options.reference(selector)
    if (!handle) {
      pending.push(selector)
      return
    }
    if (handle.domain !== parent.domain)
      throw new UiZOrderError(
        'domain',
        'allocation reference belongs to another domain.',
        [parent.label],
      )
    const matches = parts.filter(
      (p) => p.handle === handle || p.child === handle,
    )
    if (matches.length > 1) fail('ambiguous allocation reference.')
    if (matches.length === 1) return matches[0]!.handle
    if (options.live(handle))
      fail('reference is not a direct allocation of this layout.')
    pending.push(selector)
  }
  const declarations = options.declarations ?? []
  if (typeof declarations !== 'object' || declarations === null)
    fail('zParts must be an entry list or a shorthand map.')
  const entries = Array.isArray(declarations)
    ? declarations
    : Object.entries(declarations).map(([part, order]) => ({ part, order }))
  const orders = new Map<UiZHandle, UiZOrder>()
  for (const entry of entries) {
    if (
      !entry ||
      !('part' in entry) ||
      !entry.order ||
      typeof entry.order !== 'object'
    )
      fail('invalid part declaration.')
    const handle = select(entry.part)
    if (!handle) continue
    if (orders.has(handle))
      fail('duplicate selectors address the same allocation.')
    const input = entry.order as ZPartOrder
    if ('parent' in input || 'layer' in input)
      fail('allocation attachment belongs to its layout.')
    if (
      input.position !== undefined &&
      (!Number.isFinite(input.position) ||
        input.above !== undefined ||
        input.below !== undefined)
    )
      fail('use finite position OR comparisons.')
    for (const refs of [input.above, input.below])
      if (refs !== undefined && !Array.isArray(refs))
        fail('comparisons must be arrays.')
    const normalize = (refs: readonly ZPartSelector[] | undefined) =>
      refs?.flatMap((ref) => {
        const h = select(ref)
        return h ? [h] : []
      })
    orders.set(handle, {
      ...input,
      above: normalize(input.above),
      below: normalize(input.below),
    } as UiZOrder)
  }
  const registrations: ZRegistration[] = parts.map((part, sequence) => ({
    handle: part.handle,
    parent,
    band: 'group',
    sequence,
    order: orders.get(part.handle),
    source: `${parent.label}:zParts[${part.name ?? sequence}]`,
  }))
  return { registrations, pending }
}
