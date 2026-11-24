# Runtime information and API boundaries

Business components can inspect the active assembly through core, without importing the selected backend:

```ts
import { getUiRuntime } from '@uninterface/uninterface'

const ui = getUiRuntime()
const attribution = `Powered by Uninterface and ${ui.backend.name}`
const adapterVersion = ui.backend.version
const toolkits = ui.backend.dependencies
```

`getUiRuntime()` returns a read-only snapshot, available outside Vue setup. It does not install anything or create a rendering boundary. The selected assembly stays fixed for the build. Core and adapter versions are package versions; toolkit versions are separate dependency records. The backend owns the accuracy of its identity, description and dependency declarations.

Use `ui.theme.colors.supported` for a palette explorer and `ui.capabilities.has(...)` for diagnostics. Required business functionality must declare its requirements for build-time scanning and can assert them with `ui.capabilities.require([...])`. A capability claim describes support; acceptance tests still have to verify it. Do not silently omit required functionality based on inspection.

The snapshot cannot be used to mutate the backend, change themes, register extensions, or manage controls. It contains no component registry. Optional authoring and setup tasks have dedicated imports:

```ts
import { createUiResponsive, defineUiResponsiveProfile } from '@uninterface/uninterface/responsive'
import { uiTheme } from '@uninterface/uninterface/theme'
```

Application setup owns responsive detection and supplies a source through `createUiResponsive`. Theme authors declare additional roles through `uiTheme.colors.define`, implement them and claim their capabilities. Ordinary components consume `useUiResponsive()` and semantic colors through core. See [responsive layouts](responsive-layouts.md) and [theme colors](theme-colors.md).

`@uninterface/uninterface/backend` serves backend authors and tooling that inspect arbitrary candidate descriptors. The selected `@uninterface/backend` package is an assembly detail: setup selects it and imports its stylesheet once; business components obtain runtime information from core.

Verify that attribution reflects the selected backend, toolkit and adapter versions remain distinct, unsupported requirements throw, metadata resists mutation, and metadata-only consumers exclude backend views. Full fields and obligations are in [UiRuntime](../api/types/UiRuntime.md) and [getUiRuntime](../api/functions/getUiRuntime.md).
