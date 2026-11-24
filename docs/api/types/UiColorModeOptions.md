# UiColorModeOptions

Import from `@uninterface/uninterface/theme`; pass as `createUiApplication(root, { colorMode })`.

| Member | Meaning |
| --- | --- |
| `document?: Document` | Explicitly own this document's native mode selector and inline `color-scheme`. Only one owner may be active. |
| `host?: Document` | Observe this host's native document selector without writing it. |
| `inherit?: UiColorModeControl` | Observe an existing host control; the host remains responsible for document translation. |
| `preference?: UiColorModePreference` | Explicit light/dark/system policy. Without an explicit policy, a valid stored preference wins, otherwise system. |
| `initialMode?: UiColorMode` | System fallback without a browser media query, default light. |
| `storageKey?: string` | Opt-in localStorage key, requires document ownership. Invalid stored values are ignored; blocked storage never prevents mode changes. |

`document`, `host` and `inherit` are mutually exclusive. Inherited options cannot supply a preference or persistence policy. An explicit preference precedes saved data. Omitting options in a browser observes the ambient document; omitting them on a server yields request-local system/light fallback without globals or document mutation. Language ownership through the top-level `document` option is independent.

A host's explicit native selector is managed by its owner; without one, the backend's documented ordinary policy applies, including system appearance where supported. A shared inherited control alone does not apply document styles. Simultaneously different modes in a single document are unsupported. See [color mode](../../guides/color-mode.md), including SSR and hydration requirements.
