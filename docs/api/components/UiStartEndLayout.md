# UiStartEndLayout

Place two content groups at opposite logical edges. Import from
`@uninterface/uninterface`.

```vue
<UiStartEndLayout>
  <template #start>
    <h1>Inbox</h1>
  </template>
  <template #end>
    <MailFilter />
  </template>
</UiStartEndLayout>
```

Each slot supplies one group. The layout fills the available inline width and
centers the groups vertically when they fit on one row. When the groups and their
normal gap exceed the available width, the end group wraps below the start group
and remains at the logical end of its new row. In RTL, start is right and end is
left. Wrapping follows the width available to the layout, including inside a
resizable pane.

Both slots are optional. A lone group stays at its assigned edge. Empty text,
comments and false conditional branches take no space. A component supplied
through a slot owns its own rendering. Groups can contain multiple children.
Use a nested [UiFlowLayout](UiFlowLayout.md) to arrange those children as peers
and let them wrap within their group. Each group receives at most the offered
width. Content that cannot shrink or wrap may overflow.

Reading and keyboard order follow start then end. Resizing or changing writing
direction keeps both groups mounted, preserving editor values and focus.
Attributes and listeners apply to the layout root, which adds no landmark or
tab stop. [uiLayoutDensity](../../strategies/uiLayoutDensity.md) controls the
theme-owned gap between the two groups, including between wrapped rows.

`zOrder` requests outward stacking. `zParts` addresses the named `start` and
`end` allocations. See [dynamic stacking](../../guides/dynamic-z-order.md).

Declare `layout.start-end.v1`, `layout.linear.v1`, `layout.reactive.v1`,
`layout.wrap.v1` and `layout.align.v1`. The component uses the backend
[UiLayout view](../backend/layout.md#uilayoutviewbinding).
