# Collection headers, filters and badges

[Backend reference](README.md) · [API reference](../README.md)

Header/editor hosting, panel composition and badge interactions.

### Collection filter editor hosting

UiCollectionFilter is a logical core view host without a required backend UiCollectionFilter.vue. Its business editor composes native-backed fields/inputs/actions; existing column triggers/popovers supply their current surfaces. Core UiTableFilter provides reactive table-column/popover/stacked context with labelProvided=true and individual submission, and discards only uncommitted drafts on user cancellation. Responsive view removal preserves sessions. Backends must preserve trigger keyboard behavior, popup labels, shared z-order and contained arbitrary editors. No per-backend predicate engine, schema, collection-header layout or grouped transaction is introduced. See the [filter guide](../../guides/collection-filters.md).


### Common choice-filter adaptation

createUiChoiceFilterEditor is a core composition of existing UiField, UiSelect/UiMultiSelect and UiRadioGroup/UiCheckboxGroup. It introduces no required backend view. A ready short flat column or badge popover list uses expanded choices; other usages and larger/grouped/missing-selection sets use the existing select contracts. Existing compact-picker or bounded-native-listbox presentation remains unchanged. The adaptation must retain field/query ownership, disabled/retained choice behavior, accessible naming and live/explicit policy. See the [common choice editor](../functions/createUiChoiceFilterEditor.md).


## UiCollectionHeader

`collection.header.v1` requires `UiCollectionHeader.vue`, a neutral native host with a default slot. `UiCollectionHeaderViewProps` supplies only adaptation, a diagnostic name; forward root attributes and register the real root through useUiZView. Do not interpret that name or select a presentation. The core host selects an implementation and renders its actual Vue composition. There are no groups, compact/expanded, panel callbacks or generated trigger slots in the backend header binding.

The built-in implementations use two private backend primitives (static assembly imports; not business exports):

- `CollectionHeaderFlow.vue`: default-slot wrapping flow with `alignEditors?: boolean` and optional `placeActions(placement: 'filters' | 'sort' | 'after')` callback. It owns native spacing, editor-band alignment and focus/caret retention on keyed moves. It has no slot-name or disclosure knowledge.
- `CollectionHeaderPart.vue`: a single content allocation with optional `name` diagnostic, `query` (named region surface), `contents`, `stacked`, `row`, `lineBreak`, `grow`, `separate`, and `element(element | undefined)` callback. Forward attributes to its actual native root, including region ID/name. lineBreak requests an empty flex-line boundary; it is not a content row or added inset. Fulfill these local allocation requests with backend-owned markup/theme spacing. Do not inspect descendants or create interactions. Its default slot is the supplied Vue content.

These primitives are independently composed by the render implementations. Long-row authors its search/query/actions/info tree; narrow-expandable authors its toggle and conditional query subtree. Neither the backend nor the header loops through a layout schema. Custom presentations can instead compose ordinary public components or their own Vue components; these private primitives are not mandatory. Keep DOM/tab order consistent with visual order in RTL and avoid added outer insets/borders/scrollports. Filter sessions, queries and form transactions retain their existing owners. See the [presentation contract](../types/UiCollectionHeaderAdaptation.md) and [header guide](../../guides/collection-header.md).


### Header editor-row coordination

`useUiCollectionHeaderAlignment(row, compact, buttonSelector, placeActions?)` coordinates the header's first editor/interaction band on each rendered wide flex line. The backend supplies its actual row ref, an alignment-disabled getter (`() => !props.alignEditors`) and native button selector. When the callback is supplied, the helper measures normal-flow group asks on existing roots, restoring their styles before paint; it selects filter-row, sort-row or following-row action placement from the available width, with one gap of hysteresis before promoting placement. The first native button anchors the action group's alignment to the filter row's editor centers whether field labels are visible or omitted. Actions align to the top beside sorting or on a following row. The shared composition moves stable keyed peers in actual DOM order; backends retain their markup and spacing. The helper also preserves focus/caret when keyed group moves leave a still-connected editor unfocused; it does not steal focus from another target. `useUiCollectionHeaderField(root, selector, center?)` registers a UiField's backend root (element or component ref) and selector for its actual editor surface. The optional center callback returns the viewport Y coordinate of a first interaction band for taller editors; it may be needed for a native multi-select listbox. Only surfaces in the header's normal layout flow participate: floating popup fields and actions cannot determine a header band's alignment even when they remain DOM descendants. Field registration is inert outside a coordinating header. These are backend helpers, not business layout props.

