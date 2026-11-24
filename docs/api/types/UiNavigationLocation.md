# UiNavigationLocation

Navigation destinations and bindings: `UiNavigationLocation` is exported from `@uninterface/uninterface`.

## API

```ts
export interface UiNavigationLocation {
  key: string
  label: UiTextSource
  href: string
  parent?: string
  disabled?: boolean
}
```

## Ownership and implementation

Application navigation remains the owner of the current location. A request may be declined or confirmed asynchronously; only the application commits current. Link bindings expose ordinary navigation without intercepting modified clicks. Hierarchies require unique keys and acyclic parent relationships.

See the [navigation destinations and bindings guide](../../guides/navigation-and-tooltips.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify ordinary activation requests navigation without committing current, modified clicks remain native, and the breadcrumb path ends at the current location.

`label` accepts [UiTextSource](UiTextSource.md). Core resolves it reactively before presentation; changing text preserves identity and interaction state. Functions must return text synchronously without side effects. See [text-source usage and verification](../../guides/text-sources.md).
