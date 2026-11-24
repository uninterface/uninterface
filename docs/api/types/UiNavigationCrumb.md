# UiNavigationCrumb

Exported from `@uninterface/uninterface`. key identifies a crumb, label supplies text, and destination optionally supplies an actual navigation key. Intermediate crumbs without destination are text. The final crumb is always current text; it must describe the confirmed location, not a requested location.

## API

```ts
export interface UiNavigationCrumb {
  key: string
  label: UiTextSource
  destination?: string
}
```

## Ownership and verification

See the [navigation menu guide](../../guides/navigation-menus.md) for ownership, examples and acceptance checks. Verify shared current state, refused requests, lazy resolution and disposal independently of view mounting. Backends own native presentation and keyboard/focus behavior.

`label` accepts [UiTextSource](UiTextSource.md). Core resolves it reactively before presentation; changing text preserves identity and interaction state. Functions must return text synchronously without side effects. See [text-source usage and verification](../../guides/text-sources.md).
