# Upload region API and controller patterns

The per-export references below define supported declarations and behavior.

| Pattern | API | Responsibility |
|---|---|---|
| Shared transfer service | [createUiUploadController](../api/functions/createUiUploadController.md), [UiUploadController](../api/types/UiUploadController.md) | Application transport and task lifetime |
| Single attempt | [UiUploadTask](../api/types/UiUploadTask.md) | Result promise, cancellation, progress |
| Workflow coordinator | [createUiUploadRegionControl](../api/functions/createUiUploadRegionControl.md), [UiUploadRegionControl](../api/types/UiUploadRegionControl.md) | Acquisition, destination delivery, association, recovery, field coordination |
| Target projections | [UiUploadRegionBinding](../api/types/UiUploadRegionBinding.md), [UiUploadProgressBinding](../api/types/UiUploadProgressBinding.md), [UiButtonBinding](../api/types/UiButtonBinding.md) | Stable reactive state/guarded actions consumed without producer knowledge |
| Complete region presentation | [UiUploadRegion](../api/components/UiUploadRegion.md), [UiUploadRegionProps](../api/types/UiUploadRegionProps.md) | Backend-owned layout of optional semantic functions |
| Independently hosted activity | [UiUploadProgress](../api/components/UiUploadProgress.md), [createUiUploadProgressBinding](../api/functions/createUiUploadProgressBinding.md) | Observe task activity with optional Cancel; no new task owner |

Use the [file guide](../guides/files.md) for retained and service-handoff examples and the [contract](upload-region.md) for ownership/native fulfillment. Controls are factory-created objects, not classes. A business component can own all of these internally; ordinary consumers supply typed data and operations. A shared controller is appropriate when multiple workflows need it. No generic async-controller base class or progress controller is introduced.

## Workflow responsibilities

Use a typed result field for retained workflows, or a synchronous receive callback for service handoff. A local File field and a retained result field have distinct value types. The owning control outlives borrowed views until disposed, so hiding a view does not end delivery observation.

Select internal progress, preview and actions through semantic props. Their data and operations come from the region binding; the backend owns internal arrangement. Standalone bindings support externally hosted progress and buttons. [UiUploadProgressValue](../api/types/UiUploadProgressValue.md) describes loaded/total byte progress. Require `upload.region.v2` for the region and `upload.progress.v1` for progress presentation.

Fields have no dispose method. The workflow unregisters its private check, tracker and lifecycle participation; form and upload-controller disposal belong to their business owners. Private field lifecycle coordination observes reset, acceptance and external value edits separately from generic revision changes, so workflow notifications do not cancel themselves.
