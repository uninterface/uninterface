# createUiUploadRegionControl

Creates a business-owned single-acquisition workflow. Import from `@uninterface/uninterface`. It coordinates local candidates, optional transfer, retained association or synchronous handoff, recovery and lifetime. It does not render or own a destination field's baseline.

## API

```ts
createUiUploadRegionControl<H, M = unknown>(options: UiUploadRegionOptions & {
  uploadController: UiUploadController<H, M>
  destination: UiUploadDestination<H, M>
}): UiUploadRegionControl<H, M>

createUiUploadRegionControl(options: UiUploadRegionOptions & {
  uploadController?: never
  destination: UiUploadDestination<File>
  retry?: never
}): UiUploadRegionControl<File>
```

A destination has exactly one of `field` (a descriptor-or-null field with the same draft type) or `receive(file, { deliveryId }): undefined`. An upload destination receives the transport's typed descriptor; selection-only receives a local File descriptor. A field can have one active upload workflow. Candidate validation runs before transfer. Browser accept/capture are hints; servers still validate content.

`retry` defaults false. Optional `disabled`, `readonly` and `canCancel` getters supply live restrictions; effective field restrictions also apply. `describeError(error, stage)` maps exceptions to safe localized feedback; omission uses built-in messages. See [options](../types/UiUploadRegionOptions.md).

| Operation | Result and meaning |
|---|---|
| `acquire(files)` | Promise of UiUploadOutcome; admits exactly one file atomically, validates, uploads if configured and delivers. Locked/disposed requests return blocked. Multiple files/directories are rejected |
| `retry()` | Revalidates the retained failed/cancelled candidate and creates a new task. A newly accepted candidate supersedes old recovery |
| `retryDelivery()` | Delivers pendingResult again with its original delivery ID; never transfers bytes again |
| `cancel()` | Boolean indicating cancellation of a queued/uploading task or abandonment of a failed transfer. Failed-transfer Cancel clears the issue, task association and retry candidate without editing the destination. Active cancellation settles immediately even when transport ignores abort |
| `remove()` | Promise of boolean; edits a retained field to null. Does not delete remotely, reset a baseline or cancel a transfer |
| `releaseResult()` | Boolean; explicitly relinquishes an undelivered successful result and returns to ready. Does not delete a remote resource |
| `dispose()` | Idempotently invalidates work, aborts its task and unregisters field coordination. Does not dispose a shared upload controller or clear retained data |

Stable `bindings.region`, `bindings.progress` and ordinary `cancelButton`, `retryButton`, `retryDeliveryButton`, `removeButton` bindings project operations. `bindings.progress` includes file identity, transfer-only issue and guarded Retry, following each new attempt. Acquisition/delivery failures stay in region feedback; successful transfer followed by failed delivery must not invite reupload. `state` is read-only. No task command is exposed through state.task; task observation remains available. Expected failures return outcomes; invalid configuration/arguments may throw.

## Ownership and implementation

Create inside a reusable business component, disposing when its owning session ends. A borrowing view can disappear while the control still receives and delivers a result. A shared upload controller has its own owner; fields have no disposal method.

The field adapter registers an unfinished-work check/dirty tracker. Pending work blocks successful form validation without writing a File into a handle field. It notifies draft changes, preserves baselines, and observes reset/accept/external edits through private lifecycle coordination. It does not cancel itself on its own notifications. Form submission does not wait for transfer while holding editing locks. Completion while editing is prohibited retains a delivery failure for explicit recovery.

A receiver must be synchronous and atomic or idempotent; delivery retry cannot undo partial business mutations. Async receiving is rejected, not awaited. The delivery ID is stable across retries. Successful ordinary insertion needs no acknowledgment. Transport failure/cancellation releases occupancy; successful field delivery retains association even with preview hidden or failed.

See [files and uploads](../../guides/files.md) for complete examples and the [contract](../../contracts/upload-region.md) for limits.

## Observable verification

Controller tests cover immediate admission locks, stale validation/chooser generations, cancellation and late results, retry replacement, same-value reset, typed delivery, pending form validation, recovery and disposal. DOM checks across supporting backends cover view hiding/remounting and optional presentation. These are distinct from browser geometry and assistive-technology acceptance.
