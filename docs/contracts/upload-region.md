# Upload region contract

See [UiUploadRegion](../api/components/UiUploadRegion.md), the [workflow factory](../api/functions/createUiUploadRegionControl.md), [progress](../api/components/UiUploadProgress.md) and the [usage guide](../guides/files.md). Broader asynchronous receiving and general nested fill hosting are not supported.

## Meaning and ownership

UiUploadRegion is a visibly framed single-file acquisition region, using the backend's ordinary control or compatible drop-area treatment. A full outline or dashed dropzone is not required; a consistent native filled field surface with a bottom border can fulfill the boundary. The whole visible rectangle receives file drops, with a native-compatible chooser that supports keyboard access. Independent actions do not open a chooser. A business component chooses optional progress/preview/action participation; each backend owns all internal layout. Authors do not arrange those functions through slots, UiLayout or CSS.

| Owner | Responsibility |
|---|---|
| Business component | Destination field or synchronous receiver, transport configuration, permissions and lifetime; external hosting when desired |
| Workflow control | Atomic acquisition, candidate validation, association locks, task observation, retry/delivery and stale-result guards |
| Upload controller/task | Byte transfer, cancellation, measured progress and result |
| Progress view | Present a transfer attempt: activity/Cancel or failure/Cancel/Retry, forwarding guarded requests without owning tasks or values |
| Region view | Compose acquisition, transfer presentation and retained result; keep candidate/delivery feedback separate |
| Backend | Native presentation, full boundary, optional internal arrangement, bounded fitting, accessibility and focus mechanics |

The retained field is the sole business value owner. A service region receives and hands off a result before readiness; it never owns collection membership. Removing association does not delete remotely. Progress is reusable independently of the region; preview resources remain tied to their presentation owner. The three controller patterns and exact APIs are linked in the [API index](upload-region-api.md).

## Acquisition and recovery

Validation claims an admission lock before awaiting. Queued/uploading blocks chooser and drops even with external/omitted progress. Association blocks acquisition even when preview is omitted or fails. Checks revalidate permissions after asynchronous boundaries; chooser results opened under an earlier generation cannot replace current state. Unavailable file drops prevent browser navigation. Multiple files/directories are rejected as a batch.

Transfer failure/cancellation returns to ready without occupancy; optional retry data and feedback may remain. Retry revalidates a candidate and creates a fresh task. A new accepted candidate supersedes old recovery. Successful retained delivery edits its field and stays occupied. Successful service delivery inserts synchronously before readiness. Delivery failure retains the result; retryDelivery never retransfers bytes. Receivers must be synchronous and atomic/idempotent; releaseResult explicitly stops retaining an undelivered result and never deletes it remotely.

Control-level disabled and readonly restrict edits; readonly permits an otherwise allowed Cancel. Local restrictions narrow the respective view, not all external actions. Busy/occupied acquisition locks never blanket-disable Cancel. View removal only unsubscribes. Workflow disposal cancels its task, invalidates delivery and releases field registrations, preserving shared controller and retained data.

## Optional presentation and allocation

Progress defaults to available upload support; preview defaults to retained-role association. Explicit false suppresses the activity indicator or preview independently; essential transfer feedback and selected Retry remain. actions is a participation set, not order/authorization; omission selects supported actions and an empty array omits optional actions. Busy state, identity, chooser access when eligible and essential feedback remain perceivable. No mandatory blank progress/preview/action bands are introduced.

Presets request a stable block allocation chosen by each backend for its native controls. There is no shared pixel/rem minimum. Compact/large presets remain available; parent layout controls width. Native full-page padding may be adapted to a field-sized region. The region never supplies internal scrolling, including for long feedback or zoom. Fit each state inside the allocated rectangle; previews use a bounded cell and images preserve their requested fit. Error summaries and filenames may ellipsize, retaining full text in the DOM and title. Recovery presents one error line plus available actions; failed acquisition or delivery does not add another filename row. An associated file uses a compact Row summary during error recovery. Do not hide essential actions to make content fit. Detailed diagnostics belong outside this control, and business error messages must be concise. Hosts must respect the backend minimum allocation, including in fill mode. Fill requires a definite local Uninterface height offer and does not infer one from arbitrary ancestors. Unsupported hosts fail explicitly.

### Backend minimum allocation

These CSS minima are backend constraints, not additional author sizing props. Presets and fill honor them; a host offering less space cannot expect the control to shrink its actions or become scrollable.

Each backend documents its minimum inline/block allocation and compact/regular/large preset sizes. These are native presentation constraints, not shared numeric defaults.

Fill uses compact interior spacing/artwork where needed so its declared minimum is usable, rather than retaining larger preset spacing. Verify minimum allocations and content/action bounds across states in a browser.

Applications changing native control sizing or localization must allocate enough space for those controls. Unsupported allocations are a sizing mismatch, never permission to introduce scrolling or clip interactive controls. Browser geometry acceptance remains required.

