# UiModalSession

Invocation-specific handle supplied to run hooks and UiModal slots. Import the generic type from `@uninterface/uninterface`.

- `id: number`: monotonic identity within its control; not a global identifier.
- `signal: AbortSignal`: aborted when terminal cleanup begins.
- `complete(value: T): Promise<boolean>`: request completion through the close guard.
- `cancel(reason?: UiModalCancelReason): Promise<boolean>`: request cancellation; default reason is `cancel`.
- `fail(error: unknown): boolean`: synchronously request terminal error and cleanup, bypassing the guard.

True means an accepted transition, not a successful business operation. Complete/cancel resolve after cleanup; the run result records any cleanup failure. Stale handles, overlapping decisions and calls after terminal transition return false. Complete/cancel require the open phase; fail also works during setup. Retain this handle across awaits instead of looking up a later session.

Core rejects obsolete publication. Business work cooperates with the abort signal; cancellation does not undo dispatched operations. Verify stale handles, duplicate requests, close denial and explicit failure. See the [guide](../../guides/modals.md).
