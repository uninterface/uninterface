# createUiNavigationDrawerControl

Coordinate navigation with an owned modal drawer without prescribing a component tree. Import from `@uninterface/uninterface`. Requires core `navigation.drawer-control.v1`; its views require `drawer.v1`, `navigation.menu.v1` and the capabilities used by their trigger.

```ts
function createUiNavigationDrawerControl(
  navigation: UiNavMenuBinding,
  options?: UiNavigationDrawerOptions,
): UiNavigationDrawerControl
```

The factory borrows a producer-independent navigation binding and creates one drawer control. Use `control.drawer` with one `UiDrawer mode="modal"`, `control.bindings.navMenu` with `UiNavMenu`, and `control.open()` from the drawer host button. The wrapper binding can also serve desktop navigation while the drawer is idle. See [drawer navigation](../../guides/drawer-navigation.md) for a complete composition, ownership and responsive handoff.

Completed/unchanged requests close only after the binding confirms the requested current key. Blocked, cancelled and failed requests retain the drawer. External confirmed-location changes close an active drawer. Modified links remain native operations. A late request result cannot settle a newer run; an independently observed confirmed location remains authoritative. Pending work belongs to the borrowed navigation owner and is not cancelled by drawer dismissal.

The control owns coordination, generation checks and drawer cleanup. Backend views own rendering, modality, focus mechanics, motion and accessible host relationships. The application owns routing, permissions, responsive selection, safe user-facing failure messages and the destination focus callback. [useUiResponsiveNavigationSwitch](useUiResponsiveNavigationSwitch.md) can coordinate the rendered responsive change and focus recovery. The application must dispose this control and its separately owned navigation/entry controls.

Verify all navigation outcomes, synchronous interception, external changes, modified clicks, stale results, setup/exit dismissal, reuse and disposal. A control-only consumer must exclude backend views and optional router integration. Browser verification additionally covers header geometry, drawer scrolling, keyboard/touch and post-exit focus.
