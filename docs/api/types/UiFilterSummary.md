# UiFilterSummary

`UiFilterSummary` contains readonly text: string and optional readonly items: { key: string; text: string }[]. Import the type from `@uninterface/uninterface`.

text is the accessible applied-value description, without repeating the criterion label. The badge host combines the binding label and this description once; custom hosts must provide criterion identity when needed. No heuristic prefix stripping is performed. Items supply stable identities for optional badge grouping/removal; each text is business/localization-owned. Summary styling is not encoded. Core derives summaries from current query criteria, never raw drafts. Optional definition.removeSummaryItem defines removal meaning; it is not automatically array deletion or whole-filter clearing. Read-only summaries do not instantiate an editor.

Verify formatted/localized criteria, summary after external updates, known-key removal and unchanged retained-result semantics during loading.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
