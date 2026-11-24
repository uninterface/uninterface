# UiFloatingFeedbackHandle

Import from `@uninterface/uninterface`.

Extends [UiFeedbackHandle](UiFeedbackHandle.md), inheriting `active`, `update` and `dismiss`, with reactive readonly `id: string`, `phase: UiFeedbackPhase`, `reason: UiFeedbackCloseReason | undefined` and `closed: Promise<UiFeedbackCloseReason>`. Active means queued or visible. Update merges metadata or replaces its getter without resetting timeout/remounting rich content. Dismiss is context-free; stale operations are inert. Closed settles after native exit, or immediately if never presented. Core retains delivery identity while backends keep exiting surfaces alive. Verify queued update/cancellation, disposal, stale handles and retained draft identity.

See [toasts and notifications](../../guides/toasts-and-notifications.md) for complete examples, consumer obligations and acceptance.
