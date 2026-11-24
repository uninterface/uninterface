import {
  effectScope,
  shallowReactive,
  shallowRef,
  shallowReadonly,
  toRaw,
  watch,
} from 'vue'
import type { UiButtonBinding } from '../bindings/button'
import { fieldValidation, type UiFieldControl } from '../controls/field'
import { copy } from '../controls/value'
import {
  createUiFileDescriptorFromFile,
  type UiFileDescriptor,
  type UiUploadController,
  type UiUploadTask,
} from './control'
import type {
  UiUploadAcquisitionGuard,
  UiUploadDestination,
  UiUploadFailureStage,
  UiUploadIssue,
  UiUploadOutcome,
  UiUploadRegionBinding,
  UiUploadRegionControl,
  UiUploadRegionOptions,
  UiUploadRegionPhase,
  UiUploadProgressBinding,
} from './region-types'

const owners = new WeakMap<UiUploadRegionBinding, UiFieldControl<any> | null>()
const fieldOwners = new WeakMap<UiFieldControl<any>, object>()
/** Private logical field association; backend views never inspect field controls. */
export function uploadRegionField(binding: UiUploadRegionBinding) {
  return owners.get(toRaw(binding))
}
const message = (key: string): UiUploadIssue => ({
  namespace: 'uninterface',
  key,
})
let sequence = 0

