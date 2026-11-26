# assertUiCapabilities

Fail visibly when a selected backend plus core cannot meet a declared requirement.

```ts
assertUiCapabilities(backend: UiBackendDescriptor, required: readonly string[]): void
```

Import from `@uninterface/uninterface/backend` when inspecting an arbitrary candidate descriptor. For the active assembly, business code uses `getUiRuntime().capabilities.require(...)` from core. The function unions [uiCoreCapabilities](../constants/uiCoreCapabilities.md) and `backend.capabilities`, then matches each required identifier exactly. It returns normally if all are present. Otherwise it throws an Error containing the backend name and missing identifiers. It neither substitutes capabilities nor returns a degraded configuration.

```ts
assertUiCapabilities(candidate, ['form.draft.v1', 'input.text.v1'])
```

Application setup and components call this function to validate the supplied requirement list. Checks compare explicit capability identifiers. Validate any additional dependency requirements explicitly in application assembly. See the [capability contract](../../contracts/capability.md).

Business/component authors must declare actual requirements, and backend authors must accurately declare support. Ordinary invalid form input uses field/form issues instead of this mechanism.

Acceptance: supported requirements succeed; an unsupported identifier fails loudly and names it. Build-time checking should catch known mismatches before a page runs.

Theme metadata is validated before matching: extension support claims must have semantic definitions and the shared baseline theme capability. See [theme colors](../../guides/theme-colors.md).
