# UiCollectionHeader

Arranges collection query controls, actions and optional information. Import from `@uninterface/uninterface`. It works independently of UiCollectionView with tables, cards and custom bodies.

## API

All five slots are optional and unscoped. Their names describe purpose, not fixed positions.

| Slot | Content and ownership |
| --- | --- |
| `search` | Primary keyword search, available while panels collapse |
| `actions` | Business commands such as Refresh, New order or selected-item commands |
| `filters` | External UiCollectionFilter views or custom filter editors |
| `sort` | Sorting editor and any associated information |
| `info` | Optional business information, for example a selected count |

| Prop | Meaning |
| --- | --- |
| `activeFilterCount?: number` | Nonnegative safe integer, default 0; applied filters represented by the filter disclosure |
| `activeSortCount?: number` | Nonnegative safe integer; defaults to sortBinding.sort.length or 0 |
| `filterBindings?: readonly UiCollectionFilterBinding[]` | Enumerated non-search filters; generates filter content when no nonempty filters slot is supplied; required by badge presentation |
| `sortBinding?: UiCollectionSortBinding` | Borrowed source-backed sort editor binding; generates sort content when no nonempty sort slot is supplied |
| `filterPanel?: UiCollectionPanelAdaptation<UiCollectionFilterPanelContext>` | Defaults to collectionFilterPanel; renderPanel uses it, and long-row uses alternatives when filterBindings is supplied (see selection rules below) |
| `sortPanel?: UiCollectionPanelAdaptation<UiCollectionSortPanelContext>` | Defaults to collectionSortPanel; generated sort content presentation |
| `filterLabel?: string` | Localized Filter disclosure/panel name; default “Filters” |
| `sortLabel?: string` | Localized Sort disclosure/panel name; default “Sorting” |
| `queryLabel?: string` | Wide query group name; default “Filters and sorting” |
| `reset?: UiButtonBinding` | Optional business-owned ordinary action (`type: 'button'`) that clears search, filters, sorting and unfinished drafts |
| `resetLabel?: string` | Default “Reset search, filters and sorting”; accessible name and native button hint |
| `zOrder?: UiZOrder` | Shared stacking contract |

Filter counts are supplied by the business, never inferred from opaque slot content. Sort counts default from the supplied sort binding; explicit activeSortCount takes precedence. Narrow triggers use primary color when their count is nonzero and backend default color otherwise. Their accessible names/hints include nonzero counts. Applied state and expanded state are independent; `aria-expanded` describes only panel visibility. Search is not automatically included in the filter count.

Reset is rendered only when its binding is supplied. The header owns its icon placement, while the business binding owns availability, invocation and clear semantics. It is not a native form reset and must not use a submit/reset binding. Standard UiButton disabled/loading guards apply. The header does not read or mutate query data, discard editor sessions or infer empty criteria. Use one atomic owner operation to clear the complete query and cancel unfinished work.

Standard attributes/listeners target the root. There is no default slot or list-controller binding. The logical strategy role is `collection-header`.

```vue
<UiCollectionHeader
  :active-filter-count="activeFilterCount"
  :sort-binding="sorting"
  :reset="resetQueryButton"
>
  <template #search><UiCollectionFilter :binding="search" /></template>
  <template #filters>
    <UiCollectionFilter v-if="!control.hasColumnFilter" :binding="status" />
    <UiCollectionFilter v-if="!control.hasColumnFilter" :binding="amount" />
  </template>
  <template #actions><UiButton @click="createOrder">New order</UiButton></template>
  <template #info><span v-if="selectedCount">{{ selectedCount }} selected</span></template>
</UiCollectionHeader>
```

Create sorting with createUiCollectionSortBinding(control.bindings.list, businessLabels). The built-in panel is an adaptation object, not an additional standard component. See [panel usage](../../guides/collection-panels.md). The reset binding is an ordinary UiButtonBinding with live disabled/loading getters and an activate callback. See [control bindings](../../guides/control-bindings.md).

## Adaptation and lifetime

[uiCollectionHeaderPresentation](../../strategies/uiCollectionHeaderPresentation.md) accepts a built-in/custom adaptation object or a reactive selector. Mobile defaults to [narrow-expandable](../constants/collectionHeaderNarrowExpandable.md); other environment tokens default to [long-row](../constants/collectionHeaderLongRow.md). Names are diagnostic, not a registry. Table/card changes affect supplied controls. Ordinary strategy scope/block/agreement applies.

Long-row renders search → filters → optional Reset → flexible space → actions in a wrapping row, with external sorting below. Actions align to the controls on the filter row whether field labels are visible or omitted. When space is limited, actions can join the sort row or move to a following row. They align to the top in either of those placements. Optional info follows. The header does not enclose independent filters in another form.

Narrow-expandable renders growing search, independent Filter and Sort icon triggers for supplied content, and optional Reset on the first row. Exactly one query panel can be open: selecting the other trigger switches panels; selecting the open trigger collapses it. The panel always precedes the action row. Reset stays outside both panels. Info follows actions. Missing slots reserve no allocation; a header without content or reset renders nothing. Opaque component internals remain opaque, so conditional emptiness belongs at the slot boundary.

Closing/switching panels unmounts borrowed views without committing, discarding or disposing owner-held sessions. Search remains mounted. Still-visible editors retain identity across built-in adaptations; hiding a focused editor on a responsive change returns focus to its corresponding trigger. Expansion preference survives adaptation switches. Custom editors must retain persistent drafts outside views that can unmount.

Ordinary filter content inherits filter-row/inline/single-row context in long-row. The default narrow filter collection supplies filter-form/panel/stacked; replacement collections choose their own context. Search receives filter-row in long-row only outside mobile when filters exist and filterPanel is the default collectionFilterPanel (fields); otherwise it receives inline header-search, hiding the visible label while preserving its accessible name. Sort content alone never makes the search label visible. Narrow-expandable always supplies inline header-search. Explicit UiCollectionFilter context overrides remain available. Context does not imply grouped Apply or change commit policy.

The configured responsive environment determines the default, not container measurement. Backends own native components, spacing and field alignment; core adaptations own composition and disclosure. Logical/DOM ordering supports RTL. The header introduces no card, border, inset, scrollport or toolbar arrow-key model.

## Verification

Requires `collection.header.v1`. Verify optional slots/reset, no empty allocation, independent active/expanded states, mutually exclusive panels, drafts and focus through disclosure/resize, source order before actions, guarded reset and no reads from presentation changes. Browser acceptance additionally covers narrow widths, RTL, long translations, native controls, tab order and bounded scrolling. DOM tests do not establish geometry.

See the [selection reference](../../guides/collection-presentation.md#content-supply-and-precedence) for slot/binding/collection precedence, and [complete customization recipes](../../guides/collection-customization.md).

See the [header guide](../../guides/collection-header.md), [header adaptations](../../guides/header-adaptations.md), and [view context](../types/UiCollectionHeaderViewContext.md) for ownership and customization.

Use `collectionFilterBadges` with `filterBindings` for badge filters in either header adaptation, and `collectionSortBadges` as `sortPanel` for sort badges. Both are actual view implementations, with passive badge bodies. See [collection badges](../../guides/collection-badges.md).
