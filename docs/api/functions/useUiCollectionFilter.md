# useUiCollectionFilter

`useUiCollectionFilter(): UiCollectionFilterViewContext` injects the nearest UiCollectionFilter context during Vue setup. Import from `@uninterface/uninterface`. Throws without a host.

The stable returned object has reactive binding/presentation getters plus submit() and clear(). Read getters in render/computed functions; do not destructure snapshots when context can change. Submit and clear emit the host's applied event for committed/unchanged results; live binding changes do not. The helper does not own the editor or query lifetime and does not inspect DOM/backend names.

Verify nested business components see updated presentation without remount, custom usage fallbacks and accessible labels when the host provides visual identity.

See [reusable collection filters](../../guides/collection-filters.md) for ownership, examples and acceptance.
