# UiUploadIssue

Localized workflow feedback: a literal string or a message descriptor. Raw transport exceptions are never displayed by default. Import from `@uninterface/uninterface`.

## API

```ts
export type UiUploadIssue = string | UiMessageDescriptor
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Verify a rejection presents actionable application-safe text without exposing transport diagnostics, and recovery clears the issue at the documented transition. See the [shared workflow acceptance cases](../../contracts/upload-region.md#acceptance).
