# collectionFilterBadges

Import from `@uninterface/uninterface`. Frozen `UiCollectionPanelAdaptation<UiCollectionFilterPanelContext>` named `filter-badges`.

Pass as UiCollectionHeader's `filterPanel` together with `filterBindings`, or call `.view({ bindings, render })` in a custom host. Requires an explicit binding collection (an empty array is valid); duplicate keys reject. The adaptation uses bindings directly, without evaluating the context's render callback.

Displays available active filters as label/value badges. Bodies are passive; their named crosses call the business-defined clear operation and are disabled when unavailable. Add filter offers inactive eligible definitions, then borrows the selected UiCollectionFilter editor in filter-badge/popover context. Live edits retain the popup; successful explicit submissions close it. Only accepted active criteria appear. Ordinary dismissal discards unaccepted drafts; presentation relocation preserves them. Never mount two editors for the same binding.

Shared code owns lifecycle and binding operations; backends own native surfaces, close targets and editor focus. UiBadge is unchanged. See [collection badges](../../guides/collection-badges.md) for policy details and verification of active summaries, read counts, cancellation, availability, focus, wrapping and responsive relocation.
