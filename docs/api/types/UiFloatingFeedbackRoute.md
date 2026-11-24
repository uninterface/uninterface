# UiFloatingFeedbackRoute

Import from `@uninterface/uninterface`.

Factory-created route connected to UiFloatingFeedbackTarget. `send(message: UiFeedbackMessageSource, options?: UiFeedbackSendOptions): UiFloatingFeedbackHandle`, `reset(): void`, `dispose(): void`. Route reset/disposal affects only its own current deliveries, including queued entries; other routes remain intact. A rejected send returns a closed handle with reason rejected; sending after disposal throws. Producers own stale asynchronous guards. Core dispatches to the target and backend-native automatic presentation. Verify scoped cleanup, rich/ordinary sends and queued/exit lifecycle.

See [toasts and notifications](../../guides/toasts-and-notifications.md) for complete examples, consumer obligations and acceptance.
