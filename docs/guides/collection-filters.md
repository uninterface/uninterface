# Reusable collection filters

A filter definition describes business criteria independently of where its editor appears. `createUiCollectionFilter` connects that definition to a query source and owns an editing session. `UiCollectionFilter` borrows the resulting binding and renders its business editor. The component is a view host, not a registration declaration or a filter-layout component. A business owner may keep a heterogeneous list of bindings; hiding or moving views does not remove definitions or query criteria.

## Ownership and authoring

The business supplies a stable key, localized label, typed criterion, pure query read/write functions, equality, active semantics, summary, optional clear/removal operations and commit policy. Built-in search/choice/range control factories supply the editor factory; custom patterns may supply their own. Core owns live scheduling, stale-result guards, explicit commits, lifetime and presentation context. Existing list controls own reads, accepted results, selection, pagination and source errors. Backends continue to render the actual Uninterface inputs, fields, buttons and column popovers. There is no new native filter engine or mandatory schema of text/select/range types.

Use one business owner for each filter binding; dispose its control when that owner ends. It can outlive mounted views. In the demo, `useOrderFilters` owns Status, Amount and Order search inside OrderBrowser. Ordinary consumers of OrderBrowser still supply business service operations, not reconstructed editor controls. [UiCollectionHeader](collection-header.md) now arranges external query views and supplies row/panel context. [Badge/Add-filter presentation](collection-badges.md) is available through explicit binding enumeration; an implicit declaration registry is not provided.

```ts
import { defineComponent, h } from 'vue'
import {
  createUiCollectionFilter, createUiListFilterSource,
  createUiFieldControl, createUiFilterFieldEditor,
} from '@uninterface/uninterface'
import KeywordEditor from './KeywordEditor.vue'

type Filters = { keyword: string; status: readonly string[] }
const source = createUiListFilterSource(orders.bindings.list)
const keyword = createUiCollectionFilter<Filters, string>({
  key: 'keyword',
  label: () => messages.keyword,
  read: filters => filters.keyword,
  write: (filters, value) => ({ ...filters, keyword: value }),
  equals: Object.is,
  isActive: value => Boolean(value.trim()),
  clear: filters => ({ ...filters, keyword: '' }),
  summarize: value => ({ text: value }),
  editing: { commit: 'explicit' },
  createEditor(context) {
    const field = createUiFieldControl(context.initialValue)
    return createUiFilterFieldEditor(context, field, defineComponent({
      setup: () => () => h(KeywordEditor, { field }),
    }))
  },
}, source)
// The business owner calls keyword.dispose() when its session ends.
```

`write` and summary-item removal receive the latest whole filter object, after validation, so unrelated criteria are preserved. Return a new object without mutating inputs. Equality compares this filter's criterion, including normalization conventions. Changing only unrelated criteria is outside a filter's write contract. Optional `fieldKeys` are semantic associations, not permission to modify those columns. Overlapping writers need explicit business coordination; no automatic precedence is introduced. Definition keys should be unique within the business-owned list; the factory validates individual keys, not a global registry.

`createUiListFilterSource` synchronously accepts query changes through the list binding. A committed filter means requested criteria changed, not that remote results have arrived. Summaries and active indicators describe `state.query`; retained result statistics still describe `state.result.query`. The list displays loading/errors and owns retry. A failed read does not roll back filter criteria. No mounting, opening, rendering, hiding or rearranging operation loads data.

## Editor sessions

`createEditor` runs once inside the filter owner's effect scope. Its `view` is a stable Vue component; its `dirty` and `validating` observations are reactive getters. `validate()` returns a normalized criterion or invalid, while the editor supplies accessible feedback. `replace(value)` replaces both draft and baseline after external replacement, discard or accepted commit. `dispose()` releases resources. Draft format is private: two raw range strings, a map drawing or an asynchronous lookup can all produce a typed criterion.

`createUiFilterFieldEditor(context, field, view)` adapts scalar/compound UiFieldControl using its existing exact validation snapshot. It observes actual set/draft notifications, not normalization/check-registration revisions, and shares native blur/choice validation. No second codec parse or validation engine is introduced. External synchronization is not a live user edit. The caller still owns any extra resources beyond that field adapter.

