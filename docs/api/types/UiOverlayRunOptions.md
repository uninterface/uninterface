# UiOverlayRunOptions

Per-run optional hooks: setup(session), opened(session), beforeClose(request, session) and teardown(session, result). All may return promises; beforeClose must resolve to boolean. Generic T defaults to void.

Setup completes before presentation. Opened follows mounted presentation and may request editor focus. Teardown follows presentation cleanup, including partial setup failures. Hooks belong inside the reusable business composition. They must terminate and cooperate with session.signal. Never await the run itself or dispose the owner from its hooks. Terminal cleanup does not await asynchronous opened work; late work must check its signal. Core captures hook failures and preserves cleanup diagnostics. Verify order, rejection, abort cooperation and stale work.

See [drawers and popovers](../../guides/drawers-and-popovers.md) for composition, ownership and evidence limits.
