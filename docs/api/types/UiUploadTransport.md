# UiUploadTransport

File acquisition and upload: `UiUploadTransport` is exported from `@uninterface/uninterface`.

## API

```ts
export type UiUploadTransport<H,M=unknown>=(file:UiFileDescriptor<File>,context:UiUploadContext)=>Promise<UiFileDescriptor<H,M>>
```

## Ownership and implementation

Local acquisition and remote persistence have separate owners. Descriptors carry identity and business values; transports own network requests and credentials. The upload controller owns task state and cancellation. Dispose it at the end of its business session. Views never invent a server endpoint.

See the [file acquisition and upload guide](../../guides/files.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify rejected replacement preserves the current file, cancellation prevents late result commitment, retry creates a new task, and preview-owned object URLs are revoked.
