# collectionFilterPanel

Import from `@uninterface/uninterface`. Built-in UiCollectionPanelAdaptation<UiCollectionFilterPanelContext> with diagnostic name `filter-panel`.

Implements a stacked list of supplied non-search filters, supplying filter-form/panel/stacked context. Each filter selects its editor adaptation and retains its live/explicit completion, validation and clearing rules. No extra heading, Apply/Clear action or form session is generated.

UiCollectionHeader uses it by default inside narrow-expandable. Long-row continues to arrange inline filter views. Custom headers can call context.renderPanel('filters'); other hosts can invoke view with a render callback that forwards presentation context. The host owns expansion, trigger state and active indication. Native-backed layout owns spacing; business content stays opaque.

Verify panel context, optional content, preserved drafts/focus and no requests on expansion. See [panel guide](../../guides/collection-panels.md).
