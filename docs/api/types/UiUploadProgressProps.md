# UiUploadProgressProps

Standalone progress inputs. cancel and retry default to true when available; announcement defaults to off. A business-selected external host may request polite announcements. There is no required region ancestor. Import from `@uninterface/uninterface`.

## API

```ts
export interface UiUploadProgressProps {
  binding: UiUploadProgressBinding
  cancel?: boolean
  retry?: boolean
  announcement?: 'off' | 'polite'
}
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Exercise retained and service acquisition, validation/reset races, cancellation/retry, delivery failure and view unmount. Verify hidden progress/preview leaves acquisition locks intact, and disposal cannot publish a late result.
