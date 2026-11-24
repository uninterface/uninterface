# UiOverlayCancelReason

Cancellation reasons include the UiOverlayCloseTrigger values (including native drawer `drag`), explicit cancel, owner-disposed, view-removed, and the shared engine's compatible backdrop reason. The views report modal backdrop activation as outside. Anchor loss is a terminal error outcome because presentation is no longer possible, not a guarded dismissal. Business code may supply explicit reasons via session.cancel. Forced owner/view cleanup bypasses veto. Verify reason preservation and cleanup.

See [drawers and popovers](../../guides/drawers-and-popovers.md) for composition, ownership and evidence limits.
