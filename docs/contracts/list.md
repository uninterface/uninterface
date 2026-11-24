# List contract

The list control, local/function sources, shared list/paginator bindings, selection, pagination/accumulation and confirmed operations are available. Their exact API and limits are in the [list guide](../guides/lists.md) and [control reference](../api/types/UiListControl.md).

UiList, UiTable, UiTableColumn and UiPaginator borrow collection bindings without owning the session. Automatic continuation uses guarded scroll intent. Parent-value editing uses the [editable-collection bridge](../guides/editable-collections.md). See the [control/view APIs](list-api.md) for responsibilities and limitations; native table SSR/hydration support depends on the selected backend.

## Business concept

A list represents zero or more things with a shared business meaning: orders to review, lines within an invoice, or customers available to choose. It may be an independent collection or a value belonging to another object. An empty list is a valid value.

The business author describes what the items mean, where they come from, which operations are available, and any rules for filtering, editing, or choosing them. List control manages the interaction state. Presentation expresses the same collection and operations through a suitable arrangement.

## Composed responsibilities

| Concept | Business-facing meaning | Responsibility |
|---|---|---|
| List | Zero or more items of a meaningful kind | Describe item values, identity, and their relationship to a containing object where applicable |
| Source binding | Where items are obtained or associated | Connect supplied local values or an asynchronous source to the interaction; declare what portion of the collection is available |
| List control | The managed interaction with the collection | Own loading/refreshing, filter, selection when enabled, and optional pagination state; coordinate result updates and supported editing operations |
| List presentation | How people inspect and interact with items | Present items and state through serial, flowing, tabular, or other patterns |
| Selection | Which candidate item or items are chosen | Define choice behavior under business-supplied value and eligibility rules; list control owns its UI state |

These are separate responsibilities, not a requirement for five components, wrappers, or state owners. Selection remains a distinct optional concern, with its UI state maintained by list control. Selection and pagination are optional. Source access can be entirely local. The application retains ownership of business data, query meaning, permissions, and persistence; list control manages their association with the UI under the [UI state contract](ui-state.md).

## List control

The implemented business-facing observations include current items, whether a load or refresh is pending, its outcome, active filters, and pagination state when enabled. Editing and selection add their own observations only when supported.

Meaningful operations may include refresh, change filters, request a page, or apply an item update. A locally editable list can additionally support adding, changing, removing, and reordering items where business rules permit. The implemented source/control methods are specified by the control reference; writable parent-value operations are specified by the [editable-collection guide](../guides/editable-collections.md). A presentation reports intent through the control instead of independently maintaining competing filters, selection, page state, or results.

The control needs to distinguish:

- No result has been obtained yet.
- An initial load is pending.
- A successful result contains zero or more items.
- A refresh is pending while an earlier result exists.
- A load or refresh failed, with any retained result identified as belonging to its earlier query.

Failure must not appear as a successful empty result. The implemented control retains prior items during refresh and failure. When filters or pages change, any retained items must not be misrepresented as the new request's result. Async results belong to a request and query revision; a late response cannot replace a newer result or modify a disposed interaction.

## Sources, filters, and pagination

The ordinary read source is a function receiving a query and returning items plus optional pagination metadata, synchronously or asynchronously; failure is thrown. Business code translates API arguments and results. The list control maintains accepted local collection state and exposes its projection to views, managing loading, failures and obsolete requests. Optional create/update/remove functions are configured independently; a read-only source does not require them. A local collection can use the same function/result boundary without a network service or persistence API. The source integration documents whether it provides the entire collection, one page, or another partial result, and whether a total count is known.

List control owns filter state. The business supplies the filters' meaning; a local predicate or remote query integration fulfills that meaning. A filter UI is one presentation of this state. Local filtering of a loaded remote page cannot claim to have filtered the complete remote collection. Mixed local and remote filtering needs an explicit scope and order of application.

Pagination is optional and also owned by list control. The presentation might provide page controls or another navigation pattern without becoming the owner of page state. A source may support numbered pages or continuation-based navigation; both modes have explicit implemented metadata and capability contracts. Unknown totals must remain unknown rather than being inferred from the number of loaded items.

