# UiOverlaySession

Run-specific handle supplied to hooks and content slots; generic T defaults to void. Read-only id and signal identify the run and cooperative abort lifetime. complete(value: T): Promise<boolean> and cancel(reason?: UiOverlayCancelReason): Promise<boolean> consult beforeClose, return false for denial/stale/overlapping requests, and resolve after accepted cleanup. fail(error): boolean requests terminal error and bypasses veto.

Keep this handle across awaits; never retrieve a newer session to publish old work. Cleanup failure appears in the run result even if closure was accepted. Core owns identity and settlement; the business owns operations and must cooperate with signal. Verify late callbacks and exactly-once completion.

See [drawers and popovers](../../guides/drawers-and-popovers.md) for composition, ownership and evidence limits.
