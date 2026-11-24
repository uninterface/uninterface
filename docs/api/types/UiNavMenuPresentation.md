# UiNavMenuPresentation

Exported from `@uninterface/uninterface`. horizontal is the default. vertical-tree keeps independent disclosed branches in flow. vertical-popup uses labelled roots with flyouts; icon-popup hides only root labels and supplies menu-item artwork when a root destination lacks an icon. No automatic breakpoint is chosen.

## API

```ts
export type UiNavMenuPresentation = 'horizontal' | 'vertical-tree' | 'vertical-popup' | 'icon-popup'
```

## Ownership and verification

See the [navigation menu guide](../../guides/navigation-menus.md) for ownership, examples and acceptance checks. Verify shared current state, refused requests, lazy resolution and disposal independently of view mounting. Backends own native presentation and keyboard/focus behavior.
