# UiUploadProgressBinding

Producer-independent progress target. Projects file identity, transfer state, measured bytes, safe failure feedback and optional guarded Cancel/Retry actions. Observing or unmounting it never owns task lifetime. Import from `@uninterface/uninterface`.

## API

```ts
export interface UiUploadProgressBinding {
  readonly target: 'upload-progress'
  readonly status: UiUploadStatus | 'idle'
  readonly fileName: string | null
  readonly progress: Readonly<UiUploadProgressValue> | null
  readonly issue: UiUploadIssue | null
  readonly cancelButton: UiButtonBinding | null
  readonly retryButton: UiButtonBinding | null
}
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

The issue describes transfer failure only; candidate validation and delivery errors belong to the workflow/region. Retry starts a fresh attempt through the producer, which must update the binding to follow that attempt. Failed-transfer Cancel abandons recovery through its producer, which must clear the recovery binding; an already failed task cannot be aborted again. A file descriptor does not grant retry permission. Cancelled uploads may supply Retry without an error; this is producer policy, not a requirement of the view.

## Observable verification

Exercise retained and service acquisition, validation/reset races, cancellation/retry, delivery failure and view unmount. Verify hidden progress/preview leaves acquisition locks intact, and disposal cannot publish a late result.
