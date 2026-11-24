# UiMessage

Import from `@uninterface/uninterface/i18n`.

`type UiMessage = string | ((context: UiMessageContext) => string)`.

Text is literal; no implicit interpolation or HTML syntax. Functions use named parameters and standard Intl-backed helpers. They must return text synchronously and should be pure. Resource loading, rather than individual message rendering, can be asynchronous.

Verification: parameter/plural output changes with the selected message pack while markup-like text is rendered as text.
