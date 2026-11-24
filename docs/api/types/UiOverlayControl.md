# UiOverlayControl

Factory-created interaction owner shared by createUiDrawerControl and createUiPopoverControl. Generic T defaults to void. Import from @uninterface/uninterface.

- Read-only state: phase (idle/setup/opening/open/closing), pendingClose and session.
- run(options?: UiOverlayRunOptions<T>): Promise<UiOverlayResult<T>> starts one interaction.
- dispose(): Promise<void> permanently ends ownership, aborts and settles the current run after cleanup.

One attached view and one active run per owner. Missing view, disposed owner and concurrent invocation return error outcomes. A completed run permits reuse. The engine is shared with UiModal; modality is a view responsibility. Verify denied concurrency, sequential reuse and owner cleanup.

See [drawers and popovers](../../guides/drawers-and-popovers.md) for composition, ownership and evidence limits.
