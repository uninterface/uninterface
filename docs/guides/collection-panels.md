# Filter and sort collection adaptations

Uninterface provides five reusable filter/sort collection adaptations. The public contract is called UiCollectionPanelAdaptation, but its output can also be an inline badge list. These are imported presentation objects with `view(context)` implementations, like header adaptations. They are not additional standard UiXxxx components and require no registry or backend-specific versions.

| Export | Presentation | Required content |
| --- | --- | --- |
| collectionFilterPanel | Stacked independent filter editors | render(presentation) callback |
| collectionFilterBadges | Passive active filter badges and Add popup | Explicit filterBindings |
| collectionSortPanel | Ordered rule rows for multiple mode; field/No sort selector for single mode | Source-backed sort binding |
| collectionSortSelect | Inline field/No sort selector with direction and trash icons | Single-mode source-backed sort binding |
| collectionSortBadges | Passive ordered sort badges and Add flow | Source-backed sort binding |

Use the [presentation reference](collection-presentation.md) for defaults, selection and slot/binding precedence; [badge interactions](collection-badges.md) for Add/remove/cancellation; and [complete customization recipes](collection-customization.md) for application-owned layouts.

## Ownership and composition

| Concern | Owner |
| --- | --- |
| Search, triggers, Reset, actions, panel placement and one-open-panel coordination | Header adaptation |
| Arrangement of non-search filters and inherited panel context | Filter panel adaptation |
| Fixed field labels, direction icons, Add, Remove and direct priority buttons | Sort panel adaptation |
| Criterion meaning, drafts, validation, completion, query and lifetime | Business controls |
| Allowed sort keys and single/multiple support | Business integration's truthful source declaration |
| Sorting/filtering before pagination | Data source |
| Native controls, spacing and focus appearance | Backend |

Outer header expansion is separate from collection content so another header or host can reuse any presentation. Badge adaptations additionally own their internal Add popups. Active filter/sort indications describe applied state even while closed. Closing or switching does not submit, discard or make a data request. Reset remains the business-owned operation clearing the complete query and drafts.

## Ordinary authoring

```ts
const control = createUiListControl({
  itemKey: item => item.id,
  source: service.source,
  sorting: { mode: 'multiple', keys: ['customer', 'amount'] },
  query: { filters: initialFilters, sort: [] },
})
const sorting = createUiCollectionSortBinding(control.bindings.list, {
  customer: () => t('customer'),
  amount: () => t('amount'),
})
```

```vue
<UiCollectionHeader :sort-binding="sorting" :active-filter-count="activeFilters" :reset="resetQuery">
  <template #search><UiCollectionFilter :binding="search" /></template>
  <template #filters>
    <UiCollectionFilter :binding="status" />
    <UiCollectionFilter :binding="amount" />
  </template>
  <template #actions><UiButton @click="createOrder">New order</UiButton></template>
</UiCollectionHeader>
```

No sort slot is needed for the built-in editor. A supplied nonempty sort slot overrides generated content. The default sort count comes from sortBinding; activeFilterCount remains supplied because filter content is opaque. Explicit activeSortCount overrides the count for custom content. Omit equivalent external filters when table columns already provide them; search remains separate. The sort priority editor may remain available alongside column sorting.

The filter panel stacks supplied views and gives them filter-form/panel context. A choice filter can select a compact select adaptation, while a range retains its combined input. Individual filter controls own live or explicit completion; the panel does not add group Apply or reset actions. Long-row renders ordinary filters inline. With explicit filterBindings it also honors alternative filterPanel objects, including badges; see the selection reference for the slot-only case.

The sort panel shows unnumbered rows in priority order. Each row has a fixed field label, a direction icon that shows the current ascending/descending state and reverses it on activation, and direct Move earlier, Move later and Delete icon buttons. Names and native hints retain localized text for keyboard and assistive-technology users. Movement past the ends is disabled; single mode instead uses collectionSortSelect, with a inline field/No sort selector with direction and trash icons. Add sort offers unused fields; remove a listed rule and add the desired field to replace it. Reordering keeps focus on an enabled action in the moved row; removal returns it to Add sort. Table interactions and the panel use the same source capability. Source result order remains untouched by views.

## Replace or reuse a panel

`filterPanel` and `sortPanel` on UiCollectionHeader accept directly imported objects, including reactive computed selections. They do not accept selector functions and do not participate in strategy agreement. Each is independently replaceable; selecting a different panel does not change header strategy. An implementation can return `h(MyPanel, { context })`, where MyPanel composes standard controls. This is real rendering, not a parameter profile. Names only identify implementations diagnostically.

The complete [InlineFilters.ts recipe](../examples/collection-adaptations/InlineFilters.ts) implements a wrapping filter collection through public UiLayout and the supplied render callback. It preserves each existing editor and its control.

Custom header adaptations call `context.renderPanel('filters')` or `context.renderPanel('sort')`, once per part, where desired. Direct hosts can invoke collectionSortPanel.view({ binding: sorting }). A direct filter host supplies render(presentation), forwarding that context to its filter views. Hosts own accessible disclosure/focus and retain filter sessions outside conditionally mounted views. Substantially different replacement trees can remount editors normally.

## Consumer obligations and acceptance

Consumers declare UiListOptions.sorting and provide business labels through createUiCollectionSortBinding. Omitting sorting means no user sorting; consumers requesting sorts declare allowed keys and mode. Invalid initial queries throw and invalid programmatic updates reject before changing query or calling the source. This does not implement dynamic capability changes or every source-specific combination restriction; the source integration retains those obligations.

Check both table/cards and wide/narrow layouts, independent active icons, exclusive panels, draft retention, live choice/range policies, rule Add/field/direction/move/remove, single/multiple constraints, source errors, Reset, RTL and keyboard operation. DOM tests establish interaction and ownership; browser checks establish geometry.

See [header adaptations](header-adaptations.md), [filter adaptations](filter-adaptations.md), [sorting capabilities](collection-sorting.md) and [UiCollectionHeader](../api/components/UiCollectionHeader.md).

## Sort-list presentation details

The field name is displayed by a read-only UiTextInput inside UiInputFrame. The direction button occupies the frame’s trailing slot and explicitly allows activation under readonly; the row’s disabled state still blocks it. The display field follows localized business labels without changing the sort query. Native input spacing supplies its compact field surface. Move up/down form an adjoining group without an extra inter-button gap before the field input; Remove stays after it and uses the semantic danger color. Source, visual and keyboard order agree. Rows use compact backend spacing. Shared columns align the field inputs and Add sort; alignment follows actual button widths, including native size changes. Empty multiple-sort panels start Add sort at the field column without reserving movement space. Native button sizes and focus treatments are retained; no joined-button or toolbar keyboard contract is introduced.

collectionSortPanel uses a private native-backed sort layout with shared CSS grid columns and row subgrids. Core still owns the rule editor, disclosure-independent state and query interactions. Backends own compact gap values and layout markup; modern CSS subgrid support is required. No placeholder controls, measured offsets, new public layout API or CSS reordering are introduced.
