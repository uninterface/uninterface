# getUiRuntime

Inspect the active core, backend, theme vocabulary and capabilities through `@uninterface/uninterface`.

```ts
import { getUiRuntime } from '@uninterface/uninterface'
const ui = getUiRuntime()

ui.core.version
ui.backend.name
ui.backend.description
ui.backend.version
ui.backend.dependencies
ui.theme.colors.supported
ui.capabilities.has('theme.color.accent.v1')
ui.capabilities.require(['theme.color.accent.v1'])
```

Signature: `getUiRuntime(): UiRuntime`.

Returns the same deeply frozen snapshot for this statically assembled core module. Safe outside Vue setup, without a UI context wrapper, a DOM, or an application mount. It does not create controls, register components, render, install a theme, or subscribe to reactive state. Backend metadata is loaded statically; no view registry or runtime backend switch is added.

Core and adapter package versions derive from package.json. Backend dependencies distinguish toolkit versions from the adapter's version. Names and descriptions are package-provided metadata, not localized UI resources. The snapshot exposes copied data, not mutable backend state. Its capabilities combine core and backend declarations; has checks membership and require throws with missing identifiers. Theme metadata is validated on inspection. Reading theme.colors requires theme.colors.v1, so non-themed backends can still expose other runtime metadata.

Use runtime information for an About view, diagnostics, compatibility checks or a theme showcase. Required capabilities should also be declared for build-time matching. A showcase may enumerate supported colors; ordinary business functionality must not silently disappear when a required role is missing.

See [UiRuntime](../types/UiRuntime.md) for all fields. Verify metadata identity, nested immutability, capability failure, installed theme support and tree shaking without pulling in backend views.
