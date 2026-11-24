# UiFilterSelection

Import type from `@uninterface/uninterface`.

`UiFilterSelection<E extends { readonly pattern: string }>` is UiFilterAdaptation<E> or `(context: UiFilterViewContext<E>) => UiFilterAdaptation<E> | undefined`. Reactive selectors are pure and synchronous. Undefined abstains; disagreement/no answer restores pattern defaults. Stable selected objects, not names or selector function identity, determine agreement. Avoid creating fresh adaptation objects per call. Verify typed patterns, live dependencies, context changes, blocks and conflict/default behavior.

See [built-in filters](../../guides/filter-patterns.md) and [filter adaptations](../../guides/filter-adaptations.md) for supported examples, ownership and observable checks.