### State presentation

| State | Ordinary presentation | New acquisition |
|---|---|---|
| Ready | Native chooser/drop affordance | Allowed, subject to permissions |
| Validating/uploading/delivering | File identity, optional progress, available Cancel; chooser absent | Blocked |
| Transfer failed | File identity, one concise error, available Cancel/Retry and chooser; recovery actions share a row | Allowed |
| Cancelled | Chooser, optional Retry | Allowed |
| Retained success | File/optional compact preview and Remove; chooser absent | Blocked until removal |
| Service success | Return to ready after successful handoff | Allowed |
| Delivery failed | Retain the result, one concise error and Retry delivery | Blocked until recovery/release |

UiUploadProgress presents transfer errors with available Cancel and Retry both standalone and inside UiUploadRegion. Its failed state has no progress indicator. Failed-transfer Cancel abandons the attempt, clearing feedback and the retry candidate without changing the destination; active cancellation retains the existing optional retry policy. The binding supplies safe feedback, file identity and guarded actions; it never gives the view task ownership. Acquisition rejection and delivery failure remain region/workflow concerns. Cancellation is not an error; the existing optional retry policy may expose Retry without feedback.

Bindings expose phase so backends can present the current state coherently. Permission getters still guard every operation; phase alone never grants permission. The acquisition artwork is an empty-state affordance, not permanent decoration beside an uploaded file. The progress/recovery presentation visibly supplies its file identity; do not repeat that filename in the surrounding region. A file preview supplies its own filename where its presentation includes one; do not repeat it outside the preview.

Do not narrate the state machine. There is no default drop instruction paragraph, association explanation, or visible “Uploading” caption repeated beside the indicator. Accessible progress naming and a single optional off-screen announcement remain. Errors explain the failure once; button labels communicate recovery. Business-supplied error text should be short and actionable and must not expose transport/debug details. A normal demonstration succeeds; forced failure belongs in explicit test scenarios.

Changing requested extent, participation, locale or responsive context is an explicit context change. Ordinary upload/progress/failure/preview transitions must not change the occupied rectangle or neighbor positions. Preview fitting and loading/failure design remain separately reviewable. Disabling preview releases its local object URL without releasing association. Application-owned URLs are never revoked.

When focused actions disappear, choose an available acquisition/action target or the named region. Progress alone does not move focus. Required semantics on the group use a localized description, not unsupported aria-required on a button/group. Hidden descriptions are anchored inside the region and cannot expand its bounds. Internal/external progress hosts coordinate a single announcing instance.

Tab visits the available chooser and independent actions directly. The named group is a programmatic recovery target, not an additional Tab stop. An area-style chooser may transfer its visible focus indication to the enclosing upload surface; independent recovery actions retain distinguishable local indicators. Keyboard activation stays on the actual chooser button, and focus remains visible in forced colors.

Disabled regions have no focus target, including their named wrapper; the focus handle returns false. Disabling a region releases focus inside it and suppresses focus recovery until it is enabled. The backend reflects disabled state over the complete surface, retains drop interception and uses its ordinary control focus treatment when enabled. Readonly and busy acquisition locks do not imply a disabled region or blanket-disable permitted Cancel.

## Backend fulfillment

Native-first review includes installed component source and theme capabilities, not only wrapper APIs:

Concrete component choices, theme inputs and native semantic conflicts are documented by each backend. The adaptation must preserve guarded acquisition, independent actions, core-owned acceptance and bounded fitting without scrolling.

Backends own actual markup and may compose their native pieces independently. Core passes typed data/callbacks; it does not reduce adapters to CSS class maps. Native Cancel/removal permissions remain workflow-owned. New backend views use static imports and no eager registry. Capabilities: upload.region.v2 and upload.progress.v1.

## Acceptance

1. Retained and service workflows preserve type/ownership and exactly-once successful handoff.
2. Lock acquisition during validation/transfer/association; reject stale chooser/drop/validation and same-key reset races.
3. Fail/cancel → ready; retry cannot overwrite a newer attempt; delivery recovery never retransfers.
4. Exercise progress-only, preview-only, both and neither, including external progress. No duplicate Cancel, unnecessary object URLs or optional blank bands.
5. Verify pending form validation, accepted baselines, disposal and borrowed-view hiding/remounting.
6. Verify native artwork/controls, focus, names/descriptions, abbreviated long feedback, no internal scrolling, action containment, full-boundary dropping and complete-region/neighbor geometry across sizes, narrow allocations, RTL, zoom and modes.
7. Keep unit/DOM evidence distinct from executed real-browser and assistive-technology acceptance; source mappings alone do not establish visual fidelity.

The retained preview is centered relative to the complete region. Removal uses a separately aligned icon-only trash button at the logical end (right in LTR), with a localized accessible name and hover title. The action must not shift the preview's center or overlap its content; both remain keyboard operable within the same region. With preview omitted, the filename occupies the centered content position.
