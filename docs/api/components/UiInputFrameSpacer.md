# UiInputFrameSpacer

Allocates remaining inline space inside UiInputFrame after flexible editors have grown to their limits. Import from `@uninterface/uninterface`. Use it to keep a suffix beside a bounded editor while placing a later action at the logical end of the frame.

```vue
<UiInputFrame>
  <UiTextInput :max-width-characters="11" />
  <span>USD</span>
  <UiInputFrameSpacer />
  <UiButton @click="clear">Clear</UiButton>
</UiInputFrame>
```

The surrounding UiField owns the string value in this example; named projections work the same way. No dummy text, value binding, accessible name or business CSS is needed. The spacer renders no visible content and creates no tab stop. It is hidden from accessibility APIs. It has no component-specific props, slots, events or exposed methods. Universal `zOrder?: UiZOrder` identifies its outward allocation as for other public components. Arbitrary attributes/content are not forwarded to this decorative allocation.

The component requires admitted UiInputFrame participation, either directly or through a cooperating forwarder. Outside a frame it throws. It declares the content role and never edits or validates the field. It does not make an opaque wrapper transparent.

An uncapped flexible editor may consume all available space, leaving no spare allocation. With capped editors, unused space is placed at the spacer's logical position; in RTL the placement reverses naturally. Multiple spacers divide spare allocation. A spacer does not force wrapping or add a minimum width. At narrow widths editors can shrink and the frame retains its existing wrapping policy. Exact gaps and native editor decoration remain backend-owned.

Core declares/discovers participation and checks backend `input.frame.sizing.v1`. Each backend owns its spacer markup and free-space allocation. Supplied adapters use a zero-basis, non-growing decorative item with an automatic logical start margin: flexible editors receive space first, then the margin absorbs the remainder. Do not give the spacer equal growth priority with the editors.

Verify that capped editors stop growing, the currency suffix stays beside its editor, and a later action stays at the logical end. Check narrow widths, RTL, focus order, outside-frame diagnostics and independent field state. DOM/style matching establishes allocation wiring; real-browser checks establish geometry.
