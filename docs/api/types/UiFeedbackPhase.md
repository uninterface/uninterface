# UiFeedbackPhase

Import from `@uninterface/uninterface`.

`'queued' | 'visible' | 'closing' | 'closed'`. Observable floating delivery lifecycle. Visible means admitted for presentation; the duration clock starts only after the backend reports presentation. Closing is already inactive but retains its native exit allocation. Queued dismissal skips rendering. Core owns state; backend exit completion releases capacity. Verify cancellation before mount and admission only after exit.

See [toasts and notifications](../../guides/toasts-and-notifications.md) for complete examples, consumer obligations and acceptance.
