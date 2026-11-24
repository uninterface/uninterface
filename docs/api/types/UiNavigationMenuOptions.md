# UiNavigationMenuOptions

Exported from `@uninterface/uninterface`. driver supplies observation and requests. resolvePath supplies submenu keys followed by the destination; groups are transparent. Use it for unloaded deep links. resolveBreadcrumbs optionally supplies a different location trail. Resolver signals invalidate stale work without cancelling entry loads shared with other consumers.

## API

```ts
export interface UiNavigationMenuOptions {
  driver: UiNavigationDriver
  resolvePath?(key: string, context: { signal: AbortSignal }): readonly string[] | undefined | Promise<readonly string[] | undefined>
  resolveBreadcrumbs?(key: string, context: { signal: AbortSignal }): readonly UiNavigationCrumb[] | Promise<readonly UiNavigationCrumb[]>
}
```

## Ownership and verification

See the [navigation menu guide](../../guides/navigation-menus.md) for ownership, examples and acceptance checks. Verify shared current state, refused requests, lazy resolution and disposal independently of view mounting. Backends own native presentation and keyboard/focus behavior.
