# UiFeedbackAction

Import this type from `@uninterface/uninterface`.

One ordinary button descriptor: required stable unique `key: string` and `label: UiTextSource`; optional `color: UiThemeColor`, `variant: UiButtonVariant`, `disabled: boolean`, and `form: string`. Either supply `binding: UiButtonBinding`, or optional `onClick: (event: MouseEvent) => void`, `type: 'button' | 'submit' | 'reset'` and `loading: boolean`. Binding and manual activation/type/loading are mutually exclusive, enforced by TypeScript and UiButton at runtime. Local disabled can only tighten availability. Native form bindings retain their ownership/association requirements. Core renders actual UiButtons. Inline notices use their message-aligned recovery row; toast/notification targets use the same backend-private FooterActions arrangement as modal/drawer/popover actions. Notice text-variant defaults apply. Use the actions slot for icons, rich labels, focus refs, zOrder and arbitrary button attributes. Verify disabled/loading live guards, manual callbacks, bound invocation and native form routing.

See [feedback routing](../../guides/feedback-routing.md) for ownership, complete examples and observable acceptance.

Text properties accept [UiTextSource](UiTextSource.md); core resolves them reactively in UiNotice, including its slot feedback. Locale changes preserve the current delivery and action keys. Use a whole-message getter for changes to structure or availability. See [text sources](../../guides/text-sources.md).
