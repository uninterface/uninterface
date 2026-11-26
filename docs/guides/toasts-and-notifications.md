# Toasts and notifications

Use `createUiToastTarget` for compact, brief feedback and `createUiNotificationTarget` for concurrent, normally persistent notifications. Both connect to the existing `createUiFeedbackRoute`; neither requires a public host component, provider, or central content dispatcher. The installed backend automatically presents each destination in its native surface or documented native composition.

Create targets during component setup inside `createUiApplication`. The target captures that application and the creator's logical injection scope, including localization, native theme, strategies and a containing modal's popup destination. Pass the route to business operations that run later. The normal business pattern is a page- or application-owned target shared by operations, including operations initiated inside modals. Create it in that longer-lived owner and pass its route to producers. Closing the originating editor should not clear unrelated or still-relevant feedback. A target deliberately created inside modal content is an exceptional local destination whose lifetime ends with that content, not the recommended default. Creation outside component setup is rejected. Inline `createUiFeedbackTarget` remains independently constructible without setup.

```vue
<script setup lang="ts">
import { h } from 'vue'
import {
  createUiToastTarget, createUiNotificationTarget,
  createUiFeedbackRoute, UiButton,
} from '@uninterface/uninterface'
import ImportResult from './ImportResult.vue'

const toasts = createUiToastTarget({
  duration: 5000, maxVisible: 3, overflow: 'queue',
  placement: 'bottom-end',
})
const notifications = createUiNotificationTarget({
  duration: null, maxVisible: 5, maxPending: 20,
  overflow: 'queue', pendingOverflow: 'reject',
  placement: 'top-end',
})
const toast = createUiFeedbackRoute({ target: toasts })
const feedback = createUiFeedbackRoute({ target: notifications })

function saved() {
  toast.send({ kind: 'success', message: 'Changes saved.' })
}
function review(result: unknown) {
  return feedback.send(
    { title: 'Import completed', message: 'Three records need review.' },
    { content: ({ dismiss }) => h(ImportResult, { result, onDone: dismiss }) },
  )
</script>
<template><UiButton @click="saved">Send feedback</UiButton></template>
```

`ImportResult` is an application-owned business component. Its ordinary Vue template can contain fields, forms, actions, links, expansion and other content. Each delivery supplies its own optional content slot; without one the backend renders message/details. Standard actions remain ordinary UiButtons, and title/announcement metadata remains available alongside rich content. This is not an HTML-string API. Use localized UiTextSource getters for title/message/detail/action labels without sending again.

## Standard actions

Supply notification/toast completion actions through the message’s `actions` array. They use the same backend-private FooterActions arrangement as modal, drawer and popover `#actions`. The selected backend documents its logical action placement and flow. RTL mirrors placement. Declaration/DOM/Tab order and keyed button identity remain unchanged; backend spacing and wrapping require no consumer CSS. Native close controls are separate from business actions.

A button inside a custom `content` component remains part of that component’s layout. To place Acknowledge in a read-only report’s footer, supply it in the message action array. For an editable review, pass `item` into the content component. The component owns its form control and can publish its bound Save action through `item.update({ actions })` on mount. A stable UiForm `id` and the action’s matching `form` preserve native submission from the footer. Inline UiNotice has its own documented message-aligned recovery action arrangement.

## Toast versus notification presentation

The target kind may select a distinct backend presentation independently of duration, placement or capacity; this is backend-specific. Toasts emphasize a compact message with less title/body separation; notifications support a more distinct title/content structure. Both still accept full text, details, actions and custom content: compact does not mean truncation or a fixed height. The normal toast lifetime remains 5 seconds, with explicit persistence available for exceptional cases.

Toast and notification presentations have distinct needs: a brief toast may use compact inline title/close content, while editable notifications need a suitable header, scrollable body and optional action footer. Backends may use separate components or compose native facilities. Footer arrangement remains consistent with their other managed surfaces.

