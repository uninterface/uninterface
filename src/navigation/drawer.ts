import { effectScope, shallowReactive, shallowReadonly, watch } from 'vue'
import {
  createUiDrawerControl,
  type UiOverlayControl,
  type UiOverlayResult,
  type UiOverlaySession,
} from '../controls/overlay'
import type { UiNavMenuBinding, UiNavigationResult } from './menu'

export interface UiNavigationDrawerOptions {
  /** Called after navigation has closed the drawer and released modality.
   * Async consumers must respect signal before moving application focus. */
  afterNavigate?(
    key: string,
    context: { signal: AbortSignal },
  ): void | Promise<void>
}

export interface UiNavigationDrawerControl {
  /** Owned modal drawer. Attach to one UiDrawer; use open/close for invocation. */
  readonly drawer: UiOverlayControl<string>
  readonly bindings: { readonly navMenu: UiNavMenuBinding }
  readonly state: Readonly<{ pending: boolean; error: unknown }>
  open(): Promise<UiOverlayResult<string>>
  close(): Promise<void>
  dispose(): Promise<void>
}

/** Coordinate a borrowed navigation binding with one owned modal drawer. */
export function createUiNavigationDrawerControl(
  navigation: UiNavMenuBinding,
  options: UiNavigationDrawerOptions = {},
): UiNavigationDrawerControl {
  const drawer = createUiDrawerControl<string>()
  const scope = effectScope(true)
  const state = shallowReactive<{ pending: boolean; error: unknown }>({
    pending: false,
    error: undefined,
  })
  let disposed = false
  let generation = 0
  let requestedKey: string | undefined
  let handoff: AbortController | undefined
  let running: Promise<UiOverlayResult<string>> | undefined

  function invalidate() {
    handoff?.abort()
    handoff = undefined
    requestedKey = undefined
    state.pending = false
    state.error = undefined
    return ++generation
  }

  async function waitForSetup() {
    if (drawer.state.phase !== 'setup') return
    await new Promise<void>((resolve) => {
      const stop = watch(
        () => drawer.state.phase,
        (phase) => {
          if (phase === 'setup') return
          stop()
          resolve()
        },
        { flush: 'sync' },
      )
    })
  }

  async function confirmed(
    key: string,
    session: UiOverlaySession<string>,
    run: Promise<UiOverlayResult<string>>,
    version: number,
  ) {
    await waitForSetup()
    if (disposed || generation !== version || drawer.state.session !== session)
      return
    await session.complete(key)
    const result = await run
    if (
      disposed ||
      generation !== version ||
      result.status !== 'completed' ||
      result.value !== key ||
      navigation.currentKey === undefined
    )
      return
    const work = (handoff = new AbortController())
    try {
      // History can advance again during exit. Hand off to the latest confirmed
      // location after modality ends, never to an obsolete page.
      await options.afterNavigate?.(navigation.currentKey, {
        signal: work.signal,
      })
    } catch (error) {
      // Navigation is already confirmed. Report a handoff error without claiming
      // that routing failed or reopening a successfully closed drawer.
      if (!work.signal.aborted && generation === version) state.error = error
    }
  }

  async function request(
    key: string,
    event?: MouseEvent,
  ): Promise<UiNavigationResult> {
    if (disposed || navigation.disabled) {
      event?.preventDefault()
      return { status: 'blocked' }
    }
    // A modified link operation is not completion of this drawer interaction.
    // Let the borrowed binding preserve the native operation exactly once.
    if (
      event &&
      (event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey)
    )
      return navigation.request(key, event)

    const version = invalidate()
    const session = drawer.state.session
    const run = running
    requestedKey = key
    state.pending = true
    let result: UiNavigationResult
    try {
      // Forward synchronously so the navigation owner can prevent native routing
      // before an asynchronous driver or guard yields.
      result = await navigation.request(key, event)
    } catch (error) {
      result = { status: 'failed', error }
    }
    if (disposed || generation !== version) return result
    requestedKey = undefined
    state.pending = false
    if (result.status === 'failed') state.error = result.error
    if (
      session &&
      run &&
      !session.signal.aborted &&
      (result.status === 'completed' || result.status === 'unchanged') &&
      navigation.currentKey === key
    )
      await confirmed(key, session, run, version)
    return result
  }

  const binding: UiNavMenuBinding = {
    get control() {
      return navigation.control
    },
    get currentKey() {
      return navigation.currentKey
    },
    get currentPath() {
      return navigation.currentPath
    },
    get status() {
      return navigation.status
    },
    get disabled() {
      return disposed || navigation.disabled
    },
    href: (key) => navigation.href(key),
    request,
    retry: () => navigation.retry(),
  }

  async function close() {
    invalidate()
    const run = running
    const session = drawer.state.session
    if (!run || !session) return
    // An authoritative responsive/owner close can arrive in the setup microtask.
    // Wait for the run engine's cancellable phase rather than introducing a
    // second visibility owner or removing a still-modal view.
    await waitForSetup()
    if (drawer.state.session === session) await session.cancel()
    await run
  }

  scope.run(() => {
    watch(
      () => navigation.currentKey,
      (key) => {
        const session = drawer.state.session
        const run = running
        if (!session || !run || session.signal.aborted) {
          handoff?.abort()
          handoff = undefined
          return
        }
        if (requestedKey !== undefined && key === requestedKey) return
        if (key === undefined) {
          void close()
          return
        }
        const version = invalidate()
        void confirmed(key, session, run, version)
      },
      { flush: 'sync' },
    )
  })

  return {
    drawer,
    bindings: { navMenu: binding },
    state: shallowReadonly(state),
    open() {
      if (running) return running
      invalidate()
      const run = (running = drawer.run())
      void run.then((result) => {
        if (running !== run) return
        running = undefined
        state.pending = false
        if (result.status !== 'completed') invalidate()
        if (result.status === 'error') state.error = result.error
      })
      return run
    },
    close,
    async dispose() {
      disposed = true
      invalidate()
      scope.stop()
      await drawer.dispose()
    },
  }
}
