# UiUploadDeliveryContext

A stable delivery ID for one accepted acquisition. Repeated destination delivery reuses this ID; receivers must be atomic or idempotent. Import from `@uninterface/uninterface`.

## API

```ts
export interface UiUploadDeliveryContext {
  // Stable across delivery retries for one successful acquisition.
  readonly deliveryId: string
}
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Retry delivery after a receiver failure: deliveryId stays stable for the accepted acquisition. A later acquisition receives a distinct ID. Verify the receiver’s atomic or idempotent handling. See the [shared workflow acceptance cases](../../contracts/upload-region.md#acceptance).
