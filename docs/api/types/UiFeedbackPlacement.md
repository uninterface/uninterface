# UiFeedbackPlacement

Import from `@uninterface/uninterface`.

`'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'`. Creation-time viewport placement; start/end follow document direction. Backend-owned bounded scrolling accommodates changing-height content. Placement does not change queue admission or native modality. Separate targets at the same location may overlap; share a target for coordinated placement. Verify corners/center, narrow/RTL rendering and modal-local scope.

See [toasts and notifications](../../guides/toasts-and-notifications.md) for complete examples, consumer obligations and acceptance.
