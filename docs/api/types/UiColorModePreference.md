# UiColorModePreference

Import from `@uninterface/uninterface/theme`.

`type UiColorModePreference = 'light' | 'dark' | 'system'` expresses appearance policy. `system` follows `prefers-color-scheme: dark` and updates live; explicit values ignore system changes. Without a browser media query, system resolves to `initialMode` or light. Persistence is separately opt-in. See [color mode](../../guides/color-mode.md).
