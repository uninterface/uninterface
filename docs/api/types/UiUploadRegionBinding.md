# UiUploadRegionBinding

Producer-independent region target. Supplies workflow phase, descriptor, role, optional progress, guarded named actions and atomic acceptance. Core combines local restrictions; backend receives resolved render data, never the producer controller. Custom producers must maintain revision/ownership and single-file guards. Import from `@uninterface/uninterface`.

## API

```ts
export interface UiUploadRegionBinding {
  readonly target: 'upload-region'
  readonly phase: UiUploadRegionPhase
  // Derived from destination ownership, not another author-selected mode.
  readonly role: UiUploadRegionRole
  readonly file: UiFileDescriptor | null
  // Non-null when this workflow supports upload, including before a task starts.
  readonly progress: UiUploadProgressBinding | null
  readonly actions: Readonly<
    Partial<Record<UiUploadRegionAction, UiButtonBinding>>
  >
  readonly revision: number
  readonly canAcquire: boolean
  readonly busy: boolean
  readonly occupied: boolean
  readonly fileName: string | null
  readonly issue: UiUploadIssue | null
  acquire(
    files: readonly File[],
    guard: UiUploadAcquisitionGuard,
  ): Promise<UiUploadOutcome<unknown>>
}
```

## Ownership and implementation

See the [upload workflow guide](../../guides/files.md) and [upload-region contract](../../contracts/upload-region.md). Controls own operations and business destinations; views own neither. Bindings remain stable reactive projections rather than copied snapshots. Phase selects the state presentation; availability getters remain authoritative for operations. Custom producers must keep phase, busy, occupied and permissions consistent. Local presentation cannot grant an operation forbidden by its owner.

## Observable verification

Exercise retained and service acquisition, validation/reset races, cancellation/retry, delivery failure and view unmount. Verify hidden progress/preview leaves acquisition locks intact, and disposal cannot publish a late result.
