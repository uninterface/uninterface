# UiOverlayCloseRequest

Non-error outcome passed to beforeClose: `{ status: 'completed'; value: T } | { status: 'cancelled'; reason: UiOverlayCancelReason }`. Generic T defaults to void. Returning false preserves the session; returning true accepts the transition. The business can distinguish accepted completion from abandonment without frame knowledge of forms. Terminal errors and forced view/owner removal bypass this policy. Verify denial followed by acceptance and pending-decision races.

See [drawers and popovers](../../guides/drawers-and-popovers.md) for composition, ownership and evidence limits.
