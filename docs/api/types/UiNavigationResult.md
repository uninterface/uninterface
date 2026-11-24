# UiNavigationResult

Exported from `@uninterface/uninterface`. completed and unchanged are successful UI completion. blocked/cancelled/failed retain the confirmed current location. completed includes redirects; read driver.current for the actual destination. Exceptions normalize to failed; stale requests return cancelled.

## API

```ts
export type UiNavigationResult =
  | { status: 'completed' | 'unchanged' | 'blocked' | 'cancelled' }
  | { status: 'failed'; error: unknown }
```

## Ownership and verification

See the [navigation menu guide](../../guides/navigation-menus.md) for ownership, examples and acceptance checks. Verify shared current state, refused requests, lazy resolution and disposal independently of view mounting. Backends own native presentation and keyboard/focus behavior.