The control pagination facet and its dedicated view are implemented. The optional paginator binding exposes position, navigation availability, known totals and requests, while the shared list binding supplies the corresponding items to either UiList or UiTable. A paginator is a borrowing view, not an additional owner of query state. It may be absent or mounted in multiple places without changing the lifetime or pagination of the session. See the [pagination API sketch](list-api.md#pagination-one-control-facet-optional-views) for numbered/cursor modes, requested versus accepted positions, and current view behavior.

Infinite browsing uses cursor accumulation without requiring a visible paginator. The controller retains loaded items and appends accepted chunks; the view reports near-end intent rather than maintaining another array or calling the source. Append failure preserves existing items and supports explicit retry, completion stops requests, and query changes invalidate earlier continuation work. UiList and UiTable integrate observation, keyboard continuation and a bounded automatic request budget, pausing observation while inactive. Verify focus and reading-position preservation in the selected backend/browser. See [automatic continuation](list-view-decisions.md#listtable-allocation-and-continuation) for the shared rules. Virtualization is separate.

Changing filters may invalidate the current page or continuation. A documented transition must coordinate them so results match the effective query. The implemented control restarts filters, sorting and page-size changes at the initial numbered/cursor position in one request. Item ordering is likewise supplied or declared; a table must not silently invent business ordering.

## Editing and item updates

Stable item identity connects values, edits, feedback, and choices across refreshes and presentation changes. A row position is insufficient when rows can move. Identity for an unsaved child item can be local to its editing session and need not be a server identifier. Lists with repeated equal values may require identity per occurrence; value equality alone cannot always identify the edited item.

Three useful cases are distinct:

| Case | Expected meaning |
|---|---|
| Edit a local child list | Update the parent object's editing value through its declared binding; no API is required |
| Apply a confirmed update | Incorporate a known updated item, including the canonical object returned by an application operation, without requiring a full refetch |
| Apply an optimistic update | Optionally show a predicted change before confirmation; this requires additional pending, failure, and reconciliation policies |

“Intelligent list” support can cover the first two without requiring optimistic behavior. Updating a known item does not automatically reveal its new membership, position, or effect on remote totals. When that information depends on remote rules, the integration must provide enough information, mark affected results as needing refresh, or request reconciliation. It must not pretend to infer unknown business rules.

The implemented `createUiListValueControl` bridge gives the parent form one complete editing value and supplies a typed projection for a separate list control. Adding or editing a child participates in the parent's draft, validation, and reset contract. Filtering or paging the view must not remove unseen children from that value. Saving the parent is an application operation; editing its list must not implicitly persist individual children. See the [form contract](form.md).

Refreshing while local edits exist requires an explicit merge, defer, replacement, or conflict policy. Unsaved work must not be silently overwritten. Accepted source results copy membership without deep-cloning business records. [createUiListValueControl](../api/functions/createUiListValueControl.md) defines parent reset, editable-value ownership and explicit canonical identity reconciliation; a read-list refresh does not perform those operations automatically. See [editable collections](../guides/editable-collections.md) for the editing contract and conflict policy.

## Presentation patterns and strategies

UiList, UiTable, UiTableColumn and UiPaginator implement the following collection presentations across supporting backends. Specialized presentation strategies remain open.

Required UiList arrangements include vertical items and a grid expressed by column count or column width, with optional scrolling within its allocation. Exact layout props and width policy are defined in [view decisions](list-view-decisions.md). Other presentation patterns can include flowing items and a table with an object per row and meaningful columns. These are not an exhaustive set. Scrolling, flow, and space allocation compose with the [layout contract](layout.md); cards or other outward treatments compose with [frames](frame.md).

UiList item slots and UiTableColumn cell slots receive the business item and a controller-backed context. The context projects identity, item state and interaction bindings, including removal where configured. Views route requests through these bindings; the controller invokes the model operation and reconciles its result. Table cell contents do not require a separate value accessor or a property associated with the column. Direct Vue column declarations remain valid without pre-created column definitions.

A business author can define a desktop table and a mobile card list for the same interaction. Environment detection remains separate from choosing and implementing those presentations. The list control maintains filters and selection across those views. Switching presentation uses the state held by that control; it must not reset filters, pagination, pending work, or associated edits or selection merely because the view changes. Focus and scroll position may need a meaningful translation rather than identical screen coordinates.

Presentation strategies may compose with other node strategies. The author supplies meaningful item content, fields, and actions; the strategy and actuator supply arrangement and visual treatment. A presentation must preserve required information and reachable operations, including empty, pending, and failed states.

## Selection, search, and autocomplete

Selecting from a list is a related interaction with its own business meaning. Candidate items and the selected value are distinct: choosing a customer may use a filtered, remotely loaded list while the form stores one customer reference.

Search can supply filter state, including asynchronous remote matching. Autocomplete additionally needs an input/query interaction and a commitment rule for choosing a candidate. Typed query text, a highlighted candidate, and a committed value must not be conflated. Whether free text is acceptable is a business rule, not an implication of autocomplete.

A chosen item may no longer appear in the current filtered page. Its absence alone is not proof that the choice is invalid or should be removed. List row selection follows [UiListControl](../api/types/UiListControl.md): stable keys can remain selected outside the accepted window, while new selection requires an eligible accepted item. Field choice retention, codecs and unavailable-value labels follow [choice groups](../guides/choice-groups.md) and [multiple selection](../guides/multiple-selection.md). Binding row selection to a separate business value remains application policy. Not every list is selectable.

## Implementation obligations

Under this proposal, implementations and actuators must:

- Keep list control usable independently of any table, card, or dropdown implementation.
- Expose coherent loading, query, pagination, and update outcomes without requiring vendor component access.
- Respect source completeness and business ownership; do not infer global results from partial data or imply that local edits are saved.
- Protect current state from obsolete responses and preserve identity through supported updates and presentation changes.
- Integrate list editing and selection through documented bindings, avoiding independent copies with competing authority.
- Provide accessible structure, names, keyboard operations, focus continuity, and status feedback appropriate to each presentation. A table presentation does not by itself require an interactive accessibility grid.
- Support built-in i18n for labels, status messages, counts, and item formatting; support the applicable theme, dark mode, and strategy contracts.

## Conceptual examples

**Order review:** the application supplies an asynchronous order source, status-filter meaning, item identity, and review actions. List control manages requests, filters, and optional page navigation. A desktop table and mobile cards share that control. If editing an order returns its updated value, the control can incorporate it and reconcile query membership when necessary.

**Invoice lines:** an invoice form binds a local list of lines. Users add, change, or remove lines without API calls. The list-value control coordinates child editors while a separate list control owns the view query; the form owns the enclosing editing session and the application supplies line and invoice validation rules. The complete draft remains available even when presentation filters hide some lines.

**Customer choice:** a form field binds a selected customer reference. Remote search provides candidate customers. List control manages candidate loading and filtering and owns the optional selection state; the field binding determines how a choice becomes the selected customer value. Searching again changes candidates without silently replacing the field's selected value.

## Acceptance scenarios

| Scenario | Expected result |
|---|---|
| The first successful request returns no items | Show a valid empty result, distinct from uninitialized, pending, or failed |
| An older search finishes after a newer search | The older result cannot overwrite the current query result |
| A desktop table becomes mobile cards | Preserve the interaction state and business operations through the same list binding |
| Two paginator views navigate one collection | Share position/availability and issue one request per accepted query transition |
| A requested page fails while earlier items remain | Preserve the accepted items' page identity and expose retry for the failed intent |
| A local filter runs over one remote page | Its limited scope is explicit; do not imply collection-wide filtering |
| A child item is edited without a service | Update the bound editing value and associated form state without a network requirement |
| An API returns an updated item | Reconcile by identity; handle unknown remote membership/order explicitly |
| A refresh encounters unsaved child edits | Apply the documented conflict policy without silent loss |
| A chosen item is absent from new search results | Preserve or change the choice only under the declared selection policy |

## Current limits and unspecified behavior

The [list control API](../api/types/UiListControl.md) implements stable identity, explicit source loading, immutable query snapshots, retained accepted results, selection, numbered/cursor navigation, accumulation and confirmed changes. Dedicated views, column typing/registration and automatic scroll intent are implemented. Browser/AT acceptance, native SSR closure and specialized strategy presentation remain outstanding. The parent-value editing/conflict bridge is implemented. This model assumes no particular table library, API protocol or global state store.

## Implemented entry subset

The [entry collection standard](entries.md) implements sources, loading/refreshing, request revisions and optional selected-key scopes for menus and selection candidates. It is a focused subset; general list editing, pagination and table presentation remain outside that implementation. UiSelect keeps its field as value owner while the entry control supplies candidates.

## Source sorting capability

UiListOptions.sorting declares source-supported keys and single/multiple mode; omission means no user sorting. Configuration is snapshotted for the session. Core validates initial queries and setQuery before mutation/source access. Table headers offer only declared column associations; single mode replaces the previous sort while multiple mode retains ordered clauses. Sorting is executed by the source before pagination. Panel extraction does not introduce client sorting of remote results. See [sorting capabilities](../guides/collection-sorting.md) and [panel adaptations](../guides/collection-panels.md).
