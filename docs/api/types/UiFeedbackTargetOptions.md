# UiFeedbackTargetOptions

Import from `@uninterface/uninterface`.

Creation-time toast/notification policy: `duration?: number | null` (toast 5000ms, notification null), `maxVisible?: number | null` (3/5), `overflow?: UiFeedbackOverflow` (queue), `maxPending?: number | null` (unlimited), `pendingOverflow?: 'reject' | 'dismiss-oldest'` (reject), `placement?: UiFeedbackPlacement` (bottom-end/top-end), and `pauseOnHover?`, `pauseOnFocus?`, `pauseWhenHidden?` booleans (true). Counts are integers, visible positive and pending nonnegative; null explicitly means unlimited. Duration is finite nonnegative milliseconds or null for persistence. Values are captured at creation. Core owns admission/timing; backend owns layout and native exits. Verify finite/unlimited capacity, overflow decisions, remaining-time pauses and explicit remount for policy changes.

See [toasts and notifications](../../guides/toasts-and-notifications.md) for complete examples, consumer obligations and acceptance.
