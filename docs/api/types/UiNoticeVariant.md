# UiNoticeVariant

Import this type from `@uninterface/uninterface`.

`'filled' | 'outline' | 'soft'` requests a notice surface independently of its semantic kind/color and announcement policy. Filled uses a strong color surface with matching foreground; outline emphasizes a border without a tinted fill; soft uses a low-emphasis tinted surface. Soft does not promise a particular border treatment. Omission selects the backend's less-solid default and is not an alias for an explicit variant.

Core validates the vocabulary. Backends fulfill it through native variants or documented theme-token adaptations; exact colors, borders and typography remain backend-owned. See [UiNotice](../components/UiNotice.md) and the [feedback guide](../../guides/feedback-and-details.md) for mappings, ownership and examples.

Verify all three requests, omission, light/dark modes, all supported colors, retained content/focus and rejection of unsupported variant strings. Browser inspection is required for actual paint and geometry.
