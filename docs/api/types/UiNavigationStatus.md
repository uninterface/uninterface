# UiNavigationStatus

Exported from `@uninterface/uninterface`. idle means no confirmed key; loading means metadata resolution is pending; ready means a path or custom breadcrumb trail resolved; missing means no path was found; error means loading or validation failed. Current key remains observable in every state.

## API

```ts
export type UiNavigationStatus = 'idle' | 'loading' | 'ready' | 'missing' | 'error'
```

## Ownership and verification

See the [navigation menu guide](../../guides/navigation-menus.md) for ownership, examples and acceptance checks. Verify shared current state, refused requests, lazy resolution and disposal independently of view mounting. Backends own native presentation and keyboard/focus behavior.
