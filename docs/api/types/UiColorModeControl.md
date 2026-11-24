# UiColorModeControl

Import from `@uninterface/uninterface/theme`.

Application-owned UI state, obtained through `app.ui.colorMode` or `useUiColorMode()`. Business components do not reconstruct its native styling integration.

- `state`: readonly computed ref containing `preference: UiColorModePreference | null`, `resolved: UiColorMode`, and `inherited: boolean`. Inherited controls expose no locally owned preference (`null`).
- `setPreference(value: UiColorModePreference): void`: synchronously changes the owning policy and resolved native selector. Rejects invalid values, inherited-control writes, or writes after disposal. Vue renders and host mutation observers settle on their ordinary update cycles.

Lifecycle belongs to `createUiApplication`: unmount releases listeners and restores owned document settings. `app.ui.dispose()` handles abandoned, unmounted applications. Neither mode changes nor disposal resets business data. See [color mode](../../guides/color-mode.md).
