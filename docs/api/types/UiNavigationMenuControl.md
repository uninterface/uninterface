# UiNavigationMenuControl

Exported from `@uninterface/uninterface`. The entry-control overload of createUiNavigationControl returns this factory-created object. It adds bindings.navMenu to the existing cached link and breadcrumb bindings. dispose stops observations and invalidates requests/resolutions, disabling stale menu/link bindings; it does not dispose the entry control or driver.

## API

```ts
export interface UiNavigationMenuControl extends UiNavigationControl {
  readonly bindings: UiNavigationControl['bindings'] & { readonly navMenu: UiNavMenuBinding }
}

/** Find only known entries: never search an unloaded branch by fetching it. */
```

## Ownership and verification

See the [navigation menu guide](../../guides/navigation-menus.md) for ownership, examples and acceptance checks. Verify shared current state, refused requests, lazy resolution and disposal independently of view mounting. Backends own native presentation and keyboard/focus behavior.
