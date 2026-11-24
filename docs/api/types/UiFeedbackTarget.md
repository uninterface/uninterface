# UiFeedbackTarget

Import this type from `@uninterface/uninterface`.

Factory-created object with `readonly bindings: { readonly notice: UiNoticeBinding }`, `reset(): void` and `dispose(): void`. A virtual target retains one current delivery across borrowing view mounts. New sends replace its previous delivery. Reset clears the current item from any route. Disposal clears it and rejects subsequent sends; disposal/reset are context-free and idempotent. Core owns state and isolation; the backend renders through UiNotice. Verify two connected routes cannot clear each other's items through route reset, while target reset clears either.

See [feedback routing](../../guides/feedback-routing.md) for ownership, complete examples and observable acceptance.
