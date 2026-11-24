# UiCollectionFilterViewContext

`UiCollectionFilterViewContext` is supplied by useUiCollectionFilter and UiCollectionFilter's default scoped slot. Import the type from `@uninterface/uninterface`.

Readonly reactive getters: binding: UiCollectionFilterBinding and presentation: UiFilterPresentationContext. submit(): Promise<UiFilterCommitResult> invokes binding.commit; clear(): UiFilterCommitResult invokes binding.clear. These routes emit the host's applied event for committed/unchanged results, allowing host-specific dismissal without making the editor know popup internals. Deactivated/unmounted/replaced views do not emit late applied events. Live changes use their policy and do not emit applied.

The editor owns native keyboard/form semantics and meaningful button labels. Do not destructure changing getter values into nonreactive snapshots. Verify injected descendants, custom scoped rendering, reactive context, one submit route and no late close after view removal.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.

A custom default slot receives `editor`, the stable registered Vue view, alongside binding/presentation/operations. Render `<component :is="editor" />` once to wrap or arrange the existing business editor without reconstructing its field/session. Rendering multiple copies is outside the one-editor contract.
