# UiFeedbackCloseReason

Import from `@uninterface/uninterface`.

`'dismissed' | 'timeout' | 'overflow' | 'rejected' | 'reset' | 'disposed' | 'presentation-error'`. Explains why a floating delivery became inactive. `handle.reason` is available when closure starts; `handle.closed` settles with that reason when cleanup completes. An already-closing item's original reason remains when target disposal forces cleanup. Core owns reasons; backend reports user close/native exit. Verify every admission and cleanup path without confusing rejection with successful display.

See [toasts and notifications](../../guides/toasts-and-notifications.md) for complete examples, consumer obligations and acceptance.
