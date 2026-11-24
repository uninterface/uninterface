# UiNavMenuBinding

Exported from `@uninterface/uninterface`. A producer-independent projection for UiNavMenu. currentKey is confirmed independently of metadata status. currentPath contains resolved submenu ancestry and the destination. request intercepts ordinary clicks synchronously and returns an outcome. retry resolves metadata again. The consumer borrows control and never disposes it.

## API

```ts
export interface UiNavMenuBinding {
  readonly control: UiEntryControl
  readonly currentKey: string | undefined
  readonly currentPath: readonly string[]
  readonly status: UiNavigationStatus
  readonly disabled: boolean
  href(key: string): string | undefined
  request(key: string, event?: MouseEvent): Promise<UiNavigationResult>
  retry(): Promise<void>
}
```

## Ownership and verification

See the [navigation menu guide](../../guides/navigation-menus.md) for ownership, examples and acceptance checks. Verify shared current state, refused requests, lazy resolution and disposal independently of view mounting. Backends own native presentation and keyboard/focus behavior.
