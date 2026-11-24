# UiUploadRegionPhase

Workflow phase, separate from transfer status. Failure/cancel returns to ready; delivery failure retains the successful result and blocks acquisition. Import from `@uninterface/uninterface`.

## API

```ts
export type UiUploadRegionPhase =
  | 'ready'
  | 'validating'
  | 'uploading'
  | 'delivering'
  | 'occupied'
  | 'delivery-failed'
  | 'disposed'
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Compare the exposed phase with acquisition, transfer, delivery and association transitions; verify phase alone never grants an operation denied by live permissions. See the [shared workflow acceptance cases](../../contracts/upload-region.md#acceptance).
