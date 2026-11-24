# UiFeedbackMessage

Import this type from `@uninterface/uninterface`.

Semantic content for one delivery. All members are optional: `kind: UiNoticeKind`, `color: UiThemeColor` (custom kind only), `variant: UiNoticeVariant`, `title: UiTextSource`, `message: UiTextSource`, `details: readonly UiTextSource[]`, `announcement: UiNoticeAnnouncement`, `dismissible: boolean`, `actions: readonly UiFeedbackAction[]`. Defaults match UiNotice: info, off, not dismissible, backend default variant. Text is never HTML. Explicit destination props override corresponding values; default/actions slots replace the corresponding generated content. Backends own text/list markup and action presentation. Verify localized content, kind/urgency independence, slot overrides and actionable recovery.

See [feedback routing](../../guides/feedback-routing.md) for ownership, complete examples and observable acceptance.

Text properties accept [UiTextSource](UiTextSource.md); core resolves them reactively in UiNotice, including its slot feedback. Locale changes preserve the current delivery and action keys. Use a whole-message getter for changes to structure or availability. See [text sources](../../guides/text-sources.md).
