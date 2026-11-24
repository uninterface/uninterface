# Collection filter contract

Implemented foundation: a business definition, a query-connected editing session and a context-aware borrowed editor. See the [usage guide](../guides/collection-filters.md) and [definition API](../api/types/UiCollectionFilterDefinition.md).

Business semantics remain open typed values and opaque editors, not a closed widget enumeration. One definition may update multiple query properties; equality, active state, clearing and summaries are explicit. Query writes use current criteria without mutating them. Field associations describe presentation opportunities only. Source acceptance is distinct from remote-result acceptance.

The session owns validation scheduling, draft lifetime, supersession and disposal. Native/backend views own surfaces and interaction mechanics; business editors use existing field/codec/validation facilities. Keyboard and button submissions reach the same explicit operation; live edits validate before querying. Context-aware rendering cannot change commit policy or bypass validation.

UiCollectionFilter is the current render host, not a declaration registry. Definitions and bindings live in a business owner outside conditional placement. Each binding permits one active editor view; summaries/triggers may be repeated. Context changes preserve child identity; moving between mounted hosts preserves the session's draft, not necessarily DOM identity. External replacement of the same criterion supersedes stale drafts; unrelated changes preserve them. Explicit popup cancellation discards unfinished work; responsive hiding preserves it.

Independent editors, column popups, summaries as data, custom hosts and explicit/live/debounced commits are implemented. [Badge/Add-filter presenters](../guides/collection-badges.md) use explicit binding enumeration. Grouped submission, per-filter placement observation, repeated clauses and general expression composition remain separate work. See the guide's acceptance matrix and each public export for precise obligations.

## Built-in patterns and presentation implementations

Search, single/multiple choice and ordered range controls extend the common binding with pattern and a typed editor binding. Their factories accept the business definition without createEditor and own reusable field/entry/draft construction. UiCollectionFilter hosts their registered views; there is still one active editor per binding and one query/session owner. Common getters/operations remain live and refer to the same session.

Filter adaptations are open objects with diagnostic name, pattern and an actual Vue view(context) implementation. Typed search/choice/range strategy families select them with context-sensitive defaults and object-identity agreement. They compose existing backend controls and receive common filter operations, typed editor state and host presentation context. They do not return a layout schema, introduce native predicates or change commit policy. Context-sensitive completion is a view interaction through the existing commit route; panel disclosure never implies a group transaction.

The built-in range criterion uses optional minimum/maximum values, with undefined for absence and one string draft per bound. Parsing/validation coordinates both bounds; business mapping owns inclusivity/units/query shape. Choice values are string keys or unique string-key arrays; selection activity/empty meanings are explicit. Search criterion is a string with optional normalization/validation.

UiCollectionHeader's independently selected actual Vue adaptation supplies filter context and arranges slots. Filter presentation chooses how to edit a criterion inside that arrangement. See [built-in filters](../guides/filter-patterns.md), [filter adaptations](../guides/filter-adaptations.md), [header adaptations](../guides/header-adaptations.md) and the [ownership map](../guides/collections.md).
