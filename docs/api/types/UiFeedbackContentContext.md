# UiFeedbackContentContext

Import from `@uninterface/uninterface`.

Per-delivery content-slot argument: `readonly item: UiFloatingFeedbackHandle`, `readonly feedback: UiFeedbackMessage`, `dismiss(): void`. Feedback is current semantic metadata with UiTextSource values; resolve/use getters appropriately in custom components. The slot is invoked only for presented content. Business components own internal sessions; core supplies stable delivery identity and backend supplies its native shell. Verify different concurrent content components and metadata updates without draft remount.

See [toasts and notifications](../../guides/toasts-and-notifications.md) for complete examples, consumer obligations and acceptance.
