# UiFilterEditingPolicy

`UiFilterEditingPolicy = { commit: 'explicit' } | { commit: 'live'; debounceMs?: number }`. Import the type from `@uninterface/uninterface`.

Explicit leaves drafts pending until commit, normally through native Enter/form submission or an Apply button. Live schedules validation after meaningful editor changes; finite nonnegative debounceMs optionally delays it. Newer edits supersede old timers/validation; same-turn changes may coalesce. Initialization, synchronization and presentation changes never schedule queries. Invalid drafts do not commit. Policy is fixed per created session; context does not override it.

Verify live choices, optional delayed text editing, explicit range submission, canceled timers and no implicit blur policy.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
