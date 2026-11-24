# UiBreadcrumbItem

Navigation destinations and bindings: `UiBreadcrumbItem` is exported from `@uninterface/uninterface`.

## API

```ts
export interface UiBreadcrumbItem {
  readonly key: string
  readonly label: string
  readonly binding?: UiLinkBinding
}
```

## Ownership and implementation

Application navigation remains the owner of the current location. A request may be declined or confirmed asynchronously; only the application commits current. Link bindings expose ordinary navigation without intercepting modified clicks. Hierarchies require unique keys and acyclic parent relationships.

See the [navigation destinations and bindings guide](../../guides/navigation-and-tooltips.md) for usage and supported examples. Backends consume resolved view bindings rather than importing a particular business controller.

## Observable verification

Verify ordinary activation requests navigation without committing current, modified clicks remain native, and the breadcrumb path ends at the current location.