The header flattens only display:contents allocation wrappers, associates registered fields with physical peers, measures label-to-editor offsets, and supplies data-ui-header-aligned / --ui-header-editor-offset on participating peers. The adapter applies that offset as block-start padding with start-aligned peers; the offset is additional layout allocation, not a fixed label height or alteration of native control padding. Native actions without a field use their first button surface. Feedback below the registered editor never determines the band. Unknown/custom contents without a cooperating field remain ordinary start-aligned content; the helper does not infer their internal field semantics. Resize/content/font changes recalculate; offsets and observation are released on compact layout or removal. Stable observations avoid a continuous resize loop. Observe actual painted geometry separately from simulated allocation tests.


### Contextual strategy agreement

`UiStrategyQuery<T, Context = void>` optionally declares a context type. `createUiStrategyQuery` accepts `agree(values, context)`. For such queries, `useUiStrategy(query, supports, () => context)` and `node.query(query, supports, () => context)` require a context getter and track its reactive reads. Existing context-free queries are unchanged. For a render-time snapshot (for example, available header slots), `node.resolve(query, supportsPredicate, context)` resolves synchronously in the current reactive render without adding a logical node. It uses the same scope, block, support and agreement path. Context belongs to the query contract; it is not an implicit priority or global environment.


## Built-in filters

UiCollectionFilter is the shared logical host for built-in and custom filters; built-in filters require no additional backend Vue modules. Controls register backend-independent Vue editor views and expose the common collection-filter binding plus typed pattern/editor data. Backends implement their existing field, input-frame, text, choice, button, layout, icon and tooltip contracts. No per-pattern native predicate engine, rendering registry or backend-name branch is introduced.

The core view implementations select through uiSearchFilterPresentation/uiChoiceFilterPresentation/uiRangeFilterPresentation at collection-filter. Choice list/picker and compact/stacked range implementations own their trees and handlers; existing backend controls retain native sizing, selection and feedback. Range input projections cooperate with UiInputFrame directly. Custom opaque components inserted into an input frame must still implement its participation contract; a filter adaptation is not an exemption.

Native presentation limits remain backend-specific: multiple selection can use a bounded listbox or compact picker, and validation tooltip support follows normal field policy. Verify labels, explicit/live completion, popup cancellation, internal range focus transitions, error containment and disabled actions across supporting backends. Ordinary view changes must not issue queries. See [filter adaptations](../../guides/filter-adaptations.md) and [pattern APIs](../../guides/filter-patterns.md).


### Header sort/filter disclosure and reset

Core's narrow-expandable composition owns independent Filter/Sort triggers, exactly one open query panel, and the optional Reset action before collection commands. UiCollectionHeader supplies separate active counts and localized names. Backends render native icon buttons: nonzero activity requests primary color, inactivity retains the backend default. Accessible names/hints include counts; aria-expanded/controls describe visibility independently. Reset uses the supplied ordinary UiButtonBinding, including its disabled/loading/activation rules. No backend reads or resets query state. Retain source order, conditional slot identity, focus recovery and native button hints. The Orders ordered-field sorting trial composes existing selects/menus/layouts; it adds no backend sorting engine.


### Collection panel composition and source sorting

collectionFilterPanel and collectionSortPanel are core rendering adaptations using native-backed controls/layout. Backends do not register panel components or select their content. Header adaptations own disclosure and active indications. UiListBinding.sorting is the source capability; core exposes sortable headers only for allowed keys, applies single/multiple intent rules, and validates initial/programmatic requests. Backends retain native header interaction and source-returned row order. See [panel usage](../../guides/collection-panels.md) and [sorting](../../guides/collection-sorting.md).


### Private collection sort layout

`CollectionSortLayout.vue` supplies local presentation primitives to the shared collectionSortPanel implementation. Its `part` is panel/row/movement/field/remove/add; the panel's `multiple` flag reserves a leading movement track only when rules exist in multiple mode. Supplied slots remain opaque. Rows retain semantic group roots and use CSS subgrid across native-content movement/removal tracks and a shrinking field track; Add sort occupies the field column. Use compact native spacing between rows/columns, no additional gap between movement buttons, and preserve native button sizes, focus, RTL and source order. No presentation selection, query editing, hidden placeholder controls or global standard UiXxxx component belongs here.


### Private collection badge views

