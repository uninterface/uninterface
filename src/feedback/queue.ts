import { shallowReactive, shallowRef, type ShallowRef } from 'vue'
import { feedbackTargets } from './driver'
import type { UiFeedbackMessageSource } from './routing'
import type {
  UiFeedbackTargetOptions,
  UiFeedbackSendOptions,
  UiFloatingFeedbackTarget,
  UiFloatingFeedbackHandle,
  UiFeedbackPhase,
  UiFeedbackCloseReason,
} from './floating-types'

export interface FeedbackEntry {
  owner: symbol
  handle: UiFloatingFeedbackHandle
  source: ShallowRef<UiFeedbackMessageSource>
  options: UiFeedbackSendOptions
  timing: ShallowRef<{
    duration: number | null
    remaining: number | null
    startedAt: number | null
  }>
  presented(): void
  exited(): void
  close(reason: UiFeedbackCloseReason, force?: boolean): void
  pause(reason: string, paused: boolean): void
}
function capacity(
  value: number | null | undefined,
  fallback: number,
  name: string,
  minimum = 1,
) {
  if (value === null || (value === undefined && fallback === Infinity))
    return Infinity
  const resolved = value ?? fallback
  if (!Number.isSafeInteger(resolved) || resolved < minimum)
    throw new Error(`${name} must be an integer >= ${minimum} or null.`)
  return resolved
}
function duration(value: number | null | undefined, fallback: number | null) {
  const resolved = value === undefined ? fallback : value
  if (resolved !== null && (!Number.isFinite(resolved) || resolved < 0))
    throw new Error(
      'Feedback duration must be nonnegative milliseconds or null.',
    )
  return resolved
}
export function createFeedbackQueue(
  kind: 'toast' | 'notification',
  options: UiFeedbackTargetOptions = {},
  prefix = 'feedback',
) {
  const config = Object.freeze({
    duration: duration(options.duration, kind === 'toast' ? 5000 : null),
    maxVisible: capacity(
      options.maxVisible,
      kind === 'toast' ? 3 : 5,
      'maxVisible',
    ),
    maxPending: capacity(options.maxPending, Infinity, 'maxPending', 0),
    overflow: options.overflow ?? 'queue',
    pendingOverflow: options.pendingOverflow ?? 'reject',
    placement:
      options.placement ?? (kind === 'toast' ? 'bottom-end' : 'top-end'),
    pauseOnHover: options.pauseOnHover ?? true,
    pauseOnFocus: options.pauseOnFocus ?? true,
    pauseWhenHidden: options.pauseWhenHidden ?? true,
  })
  if (
    !['queue', 'dismiss-oldest', 'reject'].includes(config.overflow) ||
    !['reject', 'dismiss-oldest'].includes(config.pendingOverflow)
  )
    throw new Error('Unsupported feedback overflow policy.')
  if (
    ![
      'top-start',
      'top-center',
      'top-end',
      'bottom-start',
      'bottom-center',
      'bottom-end',
    ].includes(config.placement)
  )
    throw new Error('Unsupported feedback placement.')
  for (const name of [
    'pauseOnHover',
    'pauseOnFocus',
    'pauseWhenHidden',
  ] as const)
    if (typeof config[name] !== 'boolean')
      throw new Error(`${name} must be boolean.`)
  const entries = shallowReactive<FeedbackEntry[]>([])
  let ready = false,
    disposed = false,
    sequence = 0,
    clearing = false
  const slotsUsed = () =>
    entries.filter(
      (e) => e.handle.phase === 'visible' || e.handle.phase === 'closing',
    ).length
  function pump() {
    if (!ready || disposed || clearing) return
    for (const entry of entries) {
      if (slotsUsed() >= config.maxVisible) break
      if (entry.handle.phase === 'queued') activate.get(entry)!()
    }
  }
  const activate = new WeakMap<FeedbackEntry, () => void>()
  function clear(
    owner?: symbol,
    reason: UiFeedbackCloseReason = 'reset',
    force = false,
  ) {
    clearing = true
    try {
      for (const entry of [...entries])
        if (owner === undefined || entry.owner === owner)
          entry.close(reason, force)
    } finally {
      clearing = false
      pump()
    }
  }
  const target: UiFloatingFeedbackTarget = Object.freeze({
    kind,
    state: Object.freeze({
      get items() {
        return Object.freeze(entries.map((e) => e.handle))
      },
      get queued() {
        return entries.filter((e) => e.handle.phase === 'queued').length
      },
      get visible() {
        return entries.filter((e) => e.handle.phase === 'visible').length
      },
    }),
    reset: () => clear(),
    dispose: () => {
      disposed = true
      clear(undefined, 'disposed', true)
    },
  })
  feedbackTargets.set(target, {
    clear: (owner) => clear(owner),
    send(owner, source, rawOptions) {
      if (disposed)
        throw new Error('Cannot send feedback to a disposed target.')
      const send = (rawOptions ?? {}) as UiFeedbackSendOptions
      if (send.content !== undefined && typeof send.content !== 'function')
        throw new Error('Feedback content must be a Vue slot function.')
      const lifetime = duration(send.duration, config.duration)
      const phase = shallowRef<UiFeedbackPhase>('queued')
      const reason = shallowRef<UiFeedbackCloseReason>()
      const content = shallowRef(source)
      const timing = shallowRef({
        duration: lifetime,
        remaining: lifetime,
        startedAt: null as number | null,
      })
      const paused = new Set<string>()
      let timer: ReturnType<typeof setTimeout> | undefined,
        began = 0,
        remaining = lifetime,
        mounted = false
      let settle!: (reason: UiFeedbackCloseReason) => void
      const closed = new Promise<UiFeedbackCloseReason>((resolve) => {
        settle = resolve
      })
      const stop = () => {
        if (timer !== undefined) {
          clearTimeout(timer)
          timer = undefined
          if (remaining !== null)
            remaining = Math.max(0, remaining - (Date.now() - began))
        }
      }
      const publishTiming = (startedAt: number | null) => {
        timing.value = { duration: lifetime, remaining, startedAt }
      }
      const schedule = () => {
        if (
          !mounted ||
          phase.value !== 'visible' ||
          paused.size ||
          remaining === null ||
          timer !== undefined
        )
          return
        began = Date.now()
        publishTiming(began)
        timer = setTimeout(() => {
          timer = undefined
          remaining = 0
          publishTiming(null)
          entry.close('timeout')
        }, remaining)
      }
      const handle: UiFloatingFeedbackHandle = Object.freeze({
        id: `${prefix}-${++sequence}`,
        get active() {
          return phase.value === 'queued' || phase.value === 'visible'
        },
        get phase() {
          return phase.value
        },
        get reason() {
          return reason.value
        },
        closed,
        update(value: any) {
          if (!handle.active) return
          const previous = content.value
          content.value =
            typeof value === 'function'
              ? value
              : () => ({
                  ...(typeof previous === 'function' ? previous() : previous),
                  ...value,
                })
        },
        dismiss: () => entry.close('dismissed'),
      })
      const entry: FeedbackEntry = {
        owner,
        handle,
        source: content,
        options: { ...send },
        timing,
        presented() {
          if (phase.value === 'visible') {
            mounted = true
            schedule()
          }
        },
        exited() {
          if (phase.value !== 'closing') return
          phase.value = 'closed'
          const index = entries.indexOf(entry)
          if (index >= 0) entries.splice(index, 1)
          settle(reason.value!)
          pump()
        },
        close(cause, force = false) {
          if (phase.value === 'closed') return
          if (phase.value === 'closing') {
            if (force) entry.exited()
            return
          }
          const wasMounted = mounted
          reason.value = cause
          stop()
          publishTiming(null)
          phase.value = 'closing'
          if (!wasMounted || force) entry.exited()
        },
        pause(key, value) {
          if (value) {
            paused.add(key)
            stop()
            publishTiming(null)
          } else {
            paused.delete(key)
            schedule()
          }
        },
      }
      activate.set(entry, () => {
        phase.value = 'visible'
      })
      const full = slotsUsed() >= config.maxVisible
      if (full && config.overflow === 'reject') {
        entry.close('rejected')
        return handle
      }
      if (
        full &&
        config.overflow === 'dismiss-oldest' &&
        entries.filter((e) => e.handle.active).length >= config.maxVisible
      )
        entries.find((e) => e.handle.active)?.close('overflow')
      const pending = entries.filter((e) => e.handle.phase === 'queued')
      if (
        (!ready || slotsUsed() >= config.maxVisible) &&
        pending.length >= config.maxPending
      ) {
        if (config.pendingOverflow === 'reject' || !pending.length) {
          entry.close('rejected')
          return handle
        }
        pending[0]?.close('overflow')
      }
      entries.push(entry)
      pump()
      return handle
    },
  })
  return {
    target,
    entries,
    config,
    ready() {
      ready = true
      pump()
    },
    clear,
  }
}
