# UiRegionScrollPolicy

Import from `@uninterface/uninterface`. Names regions that move together in one scrollport, independently of author-side slot nesting.

```ts
interface UiRegionScrollPolicy {
  groups: readonly {
    id: string
    regions: readonly ('start' | 'main' | 'end')[]
    axis: 'vertical'
    'aria-label': string
  }[]
}
```

The implemented subset requires exactly one group in a vertical UiRegionLayout. Regions must be ordered, consecutive, unique, and contain main: main alone, start/main, main/end, or all three. Other policies fail visibly, even if an optional region is absent. The group id and accessible name must be nonempty. Names are supplied by the application in its interface language.

The layout requires a bounded host offer and its own aria-label for emergency overflow access. Grouping owns allocation: retained regions size to content, the group receives remaining height, and grouped content grows in source order inside its scrollport. Explicit height, division or alignment overrides are rejected. Width must be full. The separate whole-layout scroll option cannot be combined with a policy except for scroll="none".

Group identity and membership are fixed for a mounted layout. Changing them, adding a policy or removing it requires a deliberate new layout instance; the component throws rather than silently remounting child state. Group names, host dimensions and optional region participation can update without remounting. Controls still follow business-owned lifetime. Multi-group, horizontal, independently scrolling sidebar and reactive regrouping capabilities are not implemented.

Backends implement `layout.region-scroll.v1` through [UiRegionLayoutViewBinding](../backend/layout.md#uiregionlayoutviewbinding). They preserve ordinary focus/input state, support keyboard scrolling, keep retained regions out of the group, and provide an outer scroll escape when retained content exhausts available height. See [UiRegionLayout](../components/UiRegionLayout.md) and [application layouts](../../guides/application-layouts.md) for composition and verification.
