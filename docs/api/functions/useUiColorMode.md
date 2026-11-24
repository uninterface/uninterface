# useUiColorMode

Import from `@uninterface/uninterface` and call in Vue setup.

`useUiColorMode(): UiColorModeControl` returns the application's reactive appearance control installed by `createUiApplication`. It renders nothing and supplies no styling classes to business components. Read `state.value.resolved` for `light` or `dark`; call `setPreference('light' | 'dark' | 'system')` on an owning application. An inherited control is read-only by policy and rejects changes.

Throws if the selected backend has no color-mode integration or application setup is absent. Require `theme.color-mode.v1` when appearance switching is essential; optional demonstrations may inspect capabilities before using this function.

Verification: changing the owning preference preserves input drafts, selected values, component identity and focus while native descendants and open overlays follow the new mode. See [color mode](../../guides/color-mode.md).
