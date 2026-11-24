# UiTooltip

Supplemental host description. Import from `@uninterface/uninterface` in an application initialized by createUiApplication.

## API

`text?: string` supplies plain content; the default slot overrides it with noninteractive formatted content. Required host slot receives `{ trigger }`; forward it to exactly one real target. Optional `visible?: boolean` with `update:visible` supports v-model:visible. Otherwise visibility is local. `disabled?: boolean` defaults false. `trigger` accepts hover, focus, click or an array; default is hover and focus. `placement` is top (default), bottom, left or right.

```vue
<UiTooltip text="Additional information"><template #host="{ trigger }"><UiButton v-bind="trigger">Help</UiButton></template></UiTooltip>
```

## Ownership and implementation

Core owns visibility requests. Backends position native tooltip surfaces and connect descriptions without replacing existing aria-describedby associations. Hover can continue over content; Escape and outside click dismiss. Disabled suppresses the tooltip independently of host availability. Do not place actions inside tooltip content. The anchor needs at least half of its area visible after clipping and overlap by known layout regions. This check applies while the tooltip is requested.

See the [supplemental host description guide](../../guides/navigation-and-tooltips.md) for setup and composition.

## Observable verification

Verify focus and hover open it, Escape closes it, disabled suppresses it, and host activation continues normally. Real-browser placement and hover geometry require separate acceptance.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

The outward declaration concerns the host/trigger composition. A tooltip owned directly by a modal paints above the body and below the modal header and footer. A tooltip anchored in either section opens toward the body. A tooltip inside a popup inherits that popup’s ordering and respects the modal’s available area. Outside a modal, the tooltip uses its enclosing popup’s scope or the owning Surface’s Floating layer.
