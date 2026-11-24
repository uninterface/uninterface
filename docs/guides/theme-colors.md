# Theme colors and extensions

Business components choose semantic roles rather than exact colors. Every theme supplies primary, success, danger, warning, info and secondary. Additional roles are explicit extensions of this shared vocabulary, independent of component type.

```vue
<UiButton color="success">Approve</UiButton>
<UiCard color="info">Delivery information</UiCard>
```

## Declaring and implementing an extension

The theme/backend integration owns semantic definitions, concrete appearance and support claims. A manifest can declare:

```json
{
  "themeColors": {
    "accent": { "description": "Complementary theme emphasis" }
  },
  "provides": [
    "theme.colors.v1",
    "theme.color.accent.v1",
    "button.color.v1"
  ]
}
```

This is a fragment of the package capability manifest. `theme.colors.v1` guarantees the baseline. `theme.color.accent.v1` belongs to the theme, not to buttons. `button.color.v1` says buttons can consume the installed theme's roles. An installed extension must be implemented for every supported component exposing themed colors, including its supported treatments and states. Adding metadata cannot supply missing CSS or toolkit mappings.

Keep runtime and TypeScript names together in the integration package:

```ts
import type { UiBackendDescriptor } from '@uninterface/uninterface/backend'
import { uiTheme } from '@uninterface/uninterface/theme'
import metadata from '../package.json'
import manifest from '../capabilities.json'

const colors = uiTheme.colors.define(manifest.themeColors)

declare module '@uninterface/uninterface/theme' {
  interface UiThemeColorExtensions extends Record<keyof typeof colors, true> {}
}

export const uiBackend: UiBackendDescriptor = {
  name: 'Example theme',
  packageName: metadata.name,
  version: metadata.version,
  description: metadata.description,
  capabilities: manifest.provides,
  themeColors: colors,
}
```

Including this package's declarations extends UiThemeColor without accepting arbitrary strings. Type registration is project-wide; it does not establish runtime support. Definitions can be declared without being supported, but unsupported roles cannot be used. At this stage, installation means preparing one backend/theme assembly; no runtime registry or mandatory new provider boundary is introduced.

## Requiring support

A business composition using accent declares both its component capability and the theme extension:

```json
{
  "schemaVersion": 1,
  "name": "accent-actions",
  "requires": ["button.color.v1", "theme.color.accent.v1"]
}
```

The requirement scan rejects this against a theme without `theme.color.accent.v1` and accepts it when that extension and the component capability are supplied. Component runtime validation checks dynamically supplied colors too. There is no automatic fallback from accent to primary. The scan matches explicit requirements; it does not infer every possible dynamic color expression from Vue source.

Ordinary business callers do not reproduce palette definitions or add CSS. Theme authors supply the implementation once. Semantic roles do not trigger confirmation, persistence, navigation or any other action.

## Exploring supported colors

`getUiRuntime().theme.colors.supported` returns the installed theme's supported roles without importing a backend into business code. A button showcase can use it to render six roles for a baseline-only theme or additional roles for a theme with extensions. This is appropriate because the showcase's purpose is to enumerate the available palette. Required business functionality must not disappear through capability filtering.

Each backend documents its supported extensions and supplies their presentation. Acceptance tests check baseline behavior, supported extension rendering, unsupported extension rejection, type augmentation and manifest matching. Actual visual appearance, interaction states and contrast also require browser verification.

UiCard also accepts a per-level default color through [uiCardPresentation](../strategies/uiCardPresentation.md). Its explicit color overrides that default; null selects neutral. Card colors do not recolor descendant controls or propagate as child-card props.

## Optional component color

UiCollapsible explicitly permits an unsupported color request to be ignored. Backends advertise `collapsible.color.v1` when they implement it. Without that capability, core drops the request before theme support validation; with it, normal role validation applies. This is a component-specific optional presentation contract, not a general fallback rule for buttons, cards or required theme extensions. A composition may require `collapsible.color.v1` explicitly if its acceptance criteria need the backend to render color. Native scope and expanded/collapsed treatments can differ; see [UiCollapsible](../api/components/UiCollapsible.md).
