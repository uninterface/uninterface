# uiLayoutFraming

Request presentation of layout allocations independently of their content. Import from `@uninterface/uninterface`.

```ts
uiLayoutFraming(value: UiLayoutFraming, options?: { scope?: UiStrategyScope }): UiStrategyDeclaration
```

`separators` accepts `visible` or `none` (default). `regions` maps names to optional `elevation: 'flat' | 'raised'`; flat is the default. Currently UiRegionLayout is the sole consumer, with start/main/end names and logical target `region-layout`. Other layouts do not query this family yet. A region profile containing names it cannot fulfill is an unsupported answer, excluded from agreement.

```ts
const framing = uiLayoutFraming({ separators: 'visible' }, {
  scope: { targets: ['region-layout'], depth: 1 },
})
```

Attach with `<UiStrategy :use="framing">`. The factory validates and freezes a snapshot. Whole-profile semantic unanimity resolves overlapping answers; omitted/default flat entries compare equivalently. No answer, disagreement or blocking restores no separators and flat surfaces. There is no local-wins rule or partial merge. Block the family or uiLayoutFramingQuery through ordinary UiStrategy barriers.

Backend `layout.framing.v1` supplies boundary tracks, surface and shadow through native theme values. Visible separators occupy their own track and appear once between neighboring allocations; they are decorative, not focusable thematic breaks. Raised regions receive a line/shadow only at shared edges toward lower neighbours; main can have two such edges and end can form a raised footer. Horizontal edges follow RTL. No whole-perimeter shadow, outer border, content padding or card semantics are implied. Raised edges replace ordinary decorative separators at that boundary. Resizing and relative layers are separate UiRegionLayout props; a raised surface does not automatically establish stacking priority.

See [layout framing](../guides/layout-framing.md) for examples, ownership, supported combinations and observable checks. Verify dynamic removal, strategy conflicts/blocking and content identity, plus real-browser scroll boundaries and theme appearance.
