# Customizing collection presentation

Choose the layer before writing a view: [the selection reference](collection-presentation.md) separates header arrangement, whole filter/sort collections and individual filter editors. Customizations are ordinary Vue compositions using public Uninterface imports. No backend-name checks, registry, CSS schema or new standard component is required.

Copy the five files in [the collection adaptation example](../examples/collection-adaptations/CollectionPresentation.vue) into the same application directory. Use the [application setup](../getting-started.md) and mount CollectionPresentation where you want the example. These files define application-level adaptations. The library’s default presentations apply wherever you omit the overrides.

## Start with selection, not a replacement view

Use a constant or selector with `uiCollectionHeaderPresentation`, `uiSearchFilterPresentation`, `uiChoiceFilterPresentation` or `uiRangeFilterPresentation`. Use reactive objects for the header's `filterPanel` and `sortPanel`. The [selection reference](collection-presentation.md#select-override-and-condition) includes complete imports and explains abstention, agreement, fallback and prop/strategy differences.

Select `filterRangeStacked` if the desired change is separate bounds, or `collectionSortBadges` if the desired change is passive sort criteria. A replacement view is appropriate when the actual composition or interaction differs. It is not needed merely to choose an existing implementation.

## A complete custom header

[ApplicationHeader.ts](../examples/collection-adaptations/ApplicationHeader.ts) exports the stable `applicationHeader` object and implements its Vue component. It renders query controls persistently, external sorting below them, collection actions on another row and optional info last. It uses UiLayout for wrapping and baseline alignment; it does not reproduce the built-in header's private editor-band measurement.

The implementation checks `context.parts` before rendering each concern, renders search with an appropriate presentation context, routes configured filter presentations through `context.render`, and calls `context.renderPanel('sort')` to retain the selected sort implementation. Reset uses the supplied binding and localized name. All named content remains reachable, and source order is also keyboard order.

There is no new disclosure state, form, session or query operation in this recipe. `setup` returns a render function that reads the current `props.context`, so later binding, slot and locale changes do not use an obsolete render snapshot. The object itself is created once at module scope.

For a custom header that needs persistent presentation state, use `context.state(moduleLevelSymbol, initializer)`; refs/watchers created there belong to the header's lifetime. Use an SFC's setup and onScopeDispose for state or subscriptions that should end when that implementation unmounts. Never call setup lifecycle hooks in `view(context)` itself. A disclosure implementation must additionally provide accessible names, expanded/controls associations and focus handoff when hiding its editor. The built-in narrow header is often preferable to reimplementing that behavior.

## A complete filter-collection adaptation

[InlineFilters.ts](../examples/collection-adaptations/InlineFilters.ts) exports `inlineFilters`. It creates an actual horizontal wrapping UiLayout and renders the supplied filters once with `filter-row`/`inline` context. This is an example application policy: even if the header puts the collection inside a disclosure, its filters are presented as a wrapping row.

It accepts opaque supplied content through `context.render(presentation)` and does not inspect business component trees or reconstruct their fields. With explicit `filterBindings`, the header also invokes this alternative in long-row. Without bindings, long-row renders its filters slot directly, while narrow `renderPanel('filters')` still invokes the selected collection adaptation. These are current API rules, not an implicit registration process.

An enumerating presentation can instead use `context.bindings` and render UiCollectionFilter for the selected bindings. That list is optional in the type because render-only panels do not need it; require it explicitly when your view needs discovery. Render each binding at most once. [Filter badges](collection-badges.md) are the built-in example of selecting one editor from an enumerated list.

Sort-collection customizations use the same open `UiCollectionPanelAdaptation` shape with `UiCollectionSortPanelContext`. Its `binding` exposes mode, eligible fields, current ordered rules, disabled state and `setSort`. You can compose the existing sort panel/badges through `.view({ binding: context.binding })` and application-owned surrounding content, or implement your own controls. A new control must recheck current eligibility before invoking `setSort`, preserve rule priority, obey single/multiple mode and avoid copying the accepted sort array into a competing model. Add flows may hold an incomplete local field/direction draft, but publish one complete rule only after completion. A nonempty sort slot overrides generated content; do not provide that slot when testing a `sortPanel` replacement.

