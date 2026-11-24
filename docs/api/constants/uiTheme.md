# uiTheme

Theme-authoring operations imported from `@uninterface/uninterface/theme`. The object and its colors group are frozen. Importing this entry point does not load a backend or Vue components.

## colors.define(definitions)

Declares additional semantic roles without supplying colors, installing support or changing global state.

```ts
import { uiTheme } from '@uninterface/uninterface/theme'

const colors = uiTheme.colors.define({
  premium: { description: 'Premium offering or membership' },
})

declare module '@uninterface/uninterface/theme' {
  interface UiThemeColorExtensions extends Record<keyof typeof colors, true> {}
}
```

Signature:

```ts
function define<const T extends Record<string, UiThemeColorDefinition>>(
  definitions: T,
): Readonly<{ [K in keyof T]: UiThemeColorDefinition }>
```

Returns a cloned frozen map with frozen definitions. Names are lowercase letters, digits or hyphens starting with a letter; reserved object names are rejected. Descriptions must be nonempty strings. Baseline roles cannot be redefined as extensions. Invalid input throws, including from JavaScript callers.

The companion augmentation derives TypeScript keys from the same definition. It is project-wide, not a runtime support claim. The installed backend's themeColors metadata supplies runtime definitions; theme.color.<name>.v1 claims support. Definitions alone do not implement styles. See [theme colors](../../guides/theme-colors.md).

Ordinary business components use UiThemeColor from core. Inspect installed support with getUiRuntime().theme.colors rather than importing theme-authoring operations. Verify invalid definitions, immutability, type inference and rejection of unsupported roles.
