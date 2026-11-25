# Table column sizing and alignment

UiTableColumn definitions own preferred width, minimum width, spring participation, manual resizability and physical content alignment. Supply the same properties directly on a declaration or through createUiTableColumnBinding. Business authors choose column proportions and responsive configurations; backends own measurement, native table geometry, focus and resize affordances. No backend-specific CSS is required in the business component.

```vue
<UiTable :binding="orders.bindings.list" aria-label="Orders">
  <UiTableColumn column-key="description" label="Description"
    preferred-width="18rem" min-width="6rem" :spring="true" align="left">
    <template #default="{ item }">{{ item.description }}</template>
  </UiTableColumn>
  <UiTableColumn column-key="total" label="Total"
    preferred-width="8rem" min-width="5rem" :spring="false" align="right">
    <template #default="{ item }">{{ item.total }}</template>
  </UiTableColumn>
</UiTable>
```

For direct declarations, add the Vue generic annotation for the application's item/filter/sort types when needed; bound declarations infer those types. A binding may return `{ columnKey: 'total', label: 'Total', preferredWidth: '8rem', minWidth: '5rem', spring: false, align: 'right' }`. Do not combine a binding with local definition props.

| Property | Meaning and default |
| --- | --- |
| `preferredWidth` | Starting allocation. Positive pixel number, positive `px`, `rem`, `em` string, or `content`. Default `12em`. |
| `minWidth` | Hard lower bound for the whole column, including cell padding. Same units; default `3em`. |
| `spring` | Absorbs container width changes. Default true. Every nonempty table must have at least one spring column. |
| `resizable` | Participates in manual boundary resizing. Default true. A boundary is available only when both adjacent columns permit it. |
| `align` | Physical `left`, `center`, or `right`, for header and cell content. Omission retains backend alignment. |

The shared sizing helper also measures the native header’s intrinsic width, including its label, sort/filter/priority controls and native insets. The effective minimum is the larger of that usable header floor and the authored minWidth. Preferred width is raised to this minimum when necessary. Spring columns share surplus equally and shrink equally toward their individual minima as space becomes scarce. Non-spring columns retain their starting or manually resized allocations. Generated selection controls reserve a backend-owned allocation ; they do not consume the business remainder. `em` resolves at the table allocation host and `rem` at the document root. Font and container changes recalculate allocation.

Length defaults are starting points for body content; `content` opts into measuring rendered cells as well as the header. Consumers must choose minima that accommodate their body controls, labels, validation and localization, and may supply reactive values for narrow contexts. Alignment positions normal cell content; it does not override the internal text alignment of a full-width editor or a business component's own layout. Physical left/right keep their meaning in RTL.

## Resizing and lifetime

Drag a boundary with a mouse, pen or touch pointer. Each gesture redistributes the two adjacent columns while preserving their combined width and respecting both minima. This rule also applies while the table overflows horizontally. The resized widths stay in effect at the current container width while the sizing constraints hold. If the container width or sizing constraints change, spring allocation uses the saved widths where they still apply. The last column has no outer resize boundary.

A focused boundary is a named vertical separator exposing its current width and limits. Left/Right change width by 10px; Shift reduces the step to 1px. Physical movement follows RTL direction. Home/End reach the adjoining minimum limits. Escape or pointer cancellation restores the widths from before the drag. Double-click any boundary restores all authored starting widths. Disabled tables cannot resize.

User widths belong to the mounted table view, keyed by column identity. Query changes and data refresh do not reset them or trigger extra reads. Author changes to a column's sizing definition reset that column's override; removing a column discards it. Remount starts over. Durable preferences and a public reset API are not implemented. Width and alignment updates preserve editor nodes, raw drafts and query state.

## Fitting and overflow

Horizontal scrolling is disabled by default. Enable it explicitly with `scroll="horizontal"` or `scroll="both"`. Without permission to scroll, fixed allocations plus spring minima may be mathematically impossible to fit. The implemented fallback temporarily hides the mounted table and displays a localized recoverable status asking for more space or a narrower configuration. Drafts stay mounted and reappear when space returns; focus inside the table moves to its host before hiding. It does not silently reduce minima or enable scrolling. This is a constraint fallback, not an automatic mobile redesign; applications should supply a usable responsive configuration.

When horizontal scrolling is allowed, the table can retain the required width inside its named scrollport. Long text wraps where possible. Opaque content still needs to respect its allocation; the library cannot infer suitable minima for arbitrary business controls.

## Backend support and verification

Backends implement shared allocation and alignment through compatible column facilities or their own table allocation. Native resizing must not compete with the shared contract. Concrete mappings belong in backend documentation.

Native column-reorder and table SSR limitations remain in some adapters. Consult backend table documentation before relying on editor identity during reorder or SSR/hydration acceptance. Sizing/alignment updates are covered separately; DOM checks do not establish browser geometry or server-rendering conformance.

Acceptance checks: measure header and cell widths, resize the parent, drag and keyboard-clamp both minima, inspect RTL behavior and physical alignment, verify explicit overflow, retain unfinished input, and confirm no data reload. Use a browser for geometry and input actions. Include a sorted header whose caption, sort priority and resize handle all compete for space.

## Content-sized columns

Both preferredWidth and minWidth accept `content`. For action columns, use `{ preferredWidth: 'content', minWidth: 'content', spring: false }`. The adapter measures the widest currently rendered header/cell content at its intrinsic width and includes the actual cell and intermediate native wrapper padding/borders. Native button typography, padding, size strategy and translated wording therefore participate. Header/cell wrappers stay mounted; the measurement must not clone interactive controls or replace business editors. Source reads are not involved.

The supporting adapters observe intrinsic content size and relevant DOM changes, coalescing measurements. The initial unmeasured fallback is 3em. Hidden or otherwise unmeasurable content retains the last measured width until it can be measured again. Measurements cover current rows, not remote/unmounted pages. Use content mode for intrinsically sized content such as action buttons; it is not an intrinsic-width oracle for percentage/full-width editors or arbitrary opaque layouts. Explicit length minima remain appropriate for those controls. Cell content with intentional internal overflow remains the composition's responsibility.

A content minimum constrains boundary dragging just like a length minimum. A content preference still participates in the column's selected spring policy. If required widths cannot fit, the same explicit overflow/insufficient-space rules apply.

The invoice action columns use content preferred/minimum widths. Its line table has five columns, including a read-only computed line amount. Horizontal scrolling is explicitly enabled for that line table on mobile only, by user choice; desktop remains no-scroll. The footer combines the accepted line count and Add line, anchored horizontally while the data scrolls. The invoice modal prefers 52rem on desktop and available width on mobile.

For dynamic text in reusable definitions, use [UiTextSource and the text-source practice](text-sources.md). Keep stable identities independent of labels; ordinary component text props continue to use Vue bindings.