export function createUiUploadRegionControl<H, M = unknown>(
  options: UiUploadRegionOptions & {
    uploadController: UiUploadController<H, M>
    destination: UiUploadDestination<H, M>
  },
): UiUploadRegionControl<H, M>
export function createUiUploadRegionControl(
  options: UiUploadRegionOptions & {
    uploadController?: never
    destination: UiUploadDestination<File>
    retry?: never
  },
): UiUploadRegionControl<File>
export function createUiUploadRegionControl<H, M = unknown>(
  options: UiUploadRegionOptions & {
    uploadController?: UiUploadController<H, M>
    destination: UiUploadDestination<H, M>
  },
): UiUploadRegionControl<H, M> {
  const destination = options.destination
  if (
    !destination ||
    !!destination.field === (typeof destination.receive === 'function')
  )
    throw new Error(
      'Upload region requires exactly one destination: field or receive.',
    )
  if (!options.uploadController && options.retry !== undefined)
    throw new Error('Selection-only acquisition has no upload retry.')
  const field = destination.field
  const owner = {}
  if (field && fieldOwners.has(toRaw(field)))
    throw new Error('A field already has an upload-region workflow.')
  const fieldSession = field && fieldValidation(field)
  if (field) fieldOwners.set(toRaw(field), owner)
  const id = ++sequence
  const scope = effectScope(true)
  const data = shallowReactive({
    phase: 'ready' as UiUploadRegionPhase,
    candidate: null as UiFileDescriptor<File> | null,
    task: null as UiUploadTask<H, M> | null,
    pendingResult: null as UiFileDescriptor<H, M> | null,
    issue: null as UiUploadIssue | null,
    failureStage: null as UiUploadFailureStage | null,
    revision: 0,
  })
  let generation = 0,
    ownEdit = false,
    disposed = false
  const retryFile = shallowRef<UiFileDescriptor<File> | null>(null)
  let deliveryId = ''
  let active:
    | { abort: AbortController; finish(value: UiUploadOutcome<H, M>): void }
    | undefined
  const file = () => field?.state.input ?? null
  const busy = () =>
    ['validating', 'uploading', 'delivering'].includes(data.phase)
  const disabled = () =>
    disposed || !!options.disabled?.() || !!field?.state.effectiveDisabled
  const editable = () => !disabled() && !options.readonly?.()
  const canAcquire = () =>
    editable() && !busy() && !file() && !data.pendingResult
  const canCancel = () =>
    !disabled() &&
    options.canCancel?.() !== false &&
    !!data.task &&
    (['queued', 'uploading'].includes(data.task.state.status) ||
      (data.task.state.status === 'failed' && data.failureStage === 'upload'))
  const canRetry = () => !!options.retry && !!retryFile.value && canAcquire()
  const canRetryDelivery = () =>
    editable() && !busy() && !!data.pendingResult && !file()
  const canRemove = () => editable() && !busy() && !!field && !!file()
  function notify() {
    field?.notifyDraftChanged({ origin: 'programmatic', parts: ['upload'] })
  }
  function ready() {
    data.phase = disposed ? 'disposed' : file() ? 'occupied' : 'ready'
  }
  function clearIssue() {
    data.issue = null
    data.failureStage = null
  }
  function describe(error: unknown, stage: UiUploadFailureStage) {
    try {
      return (
        options.describeError?.(error, stage) ??
        message(
          stage === 'validation'
            ? 'fileRejected'
            : stage === 'upload'
              ? 'uploadFailed'
              : 'uploadDeliveryFailed',
        )
      )
    } catch {
      return message('uploadFailed')
    }
  }
  function invalidate(outcome: 'superseded' | 'cancelled', clear = true) {
    generation++
    data.revision++
    const previous = active
    active = undefined
    previous?.abort.abort()
    data.task?.cancel()
    previous?.finish({ status: outcome })
    data.candidate = null
    if (clear) {
      retryFile.value = null
      data.pendingResult = null
      data.task = null
      clearIssue()
    }
    ready()
  }
  function fail(
    error: unknown,
    stage: UiUploadFailureStage,
  ): UiUploadOutcome<H, M> {
    const issue = describe(error, stage)
    data.issue = issue
    data.failureStage = stage
    data.phase = stage === 'delivery' ? 'delivery-failed' : 'ready'
    return { status: 'failed', stage, issue }
  }
  function run(
    work: (
      token: number,
      signal: AbortSignal,
    ) => Promise<UiUploadOutcome<H, M>>,
  ) {
    const token = ++generation
    data.revision++
    const abort = new AbortController()
    let finish!: (value: UiUploadOutcome<H, M>) => void
    const result = new Promise<UiUploadOutcome<H, M>>((resolve) => {
      finish = resolve
    })
    active = { abort, finish }
    void work(token, abort.signal).then(
      (outcome) => {
        if (token !== generation) return
        active = undefined
        data.candidate = null
        data.revision++
        if (busy()) ready()
        notify()
        finish(outcome)
      },
      (error) => {
        if (token !== generation) return
        const outcome = fail(error, 'validation')
        active = undefined
        data.candidate = null
        data.revision++
        notify()
        finish(outcome)
      },
    )
    return result
  }
  async function deliver(token: number): Promise<UiUploadOutcome<H, M>> {
    const result = data.pendingResult!
    data.phase = 'delivering'
    try {
      if (!editable() || file()) throw new Error('Destination is unavailable.')
      if (field) {
        // set() writes synchronously. Suppress only our own lifecycle event,
        // never a later external reset while its feedback promise is pending.
        ownEdit = true
        let update: Promise<void>
        try {
          update = field.set(result)
        } finally {
          ownEdit = false
        }
        await update
        if (token !== generation) return { status: 'superseded' }
      } else {
        const received: unknown = destination.receive!(copy(result), {
          deliveryId,
        })
        if (received !== undefined) {
          if (
            received &&
            typeof (received as PromiseLike<unknown>).then === 'function'
          )
            void Promise.resolve(received).catch(() => {})
          throw new Error('Upload receive must return undefined synchronously.')
        }
        if (token !== generation) return { status: 'superseded' }
      }
      data.pendingResult = null
      retryFile.value = null
      clearIssue()
      ready()
      return { status: 'completed', file: result }
    } catch (error) {
      if (token !== generation) return { status: 'superseded' }
      return fail(error, 'delivery')
    }
  }
  function acquireDescriptor(
    candidate: UiFileDescriptor<File>,
    guard?: UiUploadAcquisitionGuard,
  ) {
    if (
      !canAcquire() ||
      (guard && (guard.revision !== data.revision || !guard.available()))
    )
      return Promise.resolve<UiUploadOutcome<H, M>>({ status: 'blocked' })
    data.phase = 'validating'
    data.candidate = candidate
    clearIssue()
    notify()
    return run(async (token, signal) => {
      let issue: UiUploadIssue | null | undefined
      try {
        issue = await options.validateFile?.(candidate, { signal })
      } catch (error) {
        if (token !== generation) return { status: 'superseded' }
        return fail(error, 'validation')
      }
      if (token !== generation) return { status: 'superseded' }
      if (!editable() || file() || (guard && !guard.available()))
        return { status: 'blocked' }
      if (issue) {
        data.issue = issue
        return { status: 'rejected', issue }
      }
      retryFile.value = null
      data.task = null
      deliveryId = `upload-region-${id}-${token}`
      if (options.uploadController) {
        data.phase = 'uploading'
        try {
          const task = options.uploadController.upload(candidate)
          data.task = task
          const result = await task.result
          if (token !== generation) return { status: 'superseded' }
          data.pendingResult = result
        } catch (error) {
          if (token !== generation) return { status: 'superseded' }
          if (options.retry) retryFile.value = candidate
          if (data.task?.state.status === 'cancelled') {
            ready()
            return { status: 'cancelled' }
          }
          return fail(error, 'upload')
        }
      } else data.pendingResult = candidate as unknown as UiFileDescriptor<H, M>
      return deliver(token)
    })
  }
  function acquire(files: readonly File[], guard?: UiUploadAcquisitionGuard) {
    if (
      !canAcquire() ||
      (guard && (guard.revision !== data.revision || !guard.available()))
    )
      return Promise.resolve<UiUploadOutcome<H, M>>({ status: 'blocked' })
    if (files.length !== 1 || files.some((file) => !!file.webkitRelativePath)) {
      const issue = message('singleFile')
      data.issue = issue
      return Promise.resolve<UiUploadOutcome<H, M>>({
        status: 'rejected',
        issue,
      })
    }
    return acquireDescriptor(createUiFileDescriptorFromFile(files[0]!), guard)
  }
  function retry() {
    return canRetry()
      ? acquireDescriptor(retryFile.value!)
      : Promise.resolve<UiUploadOutcome<H, M>>({ status: 'blocked' })
  }
  function retryDelivery() {
    if (!canRetryDelivery())
      return Promise.resolve<UiUploadOutcome<H, M>>({ status: 'blocked' })
    data.phase = 'delivering'
    clearIssue()
    notify()
    return run((token) => deliver(token))
  }
  function cancel() {
    if (!canCancel()) return false
    if (data.task?.state.status === 'failed') {
      invalidate('cancelled')
      notify()
      return true
    }
    const candidate = data.candidate
    invalidate('cancelled', false)
    if (options.retry) retryFile.value = candidate
    clearIssue()
    notify()
    return true
  }
  async function remove() {
    if (!canRemove()) return false
    invalidate('superseded')
    ownEdit = true
    let update: Promise<void>
    try {
      update = field!.set(null)
    } finally {
      ownEdit = false
    }
    await update
    ready()
    return true
  }
  function releaseResult() {
    if (!editable() || busy() || !data.pendingResult) return false
    invalidate('superseded')
    notify()
    return true
  }
  const button = (
    allowed: () => boolean,
    invoke: () => unknown,
  ): UiButtonBinding =>
    Object.freeze({
      target: 'button',
      type: 'button',
      loading: false,
      get disabled() {
        return !allowed()
      },
      async activate() {
        if (allowed()) await invoke()
      },
    })
  const cancelButton = button(canCancel, cancel),
    retryButton = button(canRetry, retry),
    retryDeliveryButton = button(canRetryDelivery, retryDelivery),
    removeButton = button(canRemove, remove)
  const progress: UiUploadProgressBinding = Object.freeze({
    target: 'upload-progress',
    get status() {
      return data.task?.state.status ?? 'idle'
    },
    get fileName() {
      return data.task?.state.file.name ?? null
    },
    get progress() {
      return data.task?.state.progress ?? null
    },
    get issue() {
      return data.failureStage === 'upload' ? data.issue : null
    },
    cancelButton: options.uploadController ? cancelButton : null,
    retryButton: options.retry ? retryButton : null,
  })
  const region: UiUploadRegionBinding = Object.freeze({
    target: 'upload-region',
    get phase() {
      return data.phase
    },
    role: field ? 'retained' : 'service',
    get revision() {
      return data.revision
    },
    get file() {
      return file()
    },
    get fileName() {
      return (
        file()?.name ??
        data.candidate?.name ??
        data.pendingResult?.name ??
        retryFile.value?.name ??
        null
      )
    },
    get canAcquire() {
      return canAcquire()
    },
    get busy() {
      return busy()
    },
    get occupied() {
      return !!file()
    },
    get issue() {
      return data.issue
    },
    progress: options.uploadController ? progress : null,
    actions: Object.freeze({
      ...(options.uploadController ? { cancel: cancelButton } : {}),
      ...(options.retry ? { retry: retryButton } : {}),
      retryDelivery: retryDeliveryButton,
      ...(field ? { remove: removeButton } : {}),
    }),
    acquire,
  })
  owners.set(region, field ?? null)
  const unregister: (() => void)[] = []
  if (field) {
    unregister.push(
      field.addCheck(() =>
        busy()
          ? message('uploadPending')
          : data.pendingResult
            ? message('uploadDeliveryFailed')
            : null,
      ),
    )
    unregister.push(field.trackDraft(() => busy() || !!data.pendingResult))
    unregister.push(
      fieldSession!.onValueChange(() => {
        if (!ownEdit) invalidate('superseded')
      }),
    )
  }
  scope.run(() =>
    watch(
      () => [editable(), file()],
      () => {
        data.revision++
      },
      { flush: 'sync' },
    ),
  )
  ready()
  const state = Object.freeze({
    get phase() {
      return data.phase
    },
    get file() {
      return file()
    },
    get candidate() {
      return data.candidate
    },
    get task() {
      const task = data.task
      return task
        ? Object.freeze({ state: task.state, result: task.result })
        : null
    },
    get pendingResult() {
      return data.pendingResult
    },
    get issue() {
      return data.issue
    },
    get failureStage() {
      return data.failureStage
    },
    get busy() {
      return busy()
    },
    get canAcquire() {
      return canAcquire()
    },
    get canCancel() {
      return canCancel()
    },
    get canRetry() {
      return canRetry()
    },
    get canRetryDelivery() {
      return canRetryDelivery()
    },
    get canRemove() {
      return canRemove()
    },
  })
  return Object.freeze({
    state: shallowReadonly(state),
    bindings: Object.freeze({
      region,
      progress,
      cancelButton,
      retryButton,
      retryDeliveryButton,
      removeButton,
    }),
    acquire,
    retry,
    retryDelivery,
    cancel,
    remove,
    releaseResult,
    dispose() {
      if (disposed) return
      disposed = true
      invalidate('cancelled')
      scope.stop()
      unregister.reverse().forEach((stop) => stop())
      if (field && fieldOwners.get(toRaw(field)) === owner)
        fieldOwners.delete(toRaw(field))
    },
  })
}
