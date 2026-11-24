# UiI18nOptions

Import from `@uninterface/uninterface/i18n`.

| Member | Meaning/default |
| --- | --- |
| `locale?: string` | Initial interface tag; `en`. Underscores accepted. |
| `formattingLocale?: string` | Initial independent Intl locale; `en`. |
| `fallback?: string \| false` | Cross-language resource fallback; `en`. False requires compatible resources. |
| `preloadCore?: readonly string[]` | Core feature namespaces to prepare during `ready`, such as `uninterface.collections`. The common pack is always included. For server rendering and hydration, use the same list on both sides. Application setup defaults to preloading all core packs when `ssr: true` and this option is omitted. |
| `resources?: Record<string, UiLocaleSource>` | Namespaced application/plugin resources. Core reserves `uninterface.*` and `backend`. The `uninterface` entry can add complete language packs and aliases. Existing built-in locale replacements use overrides. |
| `overrides?: Record<string, Record<string, UiMessagePack>>` | Namespace → canonical resource tag → explicit key replacements. |

Registered definitions are setup configuration. On language change, prepare registered application domains, the native locale and the core packs required by the current views or explicit preloads. Native locale mappings remain backend-owned. Verify that a failed load retains prior active messages.

Complete custom core language packs include `ok` along with the other members of [UiMessages](UiMessages.md).
