import { shallowReactive, shallowReadonly } from 'vue'
export interface UiFileDescriptor<TValue = unknown, TMetadata = unknown> {
  key: string
  value: TValue
  name: string
  size?: number
  mediaType?: string
  lastModified?: number
  contentUrl?: string
  previewUrl?: string
  metadata?: TMetadata
}
let sequence = 0
export function createUiFileDescriptorFromFile(
  file: File,
  options: { key?: string } = {},
): UiFileDescriptor<File> {
  return {
    key: options.key ?? `file-${++sequence}`,
    value: file,
    name: file.name,
    size: file.size,
    mediaType: file.type,
    lastModified: file.lastModified,
  }
}
export type UiUploadStatus =
  | 'queued'
  | 'uploading'
  | 'complete'
  | 'failed'
  | 'cancelled'
export interface UiUploadProgressValue {
  loaded: number
  total: number | null
}
export interface UiUploadContext {
  signal: AbortSignal
  reportProgress(progress: UiUploadProgressValue): void
}
export type UiUploadTransport<H, M = unknown> = (
  file: UiFileDescriptor<File>,
  context: UiUploadContext,
) => Promise<UiFileDescriptor<H, M>>
export interface UiUploadTaskState<H, M = unknown> {
  id: string
  file: UiFileDescriptor<File>
  status: UiUploadStatus
  progress: UiUploadProgressValue
  error: unknown
  value: UiFileDescriptor<H, M> | null
}
export interface UiUploadTask<H, M = unknown> {
  readonly state: Readonly<UiUploadTaskState<H, M>>
  readonly result: Promise<UiFileDescriptor<H, M>>
  cancel(): void
  retry(): UiUploadTask<H, M>
}
export interface UiUploadController<H, M = unknown> {
  readonly tasks: ReadonlyMap<string, UiUploadTask<H, M>>
  upload(file: UiFileDescriptor<File>): UiUploadTask<H, M>
  dispose(): void
}
export function createUiUploadController<H, M = unknown>(options: {
  transport: UiUploadTransport<H, M>
}): UiUploadController<H, M> {
  const tasks = shallowReactive(new Map<string, UiUploadTask<H, M>>())
  let disposed = false,
    next = 0
  function upload(file: UiFileDescriptor<File>): UiUploadTask<H, M> {
    if (disposed) throw new Error('Upload controller is disposed.')
    if (!file.key || !file.value)
      throw new Error('Upload requires a local file descriptor.')
    const state = shallowReactive<UiUploadTaskState<H, M>>({
      id: `upload-${++next}`,
      file,
      status: 'queued',
      progress: Object.freeze({ loaded: 0, total: null }),
      error: null,
      value: null,
    })
    const abort = new AbortController()
    let resolve!: (value: UiFileDescriptor<H, M>) => void,
      reject!: (error: unknown) => void
    const result = new Promise<UiFileDescriptor<H, M>>((yes, no) => {
      resolve = yes
      reject = no
    })
    // Observing state without awaiting result must not produce an unhandled rejection.
    void result.catch(() => {})
    const active = () =>
      state.status === 'queued' || state.status === 'uploading'
    const task: UiUploadTask<H, M> = {
      state: shallowReadonly(state),
      result,
      cancel() {
        if (!active()) return
        state.status = 'cancelled'
        const error = new DOMException('Upload cancelled', 'AbortError')
        state.error = error
        abort.abort()
        reject(error)
      },
      retry() {
        if (active()) return task
        return upload(file)
      },
    }
    tasks.set(state.id, task)
    void Promise.resolve().then(async () => {
      if (!active()) return
      state.status = 'uploading'
      try {
        const value = await options.transport(file, {
          signal: abort.signal,
          reportProgress(progress) {
            if (!active() || abort.signal.aborted) return
            if (
              !Number.isFinite(progress.loaded) ||
              progress.loaded < 0 ||
              (progress.total !== null &&
                (!Number.isFinite(progress.total) ||
                  progress.total < progress.loaded))
            )
              throw new Error('Invalid upload progress.')
            state.progress = Object.freeze({ ...progress })
          },
        })
        if (!active() || abort.signal.aborted) return
        if (
          !value ||
          typeof value.key !== 'string' ||
          !value.key ||
          typeof value.name !== 'string'
        )
          throw new Error('Upload transport must return a file descriptor.')
        state.value = value
        state.status = 'complete'
        resolve(value)
      } catch (error) {
        if (!active() || abort.signal.aborted) return
        state.error = error
        state.status = 'failed'
        reject(error)
      }
    })
    return task
  }
  return {
    tasks: shallowReadonly(tasks),
    upload,
    dispose() {
      if (disposed) return
      disposed = true
      for (const task of tasks.values()) task.cancel()
    },
  }
}
