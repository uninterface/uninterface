# UiFilterAdaptation

Import type from `@uninterface/uninterface`.

`UiFilterAdaptation<E extends { readonly pattern: string }>` contains readonly name: string, pattern: E['pattern'], and view: (context: UiFilterViewContext<E>) => VNodeChild. Names are diagnostic; stable object identity governs strategy agreement. The view is an actual Vue render implementation and can return an SFC/component tree with independent interactions. It owns presentation, accessible controls and completion affordances, never another query/validation engine. Normal Vue tree identity rules apply across replacement. Verify custom rendering, native keyboard behavior, completion and lifecycle.

See [built-in filters](../../guides/filter-patterns.md) and [filter adaptations](../../guides/filter-adaptations.md) for supported examples, ownership and observable checks.
