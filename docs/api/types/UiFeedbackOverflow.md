# UiFeedbackOverflow

Import from `@uninterface/uninterface`.

`'queue' | 'dismiss-oldest' | 'reject'` defines admission when visible capacity is occupied. Core supplies the same policy across backends. Queue waits FIFO; dismiss-oldest closes the oldest active item and preserves newest replacements during exit bursts; reject returns an already-closed handle with reason rejected. Exiting native surfaces retain their capacity until cleanup. Pending capacity has a separate overflow option. Verify bursts, persistent occupants and reset during exit.

See [toasts and notifications](../../guides/toasts-and-notifications.md) for complete examples, consumer obligations and acceptance.
