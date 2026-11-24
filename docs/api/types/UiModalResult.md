# UiModalResult

Discriminated outcome of an awaited modal run. Import from `@uninterface/uninterface`.

```ts
type UiModalResult<T> =
  | { status: 'completed'; value: T }
  | { status: 'cancelled'; reason: UiModalCancelReason }
  | { status: 'error'; error: unknown }
```

Completion carries the business-supplied value, including null/false/undefined where T permits. Cancellation is normal flow with a reason. Error preserves the original caught value; combined operation/cleanup failures use AggregateError with the primary failure as cause. Do not assume every thrown value is an Error instance.

Core settles once after cleanup/teardown. Hosted code handles recoverable errors itself or explicitly relays terminal failure. No global catch for detached promises is installed. Verify distinct outcomes and error identity; see the [guide](../../guides/modals.md).
