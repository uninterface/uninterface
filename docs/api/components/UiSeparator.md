# UiSeparator

Draw a decorative line between two peers in [UiLayout](UiLayout.md) or
[UiFlowLayout](UiFlowLayout.md). Import from `@uninterface/uninterface`.

```vue
<UiFlowLayout direction="horizontal" align="center" wrap>
  <FilterControls />
  <UiSeparator />
  <ExportButton />
</UiFlowLayout>
```

The parent determines orientation. In a horizontal layout the separator is a
short vertical line. In a vertical layout it is a horizontal line spanning the
layout width. The backend owns the line's length, thickness and color. The
layout's normal peer spacing provides the gap for the line.

Place the separator directly between the two participating peers. Fragments
are transparent. Consecutive declarations between the same peers produce one
line. A declaration at an edge or next to a UiSpacer has no visible effect.
When the peers wrap onto different rows, the line disappears. It reappears when
they fit on the same row with a gap. Adding a separator uses the existing gap and leaves
the wrap threshold, division shares, peer indices and positioning of nearby
content intact.

The declaration has no props, slots, events, or exposed methods. Its line is
pointer-transparent and hidden from assistive technology. Use [UiEntry
separators](../types/UiEntry.md) for entry collections and [layout
framing](../../guides/layout-framing.md) for shared region boundaries. The native
`hr` expresses a thematic break in prose.

Declare `layout.separator.v1` in addition to the containing layout's
capabilities. The supplied browser views place the line after calculating the
peer geometry.
