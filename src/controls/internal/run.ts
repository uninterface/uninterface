import { shallowReactive, shallowReadonly } from 'vue'

export type RunCloseTrigger = 'close-button' | 'escape' | 'backdrop'

export type RunCancelReason<R extends string = never> =
  | R
  | RunCloseTrigger
  | 'cancel'
  | 'owner-disposed'
  | 'view-removed'
export type RunResult<T, R extends string = never> =
  | { status: 'completed'; value: T }
  | { status: 'cancelled'; reason: RunCancelReason<R> }
  | { status: 'error'; error: unknown }
export type RunCloseRequest<T, R extends string = never> = Exclude<
  RunResult<T, R>,
  { status: 'error' }
>

export interface RunSession<T, R extends string = never> {
  readonly id: number
  /** Aborted when this run begins terminal cleanup. Business work must cooperate. */
  readonly signal: AbortSignal
  complete(value: T): Promise<boolean>
  cancel(reason?: RunCancelReason<R>): Promise<boolean>
  fail(error: unknown): boolean
}
export interface RunOptions<T, R extends string = never> {
  setup?(session: RunSession<T, R>): void | Promise<void>
  /** Runs after presentation is established. Async work must cooperate with signal; terminal cleanup does not await this hook. */
  opened?(session: RunSession<T, R>): void | Promise<void>
  beforeClose?(
    request: RunCloseRequest<T, R>,
    session: RunSession<T, R>,
  ): boolean | Promise<boolean>
  teardown?(
    session: RunSession<T, R>,
    result: RunResult<T, R>,
  ): void | Promise<void>
}
export interface RunControl<T, R extends string = never> {
  readonly state: Readonly<{
    phase: 'idle' | 'setup' | 'opening' | 'open' | 'closing'
    pendingClose: boolean
    session: RunSession<T, R> | undefined
  }>
  run(options?: RunOptions<T, R>): Promise<RunResult<T, R>>
  dispose(): Promise<void>
}

interface RunPresentation {
  open(session: RunSession<any, any>): Promise<void>
  close(): Promise<void>
}
interface RunAttachment {
  attach(presentation: RunPresentation): () => Promise<void>
}
const attachments = new WeakMap<object, RunAttachment>()

/** Internal core/view coordination; not a business lifecycle operation. */
export function attachRunPresentation(
  control: RunControl<any, any>,
  presentation: RunPresentation,
) {
  const attachment = attachments.get(control)
  if (!attachment)
    throw new Error('An interaction requires a factory-created run control.')
  return attachment.attach(presentation)
}

export function createRunControl<T, R extends string = never>(): RunControl<
  T,
  R
