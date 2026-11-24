# UiFeedbackHandle

Import this type from `@uninterface/uninterface`.

Factory-returned delivery object, not a class. `readonly active: boolean` is reactive. `update(patch: Partial<UiFeedbackMessage> | (() => UiFeedbackMessage)): void` merges a patch over the current source, or replaces the source with a getter. `dismiss(): void` removes this delivery. Every method is context-free. Replacement, reset, dismissal and disposal invalidate the handle; subsequent update/dismiss calls do nothing. Core owns identity and invalidation; backends only render its current projection. Verify an old handle cannot modify or dismiss a newer delivery and an update retains slot identity.

See [feedback routing](../../guides/feedback-routing.md) for ownership, complete examples and observable acceptance.
