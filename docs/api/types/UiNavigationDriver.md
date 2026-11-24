# UiNavigationDriver

Exported from `@uninterface/uninterface`. The application owns current. navigate reports an outcome and commits state only when accepted. href is optional and must describe the same destination as navigate. Honor signal before committing asynchronous work where possible; cancellation cannot promise rollback of an external router.

## API

```ts
export interface UiNavigationDriver {
  readonly current: MaybeRefOrGetter<string | undefined>
  href?(key: string): string | undefined
  navigate(key: string, context: { signal: AbortSignal }): UiNavigationResult | Promise<UiNavigationResult>
}
```

## Ownership and verification

See the [navigation menu guide](../../guides/navigation-menus.md) for ownership, examples and acceptance checks. Verify shared current state, refused requests, lazy resolution and disposal independently of view mounting. Backends own native presentation and keyboard/focus behavior.
