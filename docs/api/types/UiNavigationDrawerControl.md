# UiNavigationDrawerControl

A factory-created object returned by [createUiNavigationDrawerControl](../functions/createUiNavigationDrawerControl.md). Import the type from `@uninterface/uninterface`; it is not a constructor or a navigation controller replacement.

| Member | Meaning |
| --- | --- |
| `drawer: UiOverlayControl<string>` | Owned modal run control; attach to exactly one `UiDrawer mode="modal"`. The completed value is the confirmed navigation key. Observe `drawer.state.phase` for the authoritative presentation lifecycle. |
| `bindings.navMenu: UiNavMenuBinding` | Stable projection borrowing source/current/path/hrefs from the supplied binding and coordinating ordinary navigation requests with the drawer. It is also usable by desktop navigation. |
| `state.pending: boolean` | Latest coordinated navigation request is pending; this does not disable the menu or own router activity. |
| `state.error: unknown` | Latest failed request, presentation or destination-handoff error. Cleared by a new request, opening or authoritative close. Business code supplies safe localized failure wording. |
| `open(): Promise<UiOverlayResult<string>>` | Opens the mounted drawer. Repeated calls during the run share its result. Settlement follows exit and content cleanup; the optional destination callback follows settlement. |
| `close(): Promise<void>` | Invalidates pending coordination/focus handoff and awaits cancellation/cleanup, including during setup. Use before removing the mobile host on a responsive transition. |
| `dispose(): Promise<void>` | Permanently disables the projection, stops observation, aborts handoff work and disposes the owned drawer. It does not dispose or cancel the borrowed navigation owner. |

Invoke through `open`/`close`; do not independently run/dispose the owned `drawer`, install competing run hooks or add an expansion owner. Native dismissal uses the drawer's session. One control may feed desktop and mobile menu views; each view retains its own expansion semantics. The control has no DOM, breakpoint detector, router dependency, automatic error notice or built-in trigger artwork.

Verify reactive read-only state, matching current/path across views, one request per activation, no stale-session settlement and independent borrowed-owner lifetime. Backend geometry and focus require real-browser checks. See the [usage guide](../../guides/drawer-navigation.md).
