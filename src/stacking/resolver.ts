import {
  UiZOrderError,
  zBands,
  type ZRegistration,
  type ZResolved,
  type ZSlot,
  type ZSnapshot,
  type UiZHandle,
} from './model'

/** Canonical slots are band-major, then same-band ancestor depth. Zero is parent paint. */
export function resolveZOrder(
  domain: symbol,
  registrations: readonly ZRegistration[],
  previous: ZSnapshot = { version: 0, slots: [], entries: [] },
  compact = false,
): ZSnapshot {
  const byId = new Map<UiZHandle, ZRegistration>()
  const rawParent = (r: ZRegistration) => r.order?.parent ?? r.parent
  const band = (r: ZRegistration) => r.order?.band ?? r.band
  const fail = (
    code: ConstructorParameters<typeof UiZOrderError>[0],
    message: string,
    ...items: ZRegistration[]
  ): never => {
    throw new UiZOrderError(
      code,
      message,
      items.map((r) => r.source),
    )
  }
  const checkHandle = (handle: UiZHandle, r: ZRegistration) => {
    if (!handle || handle.domain !== domain)
      fail('domain', 'reference belongs to another domain.', r)
  }
  for (const r of registrations) {
    checkHandle(r.handle, r)
    if (byId.has(r.handle)) fail('declaration', 'duplicate registration.', r)
    byId.set(r.handle, r)
    if (!zBands.includes(band(r))) fail('declaration', 'unknown band.', r)
    if (r.sequence !== undefined && !Number.isFinite(r.sequence))
      fail('declaration', 'sequence must be finite.', r)
    const order = r.order
    if (order) {
      if (
        order.position !== undefined &&
        (!Number.isFinite(order.position) ||
          order.above !== undefined ||
          order.below !== undefined)
      )
        fail(
          'declaration',
          'use finite position OR comparative relationships.',
          r,
        )
      for (const refs of [order.above, order.below]) {
        if (refs !== undefined && !Array.isArray(refs))
          fail('declaration', 'comparisons must be arrays.', r)
        for (const ref of refs ?? []) checkHandle(ref, r)
      }
    }
    if (rawParent(r)) checkHandle(rawParent(r)!, r)
  }
  const referenced = new Set(
    registrations.flatMap((r) => [
      ...(r.order?.above ?? []),
      ...(r.order?.below ?? []),
    ]),
  )
  const materialized = (r: ZRegistration) =>
    !r.passive || r.order !== undefined || referenced.has(r.handle)
  const parent = (r: ZRegistration): UiZHandle | undefined => {
    const p = rawParent(r)
    const owner = p && byId.get(p)
    return owner && !materialized(owner) ? parent(owner) : p
  }
  const paths = new Map<UiZHandle, ZRegistration[]>()
  const visiting = new Set<UiZHandle>()
  function path(r: ZRegistration): ZRegistration[] {
    const cached = paths.get(r.handle)
    if (cached) return cached
    if (visiting.has(r.handle)) fail('parent', 'ordering parent cycle.', r)
    visiting.add(r.handle)
    const p = rawParent(r)
    const owner = p && byId.get(p)
    if (p && !owner) fail('parent', 'ordering parent is unavailable.', r)
    const ancestors = owner ? path(owner) : []
    if (owner && zBands.indexOf(band(owner)) > zBands.indexOf(band(r)))
      fail('parent', 'an attachment cannot restart an earlier band.', owner, r)
    const result = [...ancestors, r]
    paths.set(r.handle, result)
    visiting.delete(r.handle)
    return result
  }
  for (const r of registrations) path(r)
  const peers = new Map<UiZHandle | undefined, Map<string, ZRegistration[]>>()
  for (const r of registrations.filter(materialized)) {
    const p = parent(r)
    let groups = peers.get(p)
    if (!groups) peers.set(p, (groups = new Map()))
    const key = band(r)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(r)
  }
  const ranks = new Map<UiZHandle, number>()
  const elevations = new Map<UiZHandle, number>()
  const pending = new Map<UiZHandle, UiZHandle[]>()
  for (const groups of peers.values())
    for (const siblings of groups.values()) {
      const edges = new Map(
        siblings.map((r) => [r.handle, new Set<UiZHandle>()]),
      )
      const incoming = new Map(siblings.map((r) => [r.handle, 0]))
      const edge = (a: UiZHandle, b: UiZHandle) => {
        if (edges.get(a)!.has(b)) return
        edges.get(a)!.add(b)
        incoming.set(b, incoming.get(b)! + 1)
      }
      for (const r of siblings) {
        for (const [direction, refs] of [
          ['above', r.order?.above],
          ['below', r.order?.below],
        ] as const) {
          for (const ref of refs ?? []) {
            const other = byId.get(ref)
            if (!other) {
              if (!pending.has(r.handle)) pending.set(r.handle, [])
              pending.get(r.handle)!.push(ref)
              continue
            }
            if (rawParent(other) !== rawParent(r) || band(other) !== band(r))
              fail(
                'scope',
                'comparison crosses band or parent scope.',
                r,
                other,
              )
            if (direction === 'above') edge(ref, r.handle)
            else edge(r.handle, ref)
          }
        }
      }
      // Explicit ordinal peers constrain each other; unspecified peers have no ordinal requirement.
      const ordinal = siblings
        .filter((r) => r.order?.position !== undefined)
        .sort((a, b) => a.order!.position! - b.order!.position!)
      for (let i = 0; i < ordinal.length; i++)
        for (let j = i + 1; j < ordinal.length; j++)
          if (ordinal[i]!.order!.position! < ordinal[j]!.order!.position!)
            edge(ordinal[i]!.handle, ordinal[j]!.handle)
      const fallback = new Map(siblings.map((r, i) => [r.handle, i]))
      const available = siblings.filter((r) => incoming.get(r.handle) === 0)
      let rank = 0
      while (available.length) {
        available.sort(
          (a, b) =>
            (a.sequence ?? fallback.get(a.handle)!) -
              (b.sequence ?? fallback.get(b.handle)!) ||
            fallback.get(a.handle)! - fallback.get(b.handle)!,
        )
        const r = available.shift()!
        ranks.set(r.handle, ++rank)
        // Longest constraint path preserves equal elevation for peers that
        // only differ by deterministic paint-order tie-breaking.
        const elevation = elevations.get(r.handle) ?? 1
        elevations.set(r.handle, elevation)
        for (const next of edges.get(r.handle)!) {
          elevations.set(
            next,
            Math.max(elevations.get(next) ?? 1, elevation + 1),
          )
          incoming.set(next, incoming.get(next)! - 1)
          if (incoming.get(next) === 0) available.push(byId.get(next)!)
        }
      }
      if (rank !== siblings.length)
        fail(
          'cycle',
          'contradictory ordering relationships.',
          ...siblings.filter((r) => incoming.get(r.handle)! > 0),
        )
    }
  const slotKey = (b: string, depth: number) => `${b}:${depth}`
  const digits = new Map<UiZHandle, Map<string, number>>()
  const elevationDigits = new Map<UiZHandle, Map<string, number>>()
  const required = new Map<string, number>()
  for (const r of registrations) {
    const values = new Map<string, number>()
    const levels = new Map<string, number>()
    const depths = new Map<string, number>()
    for (const ancestor of paths.get(r.handle)!.filter(materialized)) {
      const b = band(ancestor)
      const depth = depths.get(b) ?? 0
      depths.set(b, depth + 1)
      const key = slotKey(b, depth)
      const rank = ranks.get(ancestor.handle)!
      values.set(key, rank)
      levels.set(key, elevations.get(ancestor.handle)!)
      required.set(
        key,
        Math.max(required.get(key) ?? 0, Math.ceil(Math.log2(rank + 1))),
      )
    }
    digits.set(r.handle, values)
    elevationDigits.set(r.handle, levels)
  }
  const capacities = new Map(
    compact
      ? []
      : previous.slots.map((s) => [slotKey(s.band, s.depth), s.width]),
  )
  for (const [key, minimum] of required)
    capacities.set(key, Math.max(capacities.get(key) ?? 0, minimum, 2))
  if ([...capacities.values()].reduce((a, b) => a + b, 0) > 31) {
    capacities.clear()
    for (const [key, width] of required) capacities.set(key, width)
  }
  const total = [...capacities.values()].reduce((a, b) => a + b, 0)
  if (total > 31)
    fail(
      'budget',
      `required ${total} bits exceeds the 31-bit budget; required widths ${JSON.stringify(Object.fromEntries(required))}.`,
      ...registrations,
    )
  const slots: ZSlot[] = [...capacities]
    .map(([key, width]) => {
      const [b, d] = key.split(':')
      return Object.freeze({
        band: b as ZSlot['band'],
        depth: Number(d),
        width,
      })
    })
    .sort(
      (a, b) =>
        zBands.indexOf(a.band) - zBands.indexOf(b.band) || a.depth - b.depth,
    )
  const entries: ZResolved[] = registrations.map((r) => {
    const vector = slots.map(
      (s) => digits.get(r.handle)!.get(slotKey(s.band, s.depth)) ?? 0,
    )
    const value = vector.reduce(
      (sum, digit, i) => sum * 2 ** slots[i]!.width + digit,
      0,
    )
    return Object.freeze({
      band: band(r),
      parent: rawParent(r),
      order: r.order
        ? (Object.freeze({
            ...r.order,
            ...(r.order.above
              ? { above: Object.freeze([...r.order.above]) }
              : {}),
            ...(r.order.below
              ? { below: Object.freeze([...r.order.below]) }
              : {}),
          }) as typeof r.order)
        : undefined,
      sequence: r.sequence,
      materialized: materialized(r),
      handle: r.handle,
      chain: Object.freeze(paths.get(r.handle)!.map((p) => p.handle)),
      digits: Object.freeze(vector),
      value,
      elevation: slots.reduce(
        (sum, slot) =>
          sum * 2 ** slot.width +
          (elevationDigits.get(r.handle)!.get(slotKey(slot.band, slot.depth)) ??
            0),
        0,
      ),
      pending: Object.freeze(pending.get(r.handle) ?? []),
      source: r.source,
    })
  })
  return Object.freeze({
    version: previous.version + 1,
    slots: Object.freeze(slots),
    entries: Object.freeze(entries),
  })
}
