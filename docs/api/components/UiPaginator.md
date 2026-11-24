# UiPaginator

`UiPaginator` is the navigation-only view of an existing [UiPaginatorBinding](../types/UiPaginatorBinding.md). Import it from `@uninterface/uninterface`. Required props are `binding` and a meaningful `aria-label` for the navigation landmark.

```vue
<UiPaginator :binding="orders.bindings.paginator!" aria-label="Order pages" />
```

The standard set is **first, previous, pages, next, last**. Each backend uses its native pagination component or pattern, with explicit first/last controls. Unsupported actions are disabled. Bounded page buttons require known positive bounds and supported jumps; other sources show only a known current page, if any. Cursor sources never acquire invented page numbers. Last requires known numbered bounds and jumps. Empty results have no active page and never say “page 1 of 0.” An out-of-bounds retained page uses fallback navigation without native auto-clamping or adapter-owned reads.

There are no total/range/size props or addition slots. [UiPaginatorSizeSelect](UiPaginatorSizeSelect.md) and [UiPaginatorJumper](UiPaginatorJumper.md) are independent sibling controls. Statistics are ordinary application text derived from the binding's readonly `total`, `range`, `pageCount`, `accepted` and `requested` observations. Their placement belongs to the application layout, optionally using [UiCollectionFooter](UiCollectionFooter.md) for backend-owned arrangement of information and the three independent controls.

Multiple paginators stay synchronized. Views never load on mounting or dispose the session. Core owns localized intent, capability guards and model-echo suppression; backend views own markup, native integration, accessibility and focus. Accepted page metadata remains distinct from pending intent. Pending activations are guarded synchronously; selecting a failed destination can retry it. Collection status announcements remain with UiList/UiTable.

Pagination buttons, size selection and jumper input must have the same or similar control-surface height at the ordinary backend presentation. Jumper labels sit inline, rather than adding a label row. Use native size/density settings where possible; no universal pixel height is prescribed. Validation feedback may extend below the row without changing the input height. Backends own this presentation; business consumers do not tune CSS to align these controls.

Required capability: `paginator.view.v1`. Verify the five-part set, no embedded input/select/statistics, one request per activation, no reads on mount/remount, independent siblings, pending/failed accepted state, cursor/unknown/empty cases, and no unsolicited reads when totals shrink. DOM checks cover structure and behavior; browser geometry, keyboard focus and assistive-technology acceptance remain separate.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
