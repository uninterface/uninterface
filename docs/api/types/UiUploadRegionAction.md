# UiUploadRegionAction

Semantic operation names for internal participation. The selection is neither display ordering nor authorization. remove releases association, cancel aborts transfer, retry repeats transfer, retryDelivery repeats only delivery. Import from `@uninterface/uninterface`.

## API

```ts
export type UiUploadRegionAction =
  | 'cancel'
  | 'retry'
  | 'retryDelivery'
  | 'remove'
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Change action participation without changing underlying permissions. Omitted or hidden optional actions cannot unlock acquisition during transfer or association. See the [shared workflow acceptance cases](../../contracts/upload-region.md#acceptance).
