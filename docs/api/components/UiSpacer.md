# UiSpacer

Place spare space at a chosen position inside a flow layout or input frame. Import
`UiSpacer` from `@uninterface/uninterface`.

```vue
<UiFlowLayout direction="horizontal" align="center" wrap>
  <h1>Inbox</h1>
  <UiSpacer />
  <MailFilter />
</UiFlowLayout>
```

## In a flow layout

Declare a spacer as a direct [UiFlowLayout](UiFlowLayout.md) child. Fragments and
`v-for` are transparent. Use `v-if` to add or remove a spacer with its associated
content. The flow resolves its own declarations and leaves opaque child components
in charge of their interiors.

A spacer absorbs room left over on the arrangement axis after content and ordinary
peer gaps. It adds no fixed gap or minimum extent. Multiple spacers on a line share
the remaining space equally. A leading or trailing spacer can place a peer group at
the opposite edge. Horizontal placement follows writing direction. Vertical expansion
requires full height inside a bounded parent. Content-sized layouts and full layouts
without room left over allocate zero spare space.

In a wrapped horizontal flow, the spacer adds no line break of its own. An interior
spacer stays with its preceding peers when the next peer wraps, so it has no visible
effect at that break. Wrapped peers follow ordinary flow on the next line.

## In an input frame

Inside [UiInputFrame](UiInputFrame.md), flexible editors receive space first.
The spacer receives the remaining inline space after editors reach their limits.
For example, keep USD beside a bounded amount editor and put the spare space between
the suffix and Clear. A spacer is a passive frame participant and follows the existing
explicit forwarding rules. [Input-frame example](../../guides/input-frames.md#bounded-editors-and-remaining-space)

[UiInputFrameSpacer](UiInputFrameSpacer.md) is the deprecated frame-only name.
Existing consumers can replace its import and tag with UiSpacer.

## API and support

No component-specific props, slots, events, or methods. The spacer has no accessible
name or keyboard stop. Its position belongs to the owning layout. Frame participation
also supports the usual outward z-order declaration. Unsupported placement reports
an error.

Flow spacers require backend `layout.flow-spacer.v1` in addition to the normal
flow requirements. Frame spacers use `input.frame.sizing.v1`. The parent owns
allocation and the backend owns the rendered geometry.

In a browser, verify that spacer positions follow direction, ordinary gaps are
preserved at narrow sizes, wrapping leaves the following row reachable, and
conditional spacers leave peer draft state and keyboard order intact. In a frame,
compare the bounded and unbounded editor cases and verify the suffix stays near its
editor.