## Target options

Options are captured at creation, not watched mutable configuration. To deliberately change policy, dispose the old target and create a new one in a newly mounted owning composition. Several routes share a target's queue; separate targets have independent capacity and placement. Targets at the same viewport position may overlap; share one target when those senders must share arrangement/admission.

| Option | Default | Meaning |
|---|---|---|
| `duration` | Toast 5000ms; notification `null` | Unpaused presented milliseconds; `null` persists, 0 expires after presentation |
| `maxVisible` | Toast 3; notification 5 | Positive integer or `null` for unlimited; exiting items occupy their slot until native exit completes |
| `overflow` | `queue` | `queue`, `dismiss-oldest`, or `reject` when visible capacity is occupied |
| `maxPending` | `null` | Nonnegative integer or unlimited; 0 disallows waiting |
| `pendingOverflow` | `reject` | Reject incoming or `dismiss-oldest` waiting item when pending capacity is reached |
| `placement` | Toast `bottom-end`; notification `top-end` | `top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center`, `bottom-end`; start/end follow direction |
| `pauseOnHover` | `true` | Pause while a pointer is over the item |
| `pauseOnFocus` | `true` | Pause while focus is within the item |
| `pauseWhenHidden` | `true` | Pause while the owning document is hidden |

Automatic expiry has one core-owned clock; native auto-dismiss timers are disabled. Pauses preserve remaining time, including overlapping pause reasons. Time waiting for admission or presentation does not consume duration. Updates and locale changes do not reset expiry. Per-delivery `send(message, { duration })` overrides target duration, including persistence. Rich content is supported for either kind, but persistent notifications are recommended for editing workflows.

FIFO admission waits for native exit before filling a slot. Dismiss-oldest marks the oldest active delivery for closure, including waiting replacements during bursts, retaining the newest active deliveries up to the configured visible limit. Rejected requests still return a handle: it is already closed with reason `rejected`. There is no text-based deduplication. Persistent items can keep a queue waiting indefinitely; inspect `target.state.queued` and configure a policy appropriate to the operation. Count limits do not guarantee viewport fit: backend viewports also bound and scroll content, preserving changing item heights without cached service offsets.

## Delivery and rich content lifetime

A floating route returns `UiFloatingFeedbackHandle`: existing active/update/dismiss plus `id`, `phase`, `reason` and `closed`. Phases are queued → visible → closing → closed; queued cancellation skips presentation. `active` means updateable/dismissible (queued or visible); closing items are already inactive. `closed` settles after native exit, or immediately for an item never presented. Reasons distinguish dismissal, timeout, overflow, rejection, reset, disposal and content-presentation errors.

The content slot receives `{ item, feedback, dismiss }`. It mounts only on admission/presentation and remains keyed to the delivery until exit finishes. Updating message metadata or admitting/reordering other items does not recreate its component. Keep component types and keys stable inside the slot. Each business component owns its editing session; do not start hidden queued work by relying on a slot mounting immediately after send. The content function itself should only render. A failed child render closes that delivery as `presentation-error` and remains observable through the application's Vue error handler.

`route.reset()` and `route.dispose()` clear only that route's deliveries. Target reset clears all its queued/visible items; target disposal forcibly releases all resources, settles handles and rejects future sends. The creation scope automatically disposes its target on teardown. Application disposal also releases its targets, including SSR requests whose component teardown hooks never run. Explicit disposal remains available and idempotent. No feedback survives disposal; retain application-owned data separately if it must outlive the destination. Stale async send guards remain the producer's responsibility.

There is no asynchronous close-veto API in this slice. `dismissible: false` removes user close/Escape handling; it does not prevent explicit owner dismissal, configured timeout/eviction or target cleanup. Choose persistence and queue admission for important drafts, and save durable business data outside notification lifetime. Closing one item never disposes another item's session.

## Accessibility, scope and native presentation

