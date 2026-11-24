# createUiNavigationControl

Navigation destinations and bindings: `createUiNavigationControl` is exported from `@uninterface/uninterface`.

## API

```ts
export function createUiNavigationControl(entries: UiEntryControl, options: UiNavigationMenuOptions): UiNavigationMenuControl;
export function createUiNavigationControl(locations: MaybeRefOrGetter<readonly UiNavigationLocation[]>, options: UiNavigationOptions): UiNavigationControl;
```

## Ownership and implementation

Application navigation remains the owner of the current location. A request may be declined or confirmed asynchronously; only the application commits current. Link bindings expose ordinary navigation without intercepting modified clicks. Hierarchies require unique keys and acyclic parent relationships.

See the [navigation destinations and bindings guide](../../guides/navigation-and-tooltips.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify ordinary activation requests navigation without committing current, modified clicks remain native, and the breadcrumb path ends at the current location.

The entry-control overload coordinates menu, breadcrumb and link projections through a driver. It borrows the entry control; dispose invalidates its own work only. See the [navigation menu guide](../../guides/navigation-menus.md) for lazy paths, custom breadcrumbs and the optional router adapter.
