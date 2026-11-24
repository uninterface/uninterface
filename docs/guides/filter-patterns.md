# Built-in collection filters

Search, choice and ordered range are built-in filters. Each includes a typed control and a default view, rendered through UiCollectionFilter. Business code supplies the criterion's meaning; the filter supplies routine editor interactions. Its view composes existing Uninterface components independently of the backend, which supplies their native presentation. No presentation strategy is required for ordinary use.

| Filter | Control factory | Default presentation | Criterion |
|---|---|---|---|
| Search | createUiSearchFilterControl | Search input with integrated actions | string |
| Choice | createUiChoiceFilterControl | Short eligible option list in column/badge popups; picker elsewhere | string key or readonly string-key array |
| Range | createUiRangeFilterControl | One compact frame for both bounds | UiFilterRange<T>: optional minimum/maximum |

All factories return `{ binding, dispose }`. Bindings extend UiCollectionFilterBinding with pattern and a typed editor binding. All target collection-filter, so existing column/header hosts work. Editors, entry sources and validation resources are created once per control and disposed by its owner. UiCollectionFilter borrows that session; render one active view per binding.

## Business definition

Factories accept `(definition, source)`. The definition retains key, label(), read/write, equals, isActive, summarize, editing and optional clear, summary-item removal, field associations, availability and disabled rules. The built-in factory supplies createEditor. Source accepts changes synchronously; list controls still own asynchronous reads and result acceptance. Clear and inactive meanings must be explicit: no selected choices can mean all records or no records depending on the business.

```ts
import { createUiSearchFilterControl, createUiListFilterSource } from '@uninterface/uninterface'

const search = createUiSearchFilterControl({
  key: 'search', label: () => 'Order search',
  read: query => query.term,
  write: (query, term) => ({ ...query, term }),
  equals: Object.is,
  isActive: term => Boolean(term.trim()),
  summarize: term => ({ text: term }),
  clear: query => ({ ...query, term: '' }),
  editing: { commit: 'explicit' },
  placeholder: 'Search orders…',
}, createUiListFilterSource(orders.bindings.list))
// Dispose search with its owning business component.
```

```vue
<UiCollectionFilter :binding="search.binding" />
```

Use this same host for choice and range bindings. It retains presentation context overrides, scoped view customization, zOrder and applied events. Optional [filter adaptations](filter-adaptations.md) customize how a filter is presented without replacing its control or business definition.

## Search

Optional codec/rules normalize and validate the string. The search-input adaptation uses UiTextInput type=search inside UiInputFrame, with a labelled search action for explicit policy. It shows a visible field label in ordinary rows; a supplied host label or header-search context permits placeholder/icon presentation while retaining the accessible name. Its minimum input width is 20 characters ordinarily and 10 with the compact hidden-label treatment. These are presentation defaults, not input length limits.

Explicit typing does not query until Enter or the search action. Live policy schedules validated commits with the configured debounce; the view retains a decorative magnifier and omits its explicit search button. Composing Enter does not submit. The default search view adds no separate Clear action. The common binding still exposes clear for collection-level reset or custom presentations. Locale-sensitive placeholder/action labels can be UiTextSource getters; an omitted search placeholder uses the filter label.

## Choice

Supply selection=single with a string criterion, or selection=multiple with a duplicate-free readonly string-key array, plus an existing UiEntrySource. Static/asynchronous/grouped options use existing entry-control behavior. Optional validation rules apply to the typed choice value. Normal editing does not treat an external synchronization as another user selection.

The default selects an expanded checkbox/radio list only in a table-column or filter-badge popover with 1–6 ready flat ordinary options and all selected keys present. Other contexts, larger/grouped/unready lists and missing selected values use UiMultiSelect/UiSelect. Six is a library default, not a web standard. Multiple selection retains the backend’s compact-picker or bounded-listbox presentation.

Live policy updates without Apply and keeps a column popup open. Explicit policy supplies Apply/Clear actions; Apply calls the same submit operation exposed to custom views. Do not reinterpret Enter inside a native picker as permission to apply the entire filter. A custom adaptation must retain each control's native keyboard behavior.

## Ordered range

```ts
const amount = createUiRangeFilterControl({
  key: 'amount', label: () => 'Amount',
  read: query => query.amount,
  write: (query, amount) => ({ ...query, amount }),
  equals: (a, b) => a.minimum === b.minimum && a.maximum === b.maximum,
  isActive: value => value.minimum !== undefined || value.maximum !== undefined,
  summarize: describeAmountRange,
  clear: query => ({ ...query, amount: {} }),
  editing: { commit: 'explicit' },
  codec: amountCodec, // UiCodec<number, string>, e.g. business-owned currency precision
  compare: (minimum, maximum) => minimum - maximum,
  minimumLabel: 'Minimum amount', maximumLabel: 'Maximum amount',
  inputmode: 'decimal',
}, querySource)
```

Blank/whitespace bounds mean undefined and bypass the bound codec. Both bounds parse into one criterion and validate together. The comparator must return a finite negative/zero/positive number; reversed ranges fail before querying. Optional rules validate the whole range. invalidRange may provide a string, message descriptor or getter; omission uses the localized core message. Business code retains inclusive/exclusive interpretation, units, precision and query encoding. No implicit numeric conversion, locale or date arithmetic is added.

range-compact presents the two bound projections in one input frame. range-stacked presents two frames in a vertical UiLayout. The default is compact in rows, popups and panels. Panel context still controls labels, feedback and completion; stacking the panel's filters does not split each filter internally. The stacked adaptation remains available through an explicit presentation strategy. Apply is success-colored; Clear uses the semantic clear icon and danger color, disabled when the session cannot clear. Minimum/maximum labels, placeholders and action labels are optional UiTextSource values with localized defaults for labels, placeholders and actions.

For explicit policy, table-column/popover and filter-badge/popover contexts show Apply (alongside Enter); focus leaving these popups does not apply. Other contexts, including desktop filter rows and filter panels, omit Apply and complete on Enter or focus leaving the entire range editor. Moving between bounds and Clear never commits; invalid blur does not reclaim focus. Clear never first applies the unfinished range. IME Enter, obsolete validation, Enter-plus-blur deduplication, unmount/deactivation and hidden-panel cancellation retain the shared session safeguards. Live policy never receives an Apply button or an added blur policy. Presentation does not change the declared commit policy.

Ranges in popovers, including column and badge editors, request tooltip validation feedback to keep errors out of the popup’s layout. A range editor inside a popover stacked above its modal’s header and footer uses below-field feedback where supported. Ordinary rows and panels use normal field feedback. Native inputs and their validation associations remain backend-owned.

## Custom filters and acceptance

The existing createUiCollectionFilter/createUiFilterFieldEditor route remains available for opaque or compound business editors. The lower-level createUiChoiceFilterEditor helper remains supported and uses the same choice presentations. No mandatory filter-type DSL is introduced.

Verify explicit/live/disabled behavior, invalid and open ranges, unchanged-query deduplication, source synchronization, summaries, clear/discard, scope disposal, single active view claims and table/card relocation. Test custom [filter adaptations](filter-adaptations.md) separately from query mapping. Browser acceptance covers actual wrapping, keyboard/touch interaction, focus recovery, feedback and localization. See [collections](collections.md) for the ownership map and [collection presentation](collection-presentation.md) for consolidated selection rules and conditions.
