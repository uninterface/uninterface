# UiFilterPresentationContext

`UiFilterPresentationContext` describes the semantic host, independently of backend/theme. Import the type from `@uninterface/uninterface`.

Readonly members: usage ('table-column'|'header-search'|'filter-row'|'filter-form'|'filter-badge' or custom string), container ('inline'|'popover'|'panel'|'dialog'), labelProvided, summaryProvided, arrangement ('single-row'|'stacked'), submission ('individual'). Custom usage needs no core registration and editors should fall back conventionally. Single-row is a preference, not a promise every custom editor fits.

Context remains reactive through UiCollectionFilter presentation overrides or inherited column host defaults. It cannot change validation/query meaning or commit policy. labelProvided may suppress redundant visible headings but not accessible names. No backend-name, CSS breakpoint or mandatory pixel dimensions are exposed. Group submission is intentionally unsupported until coordinated transactions exist.

Verify inherited and custom usages, changing context without input replacement/focus loss and distinguishing read-only summaries from editing.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
