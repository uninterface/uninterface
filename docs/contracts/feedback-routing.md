# Feedback routing

Implemented for UiNotice and automatically presented toast/notification targets. See the [usage and ownership guide](../guides/feedback-routing.md).

A target is a virtual business-selected delivery destination, independent of its view. A route connects to one target at creation. Producers send semantic content and receive a controllable delivery handle. A notice binding projects current content; it does not inspect forms or infer operation outcomes.

UiNotice target policy is single-current replacement. Send replaces the existing delivery, update changes the current delivery, dismiss removes it. Inactive handles cannot affect successors. Route reset/disposal clears only that route's delivery; target reset/disposal clears the destination. Disposal rejects future sends. All reset/dismiss/dispose operations are context-free. View unmount does not own control disposal. Producer generation guards remain necessary for asynchronous work that sends after a newer operation.

Content is plain text plus optional details and ordinary button action authoring. A reactive source getter supports localization without creating a delivery. A binding and manual activation are mutually exclusive for each action, consistent with UiButton. Slots replace default content/actions while preserving ordinary Vue identity. Explicit destination props override delivered presentation. A bound close request dismisses and emits a view event; unbound close remains an owner-accepted request.

Core owns delivery state, visibility, capability checks and logical action composition. Backends fulfill notice.binding.v1 by rendering normalized message/details when the default slot is absent, retaining notice semantics, accessibility and toolkit presentation. Empty bound notices have no rendered view; core layouts recognize their explicit participation without inspecting opaque components. Backend-owned markup is not prescribed by core.

Feedback state is independent of validation, model state and persistence. Reset integration is explicit callback invocation or subscription, never an implicit reset signal watcher. UiFormControl.onReset publishes only accepted resets after baselines and state have been restored. The composition owns lifetime, focus handoff, content safety, localization and announcement policy. Initial insertion announcements still require browser/AT acceptance; routing supplies no hidden announcement service.

Acceptance includes stale handles, shared target isolation, disposal, remounts, localization without revival, native reset behavior, live button guards, slot identity and empty layout allocations. See the public guide for concrete usage and tests.

## Floating destinations

createUiToastTarget/createUiNotificationTarget own creation-time admission, lifetime, capacity and placement options. A floating route sends through the same producer/router/target model and returns observable queued/visible/closing/closed handles. Custom Vue content is per delivery, with backend default message rendering when absent. No public host component is required. Core coordinates app-scoped automatic mounting and queue/timer state; native backends own surfaces, rich content arrangement and exit callbacks. The creation scope owns target lifetime; application/SSR cleanup also releases it. Retain ordinary native modality and logical injection/z-order scope. See [toasts and notifications](../guides/toasts-and-notifications.md) for exact defaults, ownership, backend adaptations and browser acceptance limits.

Toast and notification backends must implement the [delivery focus standard](../api/backend/feedback.md#toast-and-notification-focus-standard): direct focus on the delivery surface or designated content region highlights the entire delivery, while child-control focus shows only the control indicator. Backend-native presentation and actual content focus/scrolling remain backend responsibilities; no additional sender or routing API is required.