Only one active editor view may borrow a binding. Repeated summaries/triggers do not claim an editor. UiCollectionFilter releases its claim on unmount or KeepAlive deactivation, without disposing or discarding the owner session. Unmount/remount across arrangements retains the draft, though it does not promise DOM focus retention. Reactive context changes on the same view retain child identity/focus. Use a distinct control when independent concurrent drafts are required.

The same filter changing externally supersedes its old draft and outstanding validation. Unrelated query changes preserve the draft. Discard, clear, disable, disposal and newer edits invalidate scheduled or late commit work. A host decides whether hiding is merely responsive relocation or explicit dismissal. Current column popups call discard on user Escape/outside/trigger/close cancellation, and preserve drafts when their view is removed for a presentation change. Discard never rolls back committed live changes.

## Commit policy and triggers

- `editing: { commit: 'explicit' }`: completion routes call the same commit operation. The control adds no implicit blur commit; a view may explicitly submit on whole-editor focus exit, as the built-in range does outside column popovers.
- `editing: { commit: 'live', debounceMs?: number }`: user changes schedule validation and commit; optional debounce is a finite nonnegative millisecond interval. Newer edits supersede pending validation; changes in the same turn can coalesce. Invalid drafts remain editable and do not query.
- `useUiCollectionFilter().submit()` invokes the binding and emits the host's `applied` event for committed/unchanged results. Popup hosts may close on that event; row hosts need not. Live changes do not emit it and keep checkbox popups open.
- `clear()` removes the business-defined restriction and resets the draft. It is disabled when unavailable, unsupported or both inactive and clean. Clearing an inactive but dirty draft makes no query request. Clear is not reset-to-defaults or discard.

Native HTML forms are appropriate inside these business editors: submit to the filter session, retain accessible naming, use UiButton type=submit for an explicit action and preserve one submission path. Do not nest forms. UiCollectionFilter does not intercept Enter, blur or global shortcuts. Editors retain IME, autocomplete, multiline and native keyboard semantics. Standalone UiField supplies validation feedback; use its control and focus the invalid editor when submit fails. The built-in range and search views use this route, including in Orders, without creating a competing UiForm submission session.

A grouped filter-form transaction is not implemented. Presentation context currently permits only `submission: 'individual'`; it cannot silently hide Apply controls on the assumption that a panel has a collective Apply operation. Custom hosts may arrange independent forms, but must not nest them in an outer form. A native keyboard event is not a request to change the filter's commit policy.

Unexpected editor/writer exceptions reject explicit commit and appear in `binding.error`; background live work records that error without an unhandled rejection. Business error handling must explain unexpected failures appropriately. This is separate from a normal invalid draft and from list-source errors.

## Presentation context

```vue
<UiCollectionFilter
  :binding="keyword.binding"
  :presentation="{
    usage: 'filter-row', container: 'inline', arrangement: 'single-row',
  }"
/>
```

The editor calls `useUiCollectionFilter()` for reactive `binding`, `presentation`, `submit()` and `clear()`. Custom view authors can use the component's default scoped slot with that same context. Context is inherited from a column-popup host and can be partially overridden through `presentation`; nested components use injection without DOM inspection.

| Member | Meaning |
|---|---|
| `usage` | table-column, header-search, filter-row, filter-form, filter-badge, or a business-specific string |
| `container` | inline, popover, panel or dialog |
| `labelProvided` | Host supplies visible identity; editor may omit a repeated visible label, retaining accessible naming |
| `summaryProvided` | Host already supplies a criterion summary |
| `arrangement` | single-row or stacked preference; complex editors may wrap/use a fallback |
| `submission` | individual; group transactions remain deferred |

Default context is filter-row/inline/single-row, no provided label/summary, individual submission. Column filters supply table-column/popover/stacked with labelProvided=true. Context describes semantics, not backend names, exact widths or CSS breakpoints. Unknown custom usage must receive a conventional editor fallback. A read-only badge/row hint uses the summary, not an editor session disguised as readonly input.

