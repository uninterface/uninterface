# UiMessagePack

Import from `@uninterface/uninterface/i18n`.

`Readonly<Record<string, UiMessage>>`: one namespace's text definitions for one locale. Keys are local to that namespace. Packs are registered through UiLocaleSource or application overrides. Missing selected-pack keys throw; locale fallback does not silently fill individual keys from another language.

Implementations must treat registered resources as immutable and render text safely. Verification: namespace isolation, explicit overrides and missing-key errors.
