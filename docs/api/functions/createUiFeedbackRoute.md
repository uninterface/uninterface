# createUiFeedbackRoute

Import from `@uninterface/uninterface`.

`createUiFeedbackRoute({ target }: { target: UiFeedbackTarget }): UiFeedbackRoute` connects explicitly to a factory-created target. `send(messageOrGetter)` returns an individual update/dismiss handle. `reset` is a context-free callback clearing this route's delivery; `dispose` clears its delivery and rejects future sends. Other routes sharing the target are unaffected by route cleanup. Core owns routing and lifetime; the UiNotice backend owns presentation. Verify replacement, stale-handle isolation, scoped reset and target disposal. Producers must still guard stale asynchronous sends.

See [feedback routing](../../guides/feedback-routing.md) for complete usage, reset subscriptions and lifecycle obligations.

The floating-target overload `createUiFeedbackRoute({ target: UiFloatingFeedbackTarget }): UiFloatingFeedbackRoute` returns queued delivery handles and accepts optional per-item duration/content on send. Target policy replaces notice single-current semantics for this overload. See [toasts and notifications](../../guides/toasts-and-notifications.md).
