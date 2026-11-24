# UiCollectionField

A logical business-field declaration inside [UiCollectionView](UiCollectionView.md), not an independent visible editor. Import from `@uninterface/uninterface`.

Required props: `fieldKey: string` (nonempty, stable and unique within the view), `label: string`. Optional `role: 'title'` identifies the single card title; its label remains the table column heading and is omitted in the card title. A title field cannot also specify cardPlacement. Without a title declaration, the card can still display selection, indicators and details.

`preferredWidth`, `minWidth`, `spring`, `resizable`, `align`, `sortBy`, `filterBy` and `filterActive` follow [UiTableColumn](UiTableColumn.md). They affect the table, not card geometry. The default slot receives `{ item: T, context: UiListItemContext<T> }`. Optional `#card` with the same arguments overrides rendering only in cards. Optional `#filter="{ filters, setFilters, close }"` provides business content inside the table-column filter popup. It is not rendered in cards; the separate section can use the same business editor and query. For direct typed declarations use Vue's `@vue-generic` annotation, as with direct UiTableColumn declarations.

`cardPlacement` (Vue `card-placement`) accepts:

| Value | Card treatment |
| --- | --- |
| `body` (default) | Label/value details |
| `header-end` | Indicators at the header's trailing edge |
| `leading` | Icon/avatar content before the title |
| `media` | Media region above body details |
| `overlay-end` | Group over the media's upper trailing corner; without media, a reserved header-end indicator group |

Only body fields render their field labels visibly. Other values must communicate their meaning through their content; name meaningful standalone icons accessibly. Overlay groups must remain concise and must not cover essential image content. Backends own wrapping and spacing. Overlay fallback reserves header space so indicators cannot cover selection/title controls.

`cardPlacementOrder?: number` (Vue `card-placement-order`) orders values **within their placement**. Explicit finite numbers sort ascending; omitted values follow explicit ones in declaration order; ties retain declaration order. Table columns always follow declaration order. Empty slot output (comments, whitespace, empty fragments) omits the card value and its label/position. Component internals remain opaque: a rendered component that privately produces no output still occupies its declared position.

Core registers fields synchronously and preserves keyed identity on declaration reorder; backend views render grouped values. Verify distinct table/card ordering, conditional fields, duplicate/changed-key rejection, title label omission, card overrides and empty values. Moving between placements or switching table/card trees may remount local editors; business-owned draft controls remain the appropriate state owner.

## Stacking

`zOrder?: UiZOrder` describes outward stacking. The declaration host projects this identity onto the rendered column cells or collection field targets. See [dynamic stacking](../../guides/dynamic-z-order.md) for scope, lifetime, pending refs and observable overlap checks. Core owns order; the backend owns rendering targets.

## Summary slot

Optional #summary receives UiCollectionSummaryContext<T, D>: records(), scope, coverage, status, label and provided. The component's fourth generic D types summaryData; explicitly annotate direct declarations for typed payloads. The business slot selects the operation and formatting. Presence activates its owning collection/table summary. No item context, selection or editing operation is supplied. Field/column identity and alignment coordinate presentation. See [summary ownership, examples and checks](../../guides/collection-summaries.md).