`CollectionQueryBadge.vue` is a private surface for built-in filter/sort badge adaptations. Props are label, removeLabel, disabled and optional reorder (UiCollectionBadgeReorder); default content supplies the label/summary (and sort icon), remove slot supplies semantic close artwork where the native API permits it, and remove emits only from an enabled real removal button. The body must not act as an editor, link or selectable chip. When reorder is supplied, it is a focusable group supporting direct priority movement; without reorder it stays passive. Backends preserve native badge/tag/chip dimensions and supply specific accessible naming, wrapping and focus appearance. Core owns source operations. UiBadge's public passive contract is unchanged.

`CollectionQueryBadge.vue` also exposes `focus(): void` for its enabled native remove action. When accepting the last available criterion disables Add, keyboard completion uses that action as its return target; outside dismissal preserves the user’s chosen focus destination.

`CollectionFilterEditor.vue` is a private focus boundary used in table-column and badge filter popovers. Expose `focus(): void` to focus the first enabled native editor/choice without changing its value. The shared composition invokes it from the overlay run’s `opened` callback, after native opening and initial heading focus have finished; mount-time focus can be overwritten by surface opening. The boundary adds no extra visible heading or completion control. UiPopover retains dismissal, ownership and return-focus behavior. Badge compositions may forward the existing anchor binding to an active badge while keeping the original trigger; positioning follows the current anchor throughout the run without replacing the editor. See [collection badges](../../guides/collection-badges.md).


### Table sort priority slot

UiTable backend views render the private `sort-actions` slot with `{ column }` beside the native sorting surface for active multi-sort columns. The shared content supplies a named priority menu using existing menu/button primitives; backends keep it outside sort-cycle buttons and stop click/keyboard bubbling into native header sorting. Include this action in intrinsic header measurement and before the resize handle in sequential focus order. Its callback changes only source priority and preserves direction/criteria. Ordinary column sort cycling remains native.


### UiCollectionBadgeReorder

Backend-only binding for the private sort-badge composition: key identifies the rule; keys is the current ordered source-key snapshot; label is the localized direction/priority name; hint describes the shortcut/drag interaction; move(to: number): Promise<boolean> requests an absolute destination index in the final rule order. Core guards disabled state, supported multiple mode and valid membership, moves the existing rule without altering direction, and delegates to the source binding. The binding adds no business-author props or second query state.


### useUiCollectionBadgeReorder

Optional backend mechanics: useUiCollectionBadgeReorder(body: Ref<HTMLElement | undefined>, props: () => { disabled: boolean; reorder?: UiCollectionBadgeReorder }). Returns computed bindings and announcement refs. Apply bindings to the actual badge-content surface, separate from removal, and render announcement in a locally anchored, clipped polite status. The helper expects the private owning surface marked data-ui-sort-badge and its enclosing composition marked data-ui-collection-sort-badges; it never enumerates arbitrary business slots.

Bindings supply local keyboard shortcuts, focusability, accessible position/description, native title and Pointer Events. Alt+Shift+Left/Right follows computed direction; ordinary click/arrows are inert. Six CSS pixels of motion distinguish drag intent. During dragging, data-ui-sort-dragging marks the source; data-ui-sort-drop=before/after marks a target in logical inline order. Backends own grab cursor, insertion marker, visible focus, dimensions and colors. When the reorder body has focus-visible, paint its focus outline on the complete native badge boundary and suppress the duplicate inner outline. Scope this to the reorder body, not generic focus-within: the removal button retains its own focus treatment. A guarded :has selector can transfer presentation without changing the actual focus target or dimensions; retain the inner visible outline as fallback where unsupported. Use touch-action: pan-y pinch-zoom on the body so vertical-start gestures can scroll. Drop commits once; Escape, outside drop, pointer cancellation/lost capture, scroll/resize/blur, disabled/order changes and disposal clean up without a write. There is no offscreen auto-scroll. The helper restores a still-mounted focused body after a keyed move and announces only the latest accepted movement. A rejected move must not announce success.

Keep hidden status content within the badge's positioned boundary without affecting width/overflow. Preserve native removal controls and filter-badge passivity. Verify keyboard movement, RTL/wrapping, pointer/touch gesture cancellation, no intermediate source writes, disabled/stale state, focus/announcement and disposal. Native title is a hover hint; aria-description exposes instructions to assistive technology, not a guaranteed painted keyboard tooltip. OS-level shortcut interception and screen-reader speech require environment-specific acceptance.

