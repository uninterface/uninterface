# UiList

`UiList` presents accepted collection items as a vertical list or equal-width grid. Import it from `@uninterface/uninterface`.

Required props are `binding: UiListBinding<T, F, S>` and `aria-label: string`. Optional `columns` is a positive integer; optional `columnWidth` is a positive `rem`, `em` or `px` minimum. They are mutually exclusive. Without either, items form one column. `height` defaults to `content`: the list expands with its rows and an ancestor owns vertical scrolling. `height="full"` fills a bounded parent allocation and **automatically enables internal vertical scrolling**. It does not choose a pixel/rem height or create a bounded parent; the containing layout supplies that space.

`scroll` defaults to `none`; `horizontal` or `both` explicitly permits horizontal scrolling. With full height, `none`/omission resolves to vertical scrolling and `horizontal` resolves to both axes. Explicit `vertical`/`both` requires full height. Thus bounded height always enables vertical scrolling, independently of horizontal permission. Backends manage `overflow-x` and `overflow-y` separately: no implicit horizontal scrolling and no vertical scrollbar in content-height mode. Optional `infinite` requires an accumulation binding and full height; no explicit vertical scroll prop is needed.

The default slot receives `{ item: T, context: UiListItemContext<T> }`. `empty` replaces successful-empty content. `error` receives `{ error, placement, retry, canRetry }`; do not expose private service messages without adaptation. Slots never receive an accessor-derived `value`.

```vue
<UiList :binding="orders.bindings.list" aria-label="Orders" column-width="18rem">
  <template #default="{ item, context }">
    {{ item.name }}
    <UiButton v-if="context.bindings.removeButton" :binding="context.bindings.removeButton">Remove</UiButton>
  </template>
</UiList>
```

The owner explicitly loads and disposes the control. Mounting, duplicating, hiding or changing this view never does either. Changing binding identity requires a keyed remount. Core coordinates localized state, shared announcements and automatic continuation budgets. Adapters own list semantics, grid/scroll geometry, keyboard targets, selection and focus. No row click implicitly activates or selects its item.

Verify the same binding in a table and list stays synchronized; nested actions invoke once; append does not replace mounted editors; failure keeps accepted items and offers explicit retry. Automatic continuation stops after three successful chunks in one near-end episode. See [lists](../../guides/lists.md) and [selected presentation contracts](../../contracts/list-view-decisions.md).

Successful nonempty lists have no persistent loaded-item summary by default. Optional `showSummary?: boolean` (default false) opts into it. Loading, uninitialized, empty, stale, error and explicit infinite-source completion feedback remain; accessibility announcements are independent of this visible-summary choice. Verify these states separately and avoid duplicating a paginator's range/total.


When selection is enabled, the supporting backends place the native checkbox in a content-sized leading column beside each item's content, aligned at the start of the item. This low-level arrangement wraps arbitrary slot content. For selectable cards with the checkbox inside the frame and selected-card treatment, use [UiCollectionView](UiCollectionView.md). With selection disabled, content uses the full width without an empty selection column. The adapter owns this arrangement; business slots need no checkbox positioning or backend styles. Only the checkbox changes selection: ordinary content and nested actions are not selection labels or row-click targets. Protected/disabled items retain a disabled checkbox in the same position. Verify pointer and Space-key toggling, selection retention across presentations, native checkbox dimensions, and no overlap with content at desktop/mobile widths.

## Loading

`loading?: boolean` adds an external loading condition to the binding. Initial/replacement reads mask the visible data viewport; false never overrides binding loading. Appending shows a continuation indicator without blocking accepted rows. The mask blocks pointer/keyboard interaction and releases on completion. The owner remains responsible for ending external loading on failure or cancellation. See [loading](../../guides/loading.md) for surface ownership, native backend integration and verification.

Successful empty results default to [UiEmpty](UiEmpty.md); `#empty` replaces the whole presentation. See [empty-state guidance](../../guides/empty-states.md) for messages, actions and ownership.

Read failures default to UiNotice with Retry in its actions slot: initial failures in the data area, replacement failures above retained results outside row scrolling, and append failures at the continuation point. The existing `#error` slot replaces this content without changing placement. See [read failures and recovery](../../guides/lists.md#read-failures-and-recovery).

## Stacking

`zOrder?: UiZOrder` describes outward stacking. It establishes a stable outward context containing native local decoration; its view attaches the actual rendered roots without an additional wrapper. See [dynamic stacking](../../guides/dynamic-z-order.md) for scope, lifetime, pending refs and observable overlap checks. Core owns order; the backend owns rendering targets.

## Infinite feedback customization

Optional `messages?: UiCollectionMessages` supplies per-view `listAppending`/`listComplete` string overrides; omitted keys retain application localization. Resolved text supplies visible defaults and the elected accessible announcement. Values are ordinary reactive string props; literal overrides remain literal on locale changes.

Slots `#infinity-loading` and `#infinity-complete` receive [UiCollectionInfinitySlotProps](../types/UiCollectionInfinitySlotProps.md): `{ message, loadedCount }`. They replace inline message content while retaining the backend indicator, spacing, continuation placement and independent observation sentinel. Loading applies only to infinite appends; completion requires an idle, nonempty, successful, non-stale infinite result with no more source records. Initial/refresh masks, empty results and errors retain their separate paths. Slots absent or returning empty Vue content use default wording; neither is used in manual mode. `showSummary` does not suppress infinite completion.

`#error` additionally receives `placement: 'initial' | 'replacement' | 'append'`; existing `error`, `retry` and `canRetry` retain their meanings. See [UiCollectionMessages](../types/UiCollectionMessages.md), [UiCollectionErrorSlotProps](../types/UiCollectionErrorSlotProps.md), and the [shared authoring example, ownership and verification](../../guides/collection-views.md#infinite-continuation-content). Slot content is not used to infer announcement text; do not add duplicate live regions or start reads during rendering.
