# UiMessageDescriptor

Import from `@uninterface/uninterface/i18n`.

`{ namespace: string; key: string; params?: Readonly<Record<string, string | number>> }` identifies a message without resolving it early. Use it in `i18n.text` and field/form rule or codec issues. Views resolve descriptors reactively, so existing feedback follows language changes without revalidation. Literal strings remain valid and unchanged.

This object is data, not HTML or a VNode. Missing namespace/key is a loud configuration error. Verification: fail validation, switch language, observe translated feedback with the same field/control instance.

Create descriptors with the namespace-bound `msg(key, params?)` supplied by [defineUiI18n](../functions/defineUiI18n.md) or [useUiI18n](../functions/useUiI18n.md). The factory also exposes standalone `msg` for codecs outside Vue setup. Creation performs no resource lookup or translation; the consuming application resolves the descriptor. Parameters retain their reference without automatic reactivity. See the [application-helper recipe](../../guides/localization-and-icons.md#typed-application-helper).
