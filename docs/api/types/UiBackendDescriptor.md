# UiBackendDescriptor

```ts
interface UiBackendDescriptor {
  packageName: string
  version: string
  description: string
  dependencies?: readonly { readonly packageName: string; readonly version: string }[]
  name: string
  capabilities: readonly string[]
  themeColors?: Readonly<Record<string, UiThemeColorDefinition>>
}
```

Exported as a type from `@uninterface/uninterface/backend`. Business code inspects the active assembly through getUiRuntime() from core. `name` identifies the backend in diagnostics. `capabilities` lists literal versioned capabilities claimed by that backend's rendering implementation. Core capabilities are added when requirements are checked.

This descriptor does not contain CSS classes, render functions, component registries, or business state. Backend views are independently imported at build time through the [backend assembly contract](../backend/README.md). A descriptor alone does not implement a backend.

Backend authors must keep the descriptor aligned with their machine-readable manifest and actual component behavior. The descriptor is stable metadata and should be treated as immutable. Capability mismatches throw rather than select an unrequested fallback. Current backends export it as `uiBackend` from their package roots.

Acceptance combines manifest matching with shared behavioral tests; declarations do not establish conformance on their own.

`themeColors` declares extension meanings; omission means no extensions. Support is separately claimed by `theme.color.<name>.v1`, with `theme.colors.v1` required for the baseline. Runtime and build checks reject unsupported or malformed claims. This is shared theme metadata, not a component-specific palette. See [UiThemeColor](UiThemeColor.md).

`packageName`, `version` and `description` identify the adapter package and derive from package metadata. `name` is its display name. `dependencies` lists relevant toolkit packages and their actual assembly versions, not a duplicate adapter version. An independent implementation may have no toolkit dependency; an adapter records its underlying toolkit versions. The runtime copies and freezes these fields rather than exposing a mutable descriptor.
