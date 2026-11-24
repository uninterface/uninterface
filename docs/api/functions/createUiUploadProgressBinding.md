# createUiUploadProgressBinding

Projects one existing upload task into reusable progress presentation. Import from `@uninterface/uninterface`.

## API

```ts
createUiUploadProgressBinding<H, M = unknown>(
  task: UiUploadTask<H, M>,
  options?: {
    canCancel?: () => boolean
    cancelButton?: UiButtonBinding
    retryButton?: UiButtonBinding
    describeError?: (error: unknown) => UiUploadIssue
  },
): UiUploadProgressBinding
```

The binding has target upload-progress, reactive status/filename/progress getters and a guarded Cancel button binding. Default Cancel aborts active tasks and is unavailable after the task ends. A producer may supply cancelButton to abandon failed recovery; it owns clearing/replacing the binding or unmounting the presentation. The optional canCancel getter further restricts both forms, and the supplied action’s disabled/loading state is honored. Failure uses a safe localized fallback, or describeError; exceptions in that formatter also fall back safely. Raw transport errors are never displayed by default. An optional producer-owned retryButton enables recovery. The projection never calls task.retry() or adopts a replacement task itself. The producer must guard retry and replace its task/binding when starting a fresh attempt.

## Ownership and implementation

This is a getter projection with no owned effects and no disposal method. The task/controller owner retains lifetime. Replacing a standalone task requires a new binding; `createUiUploadRegionControl().bindings.progress` already follows that workflow's current task and needs no adapter.

```vue
<UiUploadProgress :binding="progress" announcement="polite" />
```

Use after application-owned UiFileInput upload or in another existing task host. See [files](../../guides/files.md). It introduces no notification service.

## Observable verification

Verify measured/unknown progress, live cancellation permission, failure feedback, cancellation without an error, optional retry permission, task replacement, and that mounting/unmounting a progress view does not cancel a task.