> {
  const state = shallowReactive<{
    phase: 'idle' | 'setup' | 'opening' | 'open' | 'closing'
    pendingClose: boolean
    session: RunSession<T, R> | undefined
  }>({ phase: 'idle', pendingClose: false, session: undefined })
  let presentation: RunPresentation | undefined
  let disposed = false
  let sequence = 0
  type Run = {
    session: RunSession<T, R>
    abort: AbortController
    options: RunOptions<T, R>
    view: RunPresentation
    resolve(result: RunResult<T, R>): void
    result: Promise<RunResult<T, R>>
    finishing?: Promise<boolean>
    startup: Promise<void>
    startupFailed?: { error: unknown }
  }
  let active: Run | undefined
  const errorResult = (error: unknown): RunResult<T, R> => ({
    status: 'error',
    error,
  })
  function combined(result: RunResult<T, R>, error: unknown): RunResult<T, R> {
    return errorResult(
      result.status === 'error'
        ? new AggregateError(
            [result.error, error],
            'Interaction operation and cleanup failed.',
            { cause: result.error },
          )
        : error,
    )
  }
  function finish(
    run: Run,
    outcome: RunResult<T, R>,
    waitStartup = true,
  ): Promise<boolean> {
    if (active !== run) return Promise.resolve(false)
    if (run.finishing) return Promise.resolve(false)
    // Claim the terminal transition synchronously, before any hook can reenter.
    let done!: (value: boolean) => void
    run.finishing = new Promise((resolve) => {
      done = resolve
    })
    state.phase = 'closing'
    state.pendingClose = false
    run.abort.abort()
    void (async () => {
      let result = outcome
      if (waitStartup) {
        await run.startup
        if (run.startupFailed)
          result = combined(result, run.startupFailed.error)
      }
      try {
        await run.view.close()
      } catch (error) {
        result = combined(result, error)
      }
      try {
        await run.options.teardown?.(run.session, result)
      } catch (error) {
        result = combined(result, error)
      }
      state.session = undefined
      state.phase = 'idle'
      state.pendingClose = false
      active = undefined
      run.resolve(result)
      done(true)
    })()
    return run.finishing
  }
  async function request(run: Run, request: RunCloseRequest<T, R>) {
    if (
      active !== run ||
      (state.phase !== 'open' && state.phase !== 'opening') ||
      state.pendingClose ||
      run.finishing
    )
      return false
    state.pendingClose = true
    try {
      const allowed = await (run.options.beforeClose?.(request, run.session) ??
        true)
      if (active !== run || run.finishing) return false
      if (typeof allowed !== 'boolean')
        throw new Error('Interaction beforeClose must return a boolean.')
      state.pendingClose = false
      return allowed ? finish(run, request) : false
    } catch (error) {
      return finish(run, errorResult(error))
    }
  }
  const control: RunControl<T, R> = {
    state: shallowReadonly(state),
    run(options = {}) {
      if (disposed)
        return Promise.resolve(
          errorResult(new Error('Interaction control is disposed.')),
        )
      if (active)
        return Promise.resolve(
          errorResult(new Error('Interaction already has an active run.')),
        )
      if (!presentation)
        return Promise.resolve(
          errorResult(new Error('Interaction requires a mounted view.')),
        )
      let resolve!: (result: RunResult<T, R>) => void
      const result = new Promise<RunResult<T, R>>((done) => {
        resolve = done
      })
      const abort = new AbortController()
      const session: RunSession<T, R> = Object.freeze({
        id: ++sequence,
        signal: abort.signal,
        complete: (value: T) => request(run, { status: 'completed', value }),
        cancel: (reason: RunCancelReason<R> = 'cancel') =>
          request(run, { status: 'cancelled', reason }),
        fail: (error: unknown) => {
          if (active !== run || run.finishing) return false
          void finish(run, errorResult(error))
          return true
        },
      })
      const run: Run = {
        session,
        abort,
        options: { ...options },
        view: presentation,
        resolve,
        result,
        startup: Promise.resolve(),
      }
      active = run
      run.startup = Promise.resolve().then(async () => {
        try {
          if (run.finishing) return
          await run.options.setup?.(session)
          if (run.finishing) return
          state.phase = 'opening'
          await run.view.open(session)
          if (run.finishing) return
          state.phase = 'open'
        } catch (error) {
          if (!run.finishing) void finish(run, errorResult(error), false)
          else run.startupFailed = { error }
        }
      })
      state.phase = 'setup'
      state.session = session
      void run.startup.then(async () => {
        if (run.finishing || active !== run) return
        try {
          await run.options.opened?.(session)
        } catch (error) {
          await finish(run, errorResult(error))
        }
      })
      return result
    },
    async dispose() {
      disposed = true
      const run = active
      if (run) {
        void finish(run, { status: 'cancelled', reason: 'owner-disposed' })
        await run.result
      }
    },
  }
  attachments.set(control, {
    attach(view) {
      if (disposed)
        throw new Error('Cannot attach a disposed interaction control.')
      if (presentation)
        throw new Error(
          'An interaction control can only have one attached view.',
        )
      presentation = view
      return async () => {
        if (presentation !== view) return
        const run = active
        presentation = undefined
        if (run) {
          void finish(run, { status: 'cancelled', reason: 'view-removed' })
          await run.result
        }
      }
    },
  })
  return control
}