## A complete individual-filter adaptation

[search.ts](../examples/collection-adaptations/search.ts) exports `applicationSearch`, a typed `UiFilterAdaptation<UiSearchFilterEditorBinding>`. Its [ApplicationSearch.vue](../examples/collection-adaptations/ApplicationSearch.vue) implements the entire view: UiField, shared input frame, text input, explicit action, native form submission, IME protection and invalid-submission focus recovery.

This example intentionally uses a labelled action instead of the default magnifier. Labels and placeholders come from the current business binding/editor; the application should supply localized `searchLabel` and `placeholder` values. String/getter UiTextSource values are resolved during rendering, so locale changes do not require rebuilding the control. The visible label follows header-search/labelProvided context while the accessible name remains present.

The view borrows `context.editor.field`; it neither creates another field nor parses or writes accepted query values. For explicit completion it calls `context.submit()`, preserving validation, the applied event and popup completion. Live search has no submit action and continues using its control's live/debounce policy. There is no added Clear button. A view that offers clearing must call `context.clear()` and use `binding.canClear` rather than guessing from input text.

The component guards disabled submission and ignores composition Enter. Invalid explicit submission returns focus to the input only while the view remains mounted and the request is still its newest submission. Unmount invalidates that focus continuation; it does not dispose, clear or discard the borrowed control. Standard field rendering retains validation naming and feedback. This recipe supplies a native form, so do not nest it in another form.

Custom choice and range adaptations follow the same typed context, using their choice controls or compound field/projections. New arrangements must preserve native picker keyboard behavior and explicit/live policy. Prefer composing the built-ins when you only need different placement: their range completion, tooltip feedback and cancellation coordination cover more edge cases than a simple replacement input.

## Connect all three layers conditionally

[CollectionPresentation.vue](../examples/collection-adaptations/CollectionPresentation.vue) imports the three custom adaptations and shows their complete integration. It:

- Borrows search, filter, sort and reset bindings from an owning business browser.
- Selects the custom header when `useCustomHeader` is true; otherwise abstains so ordinary header defaults or other agreeing strategies apply.
- Selects the custom search through its typed strategy family.
- Switches filter collections between the custom wrapping layout and built-in badges using a reactive prop.
- Selects the field/No sort presentation for single-mode bindings; for multiple mode, selects sort badges outside mobile and the sort-list panel on mobile using a computed object.
- Supplies explicit filter bindings and active counts, and forwards optional action/info slots once.

This is intentionally a presentation wrapper. It does not replace the [business-component ownership rule](business-components.md): a normal record-browser composition should still create its own definitions, codecs and controls and expose data/service operations to its consumers. The owner of bindings passed to this wrapper must retain and eventually dispose those controls. It also decides which filters/sorting are equivalent to table-column interactions; pass only the intended external criteria. Reset remains the owner's atomic query/draft operation.

Changing an adaptation can replace its Vue tree. Control-owned drafts survive, but arbitrary replacement components do not automatically preserve native focus or caret position. Keep a consistent component tree for frequently switched views, or implement explicit handoff. Neither the wrapper nor the adaptation name creates a universal retention mechanism.

## Acceptance and limitations

Before shipping a custom presentation, verify:

1. Every supplied concern is reachable once; there are no duplicate editor claims or nested forms.
2. Mounting, switching, resizing and changing locale do not query, commit or discard drafts.
3. Explicit/live/debounced completion, validation, clear/reset and source failures retain their business semantics.
4. Disabled and stale actions are guarded using current binding state; sort fields and cardinality remain source-authorized.
5. Visible labels, accessible names, feedback and focus are correct after invalid input, popup cancellation and view replacement.
6. Long labels, narrow widths, RTL, keyboard/touch and native backend controls work in the target browser.

The supplied recipes are type-checked and have focused DOM coverage for composition, context, query ownership, invalid submission and unmount behavior. They are not claimed as visually accepted across all backend/browser combinations. They add no backend dependency beyond the public components they use; a composition using unsupported native/plugin features would need its own compatibility evaluation.
