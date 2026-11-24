# UiUploadRegionState

Read-only reactive workflow observations. file projects the destination field, task exposes observation without retry/cancel bypass, and pendingResult retains a successful result awaiting delivery. busy covers validation, transfer and delivery. Import from `@uninterface/uninterface`.

## API

```ts
export interface UiUploadRegionState<H, M = unknown> {
  readonly phase: UiUploadRegionPhase
  readonly file: UiFileDescriptor<H, M> | null
  readonly candidate: UiFileDescriptor<File> | null
  // Observe without exposing task.retry() as a workflow bypass.
  readonly task: Pick<UiUploadTask<H, M>, 'state' | 'result'> | null
  readonly pendingResult: UiFileDescriptor<H, M> | null
  readonly issue: UiUploadIssue | null
  readonly failureStage: UiUploadFailureStage | null
  readonly busy: boolean
  readonly canAcquire: boolean
  readonly canCancel: boolean
  readonly canRetry: boolean
  readonly canRetryDelivery: boolean
  readonly canRemove: boolean
}
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Exercise retained and service acquisition, validation/reset races, cancellation/retry, delivery failure and view unmount. Verify hidden progress/preview leaves acquisition locks intact, and disposal cannot publish a late result.
