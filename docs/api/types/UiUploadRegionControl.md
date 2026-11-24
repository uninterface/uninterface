# UiUploadRegionControl

Factory-created workflow coordinator. See createUiUploadRegionControl for commands, ownership, lifetime and form coordination. Import from `@uninterface/uninterface`.

## API

```ts
export interface UiUploadRegionControl<H, M = unknown> {
  readonly state: UiUploadRegionState<H, M>
  readonly bindings: {
    readonly region: UiUploadRegionBinding
    readonly progress: UiUploadProgressBinding
    readonly cancelButton: UiButtonBinding
    readonly retryButton: UiButtonBinding
    readonly retryDeliveryButton: UiButtonBinding
    readonly removeButton: UiButtonBinding
  }
  acquire(files: readonly File[]): Promise<UiUploadOutcome<H, M>>
  retry(): Promise<UiUploadOutcome<H, M>>
  retryDelivery(): Promise<UiUploadOutcome<H, M>>
  cancel(): boolean
  remove(): Promise<boolean>
  // Explicit recovery decision; never deletes the uploaded resource.
  releaseResult(): boolean
  dispose(): void
}
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Exercise retained and service acquisition, validation/reset races, cancellation/retry, delivery failure and view unmount. Verify hidden progress/preview leaves acquisition locks intact, and disposal cannot publish a late result.
