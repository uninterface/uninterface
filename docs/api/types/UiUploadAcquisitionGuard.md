# UiUploadAcquisitionGuard

View admission guard: capture revision before opening a chooser and supply a live available getter for local restrictions. The producer rechecks after validation. A stale chooser remains stale even if locks later clear. Import from `@uninterface/uninterface`.

## API

```ts
export interface UiUploadAcquisitionGuard {
  readonly revision: number
  // Live local restrictions; checked again after async validation.
  readonly available: () => boolean
}
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Open a chooser, change the acquisition revision or local availability, then return its result. The stale result remains rejected even if availability is restored. Recheck restrictions after asynchronous validation. See the [shared workflow acceptance cases](../../contracts/upload-region.md#acceptance).
