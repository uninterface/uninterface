# createUiFeedbackTarget

Import from `@uninterface/uninterface`.

`createUiFeedbackTarget(): UiFeedbackTarget` creates a virtual, single-current-message destination. Place `<UiNotice :binding="target.bindings.notice" />` where the business design needs feedback, then connect routes with createUiFeedbackRoute. No Vue setup context or provider is required to create the control. The owner disposes it when its business lifetime ends; view unmount alone does not dispose it. Core owns replacement/reset/disposal; backends render the notice's normalized content. Verify pre-mount send, view remount, target-wide reset and disposal of stale handles.

See [feedback routing](../../guides/feedback-routing.md) for complete usage, reset subscriptions and lifecycle obligations.
