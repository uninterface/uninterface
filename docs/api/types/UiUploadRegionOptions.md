# UiUploadRegionOptions

Candidate validation, optional retry, live business restrictions and safe error mapping. Defaults: retry false; disabled/readonly false; cancellation allowed. Validation receives an abort signal; cancellation of an upload remains distinct from cancellation of validation on reset/disposal. Import from `@uninterface/uninterface`.

## API

```ts
export interface UiUploadRegionOptions {
  validateFile?: (
    file: UiFileDescriptor<File>,
    context: { readonly signal: AbortSignal },
  ) => UiUploadIssue | null | Promise<UiUploadIssue | null>
  retry?: boolean
  // Optional reactive getters; omitted means false, false and true.
  disabled?: () => boolean
  readonly?: () => boolean
  canCancel?: () => boolean
  // Omission uses safe localized fallback messages, never String(error).
  describeError?: (error: unknown, stage: UiUploadFailureStage) => UiUploadIssue
}
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Exercise retained and service acquisition, validation/reset races, cancellation/retry, delivery failure and view unmount. Verify hidden progress/preview leaves acquisition locks intact, and disposal cannot publish a late result.