## Summaries and extension boundaries

`summary.text` supplies an accessible description of the applied value, without repeating the criterion label. Presentations that identify a criterion combine `binding.label` with this value description exactly once. Standalone custom summary hosts must supply that identity when needed; core does not guess or strip prefixes from business text. The current badge adaptation uses one summary per criterion. Optional `{ key, text }` items support finer-grained custom summaries, and optional `removeSummaryItem(filters, key)` defines individual removal. Core rejects keys absent from the current summary. Backend styling/affordances remain outside these data definitions. Active state is explicit: both statuses selected can mean unrestricted, none selected can mean match nothing. Neither empty arrays nor null universally imply inactive.

The contract supports arbitrary criterion/editor types, multi-property writes, immutable restrictions and custom hosts. UiCollectionHeader adaptations provide inline and expandable-panel arrangements. Per-view/per-filter placement observations, repeated filter instances, collective Apply, arbitrary inter-filter AND/OR composition and reset-to-defaults coordination remain separate work. Existing hasColumnFilter is still a coarse flag; omit only editors whose correspondence the business knows. A business filter can encapsulate a compound expression without claiming a universal query builder.

## Observable verification

Check explicit Enter/button deduplication, live status updates, invalid ranges issuing no reads, unchanged values issuing no reads, latest-query merges, summaries after failed reads, clear versus discard, cancellation of obsolete async/debounced work, availability guards, reactive custom context, retained draft on table/card/KeepAlive changes and cleanup on owner disposal. Column popups must not sort on filter interaction. Ensure accessible feedback/labels and appropriate focus when errors occur or popups close.

Unit and DOM tests establish these mechanics. Browser geometry, touch/keyboard interactions, IME and assistive-technology acceptance remain separate; no fresh visual acceptance is implied by this implementation.

A custom default slot receives `editor`, the stable registered Vue view, alongside binding/presentation/operations. Render `<component :is="editor" />` once to wrap or arrange the existing business editor without reconstructing its field/session. Rendering multiple copies is outside the one-editor contract.


## Common choice editor

Use `createUiChoiceFilterEditor(context, { selection, options })` inside a definition's createEditor callback for conventional string-key choices. Business code supplies candidate meaning and query mapping, not a new per-business checkbox/select switch. The helper owns a field and entry control and keeps the same session across contexts.

Small ready flat column or badge popover lists (1–6 options, all selected keys represented) use radios/checkboxes. Filter rows/panels/forms and custom usage fallbacks use UiSelect/UiMultiSelect. Grouped, large, unready or missing-selected-key sets also use the picker so their existing retention/source behavior is preserved. This threshold is an implementation default, not a toolkit recommendation. Native search availability remains backend-specific. Multiple selection retains the backend’s compact-picker or bounded-listbox presentation.

Commit policy is unchanged by adaptation. Status uses live multiple membership: both choices are unrestricted, neither matches no rows. A single-value choice uses radios/single select and is never substituted for a multiple restriction. Explicit choice definitions receive an Apply action from the shared choice surface; custom replacement views must provide their own operable completion route. Accessible identity remains present even when a column provides the visible heading.

The Orders demo uses UiCollectionHeader for search, external sorting/filtering and separate Refresh/New order actions. Its optional reset binding clears search, filter restrictions and sorting together and discards unfinished drafts. The header renders a reset icon outside disclosures; it is disabled when nothing is applied or dirty. A draft-only reset does not query. Ordered sorting is now edited as a list of fields/directions with priority actions, synchronized with table sorting rather than reduced to a single preset. See [collection header](collection-header.md).


## Built-in patterns and presentation selection

[Built-in filters](filter-patterns.md) documents search, choice and range controls, including range completion and popup feedback. The [presentation reference](collection-presentation.md) consolidates the three adaptation layers, defaults, context conditions and selection rules. Use [customization recipes](collection-customization.md) for complete application-owned views. These views borrow the same common filter contract; they do not introduce another query/session owner.
