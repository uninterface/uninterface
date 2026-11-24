# UiGridLayoutProps

Reactive properties for [UiGridLayout](../components/UiGridLayout.md). Import with `import type { UiGridLayoutProps } from '@uninterface/uninterface'`.

```ts
interface UiGridLayoutProps extends Pick<UiLayoutProps, 'height' | 'scroll' | 'aria-label' | 'zOrder' | 'zParts'> {
  columns: number
}
```

Inherited [UiLayoutProps](UiLayoutProps.md) provide extent/scroll naming and optional `zOrder`/`zParts`; see [UiZLayoutProps](UiZLayoutProps.md) for stacking responsibilities.

`columns` is required and must be a positive safe integer. The layout always fills its offered width. Height defaults to content; scrolling defaults to none. Scrolling requires a nonempty accessible name and vertical/both scrolling also requires full height in a bounded parent.

A business layout control can expose these values as `bindings.gridLayout` for `v-bind`; the grid has no knowledge of that producer or responsive context. Core validates and arranges children; backend presentation supplies peer spacing. A reactive column change must preserve surviving keyed child state. See the component reference for exact placement, slots, overflow and acceptance obligations.