Floating feedback defaults to polite announcement, independently of severity. Off disables announcement and assertive is explicit. A separate, locally contained live region announces title/message/details after mounting; interactive custom content and action labels are excluded. Arrival does not capture focus. Dismissal only recovers focus if the disappearing item currently contains it. Keyboard interaction continues to another available item, then falls back to the connected origin. After pointer interaction, recovery returns to the connected origin outside feedback, or to the viewport when that origin is unavailable; it does not focus a sibling and inadvertently pause its countdown. Genuine focus within an item still pauses its timer when pauseOnFocus is enabled. Escape is scoped to the focused item, honors already-handled descendant events, and does not close unrelated notifications from document-wide handlers. Native close controls remain localized and keyboard operable.

Both toast and notification deliveries provide a named keyboard entry point: either their native surface or a designated content region. Keyboard focus on that entry point highlights the whole delivery. Moving into an input, link or button removes the outer ring and shows only that control's indicator; returning to the content region restores the outer ring. This is the shared [backend focus standard](../api/backend/feedback.md#toast-and-notification-focus-standard), rendered with each backend's own focus styling. It adds no business-side markup or focus handling. The content region keeps actual focus and any keyboard scrolling behavior; it has no duplicate inner outline. Focus within child controls still pauses dismissal when configured, independently of where the indicator is drawn.

Notifications are nonmodal. A target created outside an active modal remains in its original page scope and does not bypass native modality. The current implementation does not automatically move page-owned feedback into an active modal. An explicitly modal-local destination can serve specialized interaction there, but couples presentation to that local lifetime; it is not the ordinary ownership pattern. For a completed modal operation, send the page-owned result after the modal closes. Nested controls use the inherited modal portal and shared dynamic z-order protocol. Feedback is client presentation: SSR creates queued state without visible overlays/timers; application request cleanup is still required. This is in-memory delivery, not a durable notification inbox or cross-navigation store.

Native integrations, lifecycle bridges and limitations are documented by each backend.

Backend adaptation preserves compatible native border/elevation, close artwork, content/action spacing and entry/exit motion, with viewport clearance for shadows and focus. Rich content uses suitable block markup. Document motion adaptations and reduced-motion behavior in the backend.

Countdown presentation depends on the backend’s documented support. Native service features are not automatically exposed through target options. When supplied, a countdown follows the core remaining-time clock, pauses with that clock and is absent for persistent deliveries.

The existing feedback variant field does not currently select floating surface variants; floating views retain native treatments. Color mappings and appearance remain backend-owned. Retain close affordances and viewport clearance while suppressing conflicting document-wide dismissal handlers only for managed feedback. Customization follows the backend’s theme setup and stable style.css; viewport size/spacing rules are backend presentation, not sender props. No universal native notification service or complete theme/strategy parity is implied.

## Observable verification

Bind one localized message to an inline notice, toast or notification using the [feedback routing pattern](feedback-routing.md). When routes share a target, change the destination and verify that only subsequent sends use it. Reset one route and verify that deliveries from other routes survive. Update or dismiss one rich notification while editing another and verify that the second draft survives.

Verify delivery before mount, pending cancellation, finite and unlimited capacity, each overflow policy, admission after exit, timer pause and expiry, disabled actions, pause while the document is hidden, keyboard dismissal, focus retention, application isolation and modal-local content. In a browser, check geometry, visible focus and touch scrolling. Use assistive technology to verify announcements.

### Feedback after modal editing

For a record editor opened in a modal, show save failures in an inline UiNotice inside the editor so the user can correct or retry. After a successful save, complete the modal and send a success toast through a page-owned target. The page keeps the target alive when an editor closes and disposes it when the page owner ends. Use an application-lifetime owner for feedback that must survive navigation.

Use one announcement for successful save. Verify that failure preserves the draft for retry, success releases the editor before the toast appears, focus returns to the opener, cancellation sends no success toast, and disposal releases delivery resources.
