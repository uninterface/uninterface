# UiUploadDestination

Exactly one business destination: a retained descriptor field, or a synchronous service receiver returning undefined. The field owns the value; a receiver owns collection insertion. Async receivers and mixed owners are unsupported. Import from `@uninterface/uninterface`.

## API

```ts
export type UiUploadDestination<H, M = unknown> =
  | {
      field: UiFieldControl<UiFileDescriptor<H, M> | null>
      receive?: never
    }
  | {
      field?: never
      receive: (
        file: UiFileDescriptor<H, M>,
        context: UiUploadDeliveryContext,
      ) => undefined
    }
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Exercise retained and service acquisition, validation/reset races, cancellation/retry, delivery failure and view unmount. Verify hidden progress/preview leaves acquisition locks intact, and disposal cannot publish a late result.
