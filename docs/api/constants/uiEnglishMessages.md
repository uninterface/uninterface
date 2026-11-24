# uiEnglishMessages

Import from `@uninterface/uninterface/i18n`. A frozen `Readonly<UiMessages>` containing the full built-in English vocabulary for inspection or authoring complete locale resources. Importing this value includes the complete English dictionary. Normal application setup loads the common pack and loads feature packs as needed. The [UiMessages reference](../types/UiMessages.md) lists the keys.

Use application `i18n.overrides.uninterface.en` for deliberate replacements. Native toolkit defaults use the toolkit's synchronized locale pack rather than these core strings. Verification: replacing `loading` changes core button activity wording without changing the native select's loading wording.
