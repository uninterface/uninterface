import {
  UiZOrderError,
  type UiZHandle,
  type UiZOrder,
  type ZRegistration,
  type ZSnapshot,
} from './model'
import { resolveZOrder } from './resolver'

export interface ZMutation {
  readonly put?: readonly ZRegistration[]
  readonly remove?: readonly UiZHandle[]
  readonly compact?: boolean
}
/** Application-owned transactions. No global allocation or lifetime counter. */
export function createZDomain() {
  const identity = Symbol('z-domain')
  let records = new Map<UiZHandle, ZRegistration>()
  let snapshot: ZSnapshot = Object.freeze({
    version: 0,
    slots: Object.freeze([]),
    entries: Object.freeze([]),
  })
  const handles = new WeakSet<UiZHandle>()
  const retired = new WeakSet<UiZHandle>()
  const validators = new Set<(next: ZSnapshot) => void>()
  const subscribers = new Set<(next: ZSnapshot) => void>()
  let disposed = false
  let committing = false
  const assertLive = () => {
    if (disposed)
      throw new UiZOrderError('disposed', 'domain has been disposed.')
    if (committing)
      throw new UiZOrderError(
        'declaration',
        'nested transactions are unsupported.',
      )
  }
  const copy = (r: ZRegistration): ZRegistration =>
    Object.freeze({
      ...r,
      order: r.order
        ? (Object.freeze({
            ...r.order,
            ...(r.order.above
              ? { above: Object.freeze([...r.order.above]) }
              : {}),
            ...(r.order.below
              ? { below: Object.freeze([...r.order.below]) }
              : {}),
          }) as UiZOrder)
        : undefined,
    })
  function publish(next: ZSnapshot, candidate: Map<UiZHandle, ZRegistration>) {
    records = candidate
    snapshot = next
    const errors: unknown[] = []
    for (const subscriber of subscribers) {
      try {
        subscriber(next)
      } catch (error) {
        errors.push(error)
      }
    }
    if (errors.length)
      throw new AggregateError(
        errors,
        'z-order snapshot committed, but an observer failed.',
      )
  }
  function transact(mutation: ZMutation) {
    assertLive()
    committing = true
    try {
      const candidate = new Map(records)
      const removed = new Set(mutation.remove ?? [])
      for (const handle of removed) {
        if (!handles.has(handle))
          throw new UiZOrderError(
            'domain',
            'removal belongs to another domain.',
            [handle.label],
          )
      }
      // Removing an ordering parent releases the entire dependent subtree. It never promotes children.
      let changed = true
      while (changed) {
        changed = false
        for (const r of candidate.values())
          if (
            removed.has(r.order?.parent ?? r.parent!) &&
            !removed.has(r.handle)
          ) {
            removed.add(r.handle)
            changed = true
          }
      }
      for (const handle of removed) candidate.delete(handle)
      const afterRemoval = new Map(candidate)
      try {
        const declared = new Set<UiZHandle>()
        for (const r of mutation.put ?? []) {
          if (declared.has(r.handle))
            throw new UiZOrderError(
              'declaration',
              'duplicate declarations in one transaction.',
              [r.source],
            )
          declared.add(r.handle)
          for (const refs of [r.order?.above, r.order?.below]) {
            if (refs !== undefined && !Array.isArray(refs))
              throw new UiZOrderError(
                'declaration',
                'comparisons must be arrays.',
                [r.source],
              )
          }
          if (!handles.has(r.handle))
            throw new UiZOrderError('domain', 'unissued handle.', [r.source])
          if (retired.has(r.handle) || removed.has(r.handle))
            throw new UiZOrderError(
              'disposed',
              'a released identity cannot be reused.',
              [r.source],
            )
          for (const ref of [
            r.parent,
            r.order?.parent,
            ...(r.order?.above ?? []),
            ...(r.order?.below ?? []),
          ]) {
            if (ref && !handles.has(ref))
              throw new UiZOrderError('domain', 'unissued reference.', [
                r.source,
              ])
          }
          candidate.set(r.handle, copy(r))
        }
        const next = resolveZOrder(
          identity,
          [...candidate.values()],
          snapshot,
          mutation.compact,
        )
        for (const validate of validators) validate(next)
        for (const handle of removed) retired.add(handle)
        publish(next, candidate)
      } catch (error) {
        // Real disappearance takes effect even when another change is invalid.
        if (removed.size && records !== candidate) {
          const next = resolveZOrder(
            identity,
            [...afterRemoval.values()],
            snapshot,
          )
          for (const handle of removed) retired.add(handle)
          publish(next, afterRemoval)
        }
        throw error
      }
      return snapshot
    } finally {
      committing = false
    }
  }
  return {
    get snapshot() {
      return snapshot
    },
    handle(label: string): UiZHandle {
      assertLive()
      const handle = Object.freeze({
        id: Symbol(label),
        domain: identity,
        label,
      })
      handles.add(handle)
      return handle
    },
    transact,
    describe(handle: UiZHandle) {
      return snapshot.entries.find((e) => e.handle === handle)
    },
    validate(callback: (next: ZSnapshot) => void) {
      assertLive()
      validators.add(callback)
      return () => {
        validators.delete(callback)
      }
    },
    subscribe(callback: (next: ZSnapshot) => void) {
      assertLive()
      subscribers.add(callback)
      return () => {
        subscribers.delete(callback)
      }
    },
    dispose() {
      if (disposed) return
      assertLive()
      disposed = true
      try {
        publish(
          Object.freeze({
            version: snapshot.version + 1,
            slots: Object.freeze([]),
            entries: Object.freeze([]),
          }),
          new Map(),
        )
      } finally {
        validators.clear()
        subscribers.clear()
      }
    },
  }
}
export type ZDomain = ReturnType<typeof createZDomain>
