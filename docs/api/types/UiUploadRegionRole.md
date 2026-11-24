# UiUploadRegionRole

Derived destination role: retained for a field, service for a receiver. Presentation defaults follow this role; authors do not synchronize a second role prop. Import from `@uninterface/uninterface`.

## API

```ts
export type UiUploadRegionRole = 'retained' | 'service'
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Verify retained destinations keep the accepted result in their field, while service destinations hand off without taking collection membership ownership. See the [shared workflow acceptance cases](../../contracts/upload-region.md#acceptance).
