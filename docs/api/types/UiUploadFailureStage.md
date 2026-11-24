# UiUploadFailureStage

Distinguishes candidate validation, byte transfer and delivery of a successful result. Import from `@uninterface/uninterface`.

## API

```ts
export type UiUploadFailureStage = 'validation' | 'upload' | 'delivery'
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Exercise acquisition, transfer and delivery failure separately; verify recovery follows the reported stage and delivery retry does not retransmit a successful upload. See the [shared workflow acceptance cases](../../contracts/upload-region.md#acceptance).
