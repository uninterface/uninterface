# UiRegionLayoutDivision

Interface exported from `@uninterface/uninterface`:

```ts
interface UiRegionLayoutDivision {
  start?: number | 'content'
  main?: number | 'content'
  end?: number | 'content'
}
```

Describes space allocation by region name for [UiRegionLayout](../components/UiRegionLayout.md). Every numeric value must be positive and finite. Content allocation uses intrinsic content size; numeric values divide distributable space proportionally and require full extent on the arrangement axis when participating.

Unspecified start/end shares use content size. Unspecified main receives one proportional share when the arrangement axis is full, otherwise content size. Omitted regions use no space; their settings are retained by the binding for when they participate. Invalid entries and unknown region names fail even if that region is absent.

This is an allocation description, not a CSS grid definition, region visibility controller, or resizing policy. Core projects it onto the participating regions; backends fulfill the shared UiLayout geometry contract. Tests verify shares stay associated with their region when outer content is added or removed.
