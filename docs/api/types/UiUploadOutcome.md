# UiUploadOutcome

Awaitable acquisition/recovery result. Expected validation, transfer and delivery failures become outcomes and feedback; blocked, cancelled and superseded attempts cannot commit. Import from `@uninterface/uninterface`.

## API

```ts
export type UiUploadOutcome<H, M = unknown> =
  | { status: 'completed'; file: UiFileDescriptor<H, M> }
  | { status: 'rejected'; issue: UiUploadIssue }
  | { status: 'failed'; stage: UiUploadFailureStage; issue: UiUploadIssue }
  | { status: 'blocked' | 'cancelled' | 'superseded' }
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Handle every outcome discriminator without committing blocked, cancelled or superseded work. Verify a successful typed result is delivered once and late results cannot publish after disposal. See the [shared workflow acceptance cases](../../contracts/upload-region.md#acceptance).
