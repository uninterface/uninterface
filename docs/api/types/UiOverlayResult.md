# UiOverlayResult

Discriminated result: `{ status: 'completed'; value: T } | { status: 'cancelled'; reason: UiOverlayCancelReason } | { status: 'error'; error: unknown }`. Generic T defaults to void. Completion can carry false/null/undefined without confusing cancellation. Result delivery follows presentation cleanup and teardown; combined failures preserve original and cleanup diagnostics through AggregateError. Hosted recoverable save errors do not automatically terminate a run. Verify all outcomes and original error identity.

See [drawers and popovers](../../guides/drawers-and-popovers.md) for composition, ownership and evidence limits.
