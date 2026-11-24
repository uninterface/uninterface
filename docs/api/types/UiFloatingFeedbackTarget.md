# UiFloatingFeedbackTarget

Import from `@uninterface/uninterface`.

Factory-created toast/notification destination: readonly `kind: 'toast' | 'notification'`, readonly `state.items: readonly UiFloatingFeedbackHandle[]`, `state.queued: number`, `state.visible: number`, and context-free reset/dispose. Items include queued, visible and closing deliveries; counts distinguish active visible and waiting entries. Reset clears all deliveries; dispose immediately cleans up, settles handles and rejects future sends. Creation scope and application teardown dispose automatically. Core owns queue; backend presents automatically without an author-placed host. Verify application/modal scope, reset, explicit disposal and no process-global state.

See [toasts and notifications](../../guides/toasts-and-notifications.md) for complete examples, consumer obligations and acceptance.
