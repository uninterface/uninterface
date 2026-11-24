# assertUiCapabilities

Fail visibly when a selected backend plus core cannot meet a declared requirement.

```ts
assertUiCapabilities(backend: UiBackendDescriptor, required: readonly string[]): void
```

Import from `@uninterface/uninterface/backend` when inspecting an arbitrary candidate descriptor. For the active assembly, business code uses `getUiRuntime().capabilities.require(...)` from core. The function unions [uiCoreCapabilities](../constants/uiCoreCapabilities.md) and `backend.capabilities`, then matches each required identifier exactly. It returns normally if all are present. Otherwise it throws an Error containing the backend name and missing identifiers. It neither substitutes capabilities nor returns a degraded configuration.

```ts
assertUiCapabilities(candidate, ['form.draft.v1', 'input.text.v1'])
```

Application setup and components call this to check required capabilities. The runtime function validates the supplied requirement list, not every manifest dependency transitively. The workspace build checker additionally checks core, backend, and scenario manifest requirements. Neither scans arbitrary Vue templates or negotiates version ranges.

Business/component authors must declare actual requirements, and backend authors must accurately declare support. Ordinary invalid form input uses field/form issues instead of this mechanism.

Acceptance: supported requirements succeed; an unsupported identifier fails loudly and names it. Build-time checking should catch known mismatches before a page runs.

Theme metadata is validated before matching: extension support claims must have semantic definitions and the shared baseline theme capability. The same validation is used by the workspace manifest scanner. See [theme colors](../../guides/theme-colors.md).
