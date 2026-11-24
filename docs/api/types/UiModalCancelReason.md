# UiModalCancelReason

Cancellation source for `UiModalResult` and session cancellation. Import from `@uninterface/uninterface`.

`cancel | escape | backdrop | close-button | owner-disposed | view-removed`

The first four describe explicit or user requests. The three built-in user routes use [UiModalCloseTrigger](UiModalCloseTrigger.md). The last two describe forced lifetime interruption; their cleanup cannot be vetoed. Ordinary requests consult the close policy. A reason is not evidence that business data was discarded or persistence rolled back.

Core supplies teardown reasons; backend views report enabled input affordances; business callers normally use cancel(). Verify Escape/backdrop defaults and forced teardown settlement. See the [guide](../../guides/modals.md).
