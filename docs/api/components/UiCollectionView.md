# UiCollectionView

Presents one business collection as a table or selectable cards using shared field and action definitions. Import from `@uninterface/uninterface`. The owner supplies a `UiListBinding<T, F, S>`, explicitly loads/disposes its control, and owns queries, pagination and editing operations. The view never creates a second data/session owner.

## API

Required props: `binding`, `ariaLabel` (Vue `aria-label`). Optional `presentation` is `table` (default), `cards-full-width`, or `cards-grid`. Optional `actionPresentation` is `text` (default), `icon+text`, or `icon`. Optional `cardActionPlacement` is `footer` (default) or `top-end`; it affects cards only and leaves table actions in their column. Optional `presentationOptions: UiCollectionPresentationOptions` (Vue `presentation-options`) supplies card-grid minimum/maximum preferences. Omission or `{}` uses bounded backend defaults; an explicit minimum without a maximum enables unrestricted growth. See [the complete options reference](../types/UiCollectionPresentationOptions.md). Cards-grid adapts to the offered container width, including parent resizing without a viewport change; no business-side resize listener is needed. Choose automatic desktop/mobile presentation with `useUiResponsive` in the business composition.

`height`, `scroll`, `infinite`, `showSummary`, `empty` and `error` follow [UiList](UiList.md). Full height requires a bounded parent, enables vertical scrolling and pins table headers. Horizontal overflow remains explicit. `infinite?: boolean` defaults to false and requires an accumulation binding with full height. It enables automatic continuation for tables and both card presentations; it does not change the source pagination kind. Continuation is triggered by scrolling, including keyboard scrolling of the named viewport; no Load more button is shown. Explicit Retry and terminal feedback remain available. Numbered-page controls belong outside this mode. See the [infinite collection example](../../guides/collection-views.md#infinite-loading-in-tables-and-cards). Table and card accessible names target the semantic table/list; scroll naming targets the actual viewport.

The default slot contains synchronous [UiCollectionField](UiCollectionField.md) declarations. `#actions="{ item, context }"` contains [UiCollectionButton](UiCollectionButton.md) declarations and optional ordinary content. The view automatically supplies a table actions column or the chosen card action region; use conditions to omit unavailable actions and bindings/local disabled for temporary restrictions. The actions heading is localized by core. No action key is required. `empty` and `error` have the same slot contracts as UiList.

Fields and actions accept ordinary Vue composition, keyed loops and reusable synchronous business components. Field keys must be unique/stable; changing a binding or field key requires a deliberate keyed remount. Async/Suspense or teleported field declarations are unsupported. The table requires at least one spring field. The reserved internal column key `__collection_actions` cannot be used as a field key.

## Responsibilities and verification

Core coordinates field registration/order, card field grouping, empty-output omission, action presentation and existing control bindings. Independently implemented backend views own card/list markup, native checkboxes, selected-card treatment, indicators, media, overlays, spacing and responsiveness. The table reuses UiTable and its native backend/sizing mechanisms. Core UiCard supplies card theme/strategy behavior. No CSS is required in ordinary business declarations.

A card header is optional: core omits it when there is no selection, title, leading content, header indicator or media-less overlay fallback. Empty direct field output does not create a header; opaque component internals remain opaque. A media-only card can therefore contain just its preview and top-end actions. Top-end actions use the UiCard corner slot, anchored to the frame independently of media; keep this group concise and verify that it does not cover meaningful content.

Card selection checkboxes are inside the header. Selection also has a backend-themed outline without changing card dimensions. Disabled items retain disabled checkboxes. Clicking ordinary content does not select/activate a record. No row/card-wide click target or invented ARIA selected state is added to a generic card.

Verify one source read on initial explicit load, no reads on presentation changes, shared selected keys, disabled action restrictions, label/icon naming, deterministic placement ordering, and automatic action placement. Presentation-option and card-grid/full-width changes retain card instances; switching between table and cards replaces presentation trees. Verify that externally owned editor sessions retain their drafts across the replacement. Local editor state inside a presentation slot is not retained across that replacement: keep it in a business-owned control and guard switching if needed. Automatic inline-edit sessions, expansion/edit-mode coordination and cross-presentation focus transfer are not implemented.

See [Collection views](../../guides/collection-views.md) for examples, placement/order rules and acceptance limits.

## Loading

`loading?: boolean` adds an external loading condition to the binding. Initial/replacement reads mask the visible data viewport; false never overrides binding loading. Appending shows a continuation indicator without blocking accepted rows. The mask blocks pointer/keyboard interaction and releases on completion. The owner remains responsible for ending external loading on failure or cancellation. See [loading](../../guides/loading.md) for surface ownership, native backend integration and verification.

Successful empty results default to [UiEmpty](UiEmpty.md); `#empty` replaces the whole presentation. See [empty-state guidance](../../guides/empty-states.md) for messages, actions and ownership.

Read failures default to UiNotice with Retry in its actions slot: initial failures in the data area, replacement failures above retained results outside row scrolling, and append failures at the continuation point. The existing `#error` slot replaces this content without changing placement. See [read failures and recovery](../../guides/lists.md#read-failures-and-recovery).

## Stacking

`zOrder?: UiZOrder` describes outward stacking. It establishes a stable outward context containing native local decoration; its view attaches the actual rendered roots without an additional wrapper. See [dynamic stacking](../../guides/dynamic-z-order.md) for scope, lifetime, pending refs and observable overlap checks. Core owns order; the backend owns rendering targets.

## Card-grid allocation

Bounded grids choose the number of shared columns from available width, preferred minimum and backend gap, independent of the number of records. They grow equal columns only to the maximum, align at logical start and leave surplus at logical end. An incomplete final row retains those columns. A container below the preferred minimum gets one shrinking column rather than accidental horizontal overflow. The maximum includes the card frame and insets.

Minimum-only options use occupied-column stretching: empty columns collapse, and even one item can occupy the full available width. This is deliberately different from removing the cap while retaining all empty columns. Table columns, full-width cards and standalone UiCard allocation are unaffected. See [business examples](../../guides/collection-views.md#card-grid-width-preferences).

Server rendering supplies a bounded CSS layout without a client measurement, preserving meaningful content and bounds. After mounting, available-space measurement refines the column count; SSR’s initial columns can differ without replacing keyed card content. This is not a guarantee of identical pre-client geometry or native table hydration support.

`presentationOptions.stretchSingleColumn` is a boolean, default `true`. A container fitting only one column stretches it to full width, ignoring the maximum. Set `false` for a strict cap. A single record in a wider multi-column allocation remains capped; the flag alone retains default bounds. See the options reference for measurement and minimum-only behavior.

## Business summaries

Optional summaryScope (default loaded), summaryLabel (localized Summary by default), summaryData: D and summarySource: UiCollectionSummarySource<T> configure field/column summary slots. Component generics are T, F, S, D. Summary declarations activate the presentation; showSummary remains the independent ready-count option. Core supplies lazy iteration and source metadata without calculating aggregates or fetching. See [collection summaries](../../guides/collection-summaries.md) and [slot context](../types/UiCollectionSummaryContext.md) for complete semantics, consumer obligations and checks.

Summary labels span leading table columns before the first declared summary value; a first-column value shares its cell with the label. Full-height table summaries stay visible at the bottom of the record viewport. Card summaries use a separate title header above responsive field-name/value pairs, within a neutral tinted, solid-bordered, flat panel outside the bounded record scrollport. The backend reuses its card presentation; business authors supply no styling. Content-height summaries remain in normal flow. See the summary guide for placement and observable checks.

## Infinite feedback customization

Optional `messages?: UiCollectionMessages` supplies per-view `listAppending`/`listComplete` string overrides; omitted keys retain application localization. Resolved text supplies visible defaults and the elected accessible announcement. Values are ordinary reactive string props; literal overrides remain literal on locale changes.

Slots `#infinity-loading` and `#infinity-complete` receive [UiCollectionInfinitySlotProps](../types/UiCollectionInfinitySlotProps.md): `{ message, loadedCount }`. They replace inline message content while retaining the backend indicator, spacing, continuation placement and independent observation sentinel. Loading applies only to infinite appends; completion requires an idle, nonempty, successful, non-stale infinite result with no more source records. Initial/refresh masks, empty results and errors retain their separate paths. Slots absent or returning empty Vue content use default wording; neither is used in manual mode. `showSummary` does not suppress infinite completion.

`#error` additionally receives `placement: 'initial' | 'replacement' | 'append'`; existing `error`, `retry` and `canRetry` retain their meanings. See [UiCollectionMessages](../types/UiCollectionMessages.md), [UiCollectionErrorSlotProps](../types/UiCollectionErrorSlotProps.md), and the [shared authoring example, ownership and verification](../../guides/collection-views.md#infinite-continuation-content). Slot content is not used to infer announcement text; do not add duplicate live regions or start reads during rendering.
