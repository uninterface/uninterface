# UiLayoutOptions

Interface exported from `@uninterface/uninterface` for reusable layout policies. All members are optional:

```ts
interface UiLayoutOptions {
  direction?: 'horizontal' | 'vertical'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  division?: 'content' | 'equal' | readonly (number | 'content')[]
  width?: 'content' | 'full'
  height?: 'content' | 'full'
  wrap?: boolean
  scroll?: 'none' | 'horizontal' | 'vertical' | 'both'
}
```

Used for UiLayout props and computed/control-produced bindings. Business code expresses arrangement/allocation rather than margins, pixels, or classes. The [UiLayout reference](../components/UiLayout.md) defines defaults, valid combinations, bounds, and acceptance rules. Core validates the current supplied options; omitted values receive component defaults. A division array must match the current participating child count. Coordinate dependent changes in one computed binding; see [responsive layouts](../../guides/responsive-layouts.md).
