# UiRuntime

The read-only result of [getUiRuntime](../functions/getUiRuntime.md). Import this interface from `@uninterface/uninterface` when passing runtime information to a consumer.

| Member | Meaning |
|---|---|
| core.packageName, core.version | Core package identity and version |
| backend.packageName | Adapter package identity |
| backend.name | Human-readable backend name |
| backend.description | Adapter package description |
| backend.version | Adapter package version |
| backend.dependencies | Read-only array of packageName/version records for relevant underlying toolkits |
| theme.colors.defaults | Six baseline roles, as readonly UiDefaultThemeColor[] |
| theme.colors.extensions | Frozen map of declared extension definitions, including any declared but unsupported roles |
| theme.colors.supported | Readonly UiThemeColor[] containing defaults plus implemented extensions |
| capabilities.all | Frozen array of unique core/backend capability identifiers |
| capabilities.has(capability: string): boolean | Whether that exact capability is present |
| capabilities.require(capabilities: readonly string[]): void | Throw if any requirement is unmet |

All nested objects and arrays are read-only and frozen at runtime. Metadata reflects one static assembly; it is not a Vue ref or reactive theme selector. No controls, render functions or backend component registry are exposed. The only functions inspect or assert capabilities; they do not alter the assembly.

Adapter and toolkit versions are distinct: `backend.version` identifies the adapter, while `backend.dependencies` identifies relevant underlying toolkits and their versions. An independent implementation may have an empty dependency list. Definitions describe theme vocabulary, while supported lists only implemented roles. Accessing theme.colors on a backend lacking theme.colors.v1 throws rather than claiming a palette.
