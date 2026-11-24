# Public API reference

The API reference is organized by kind of public interface, including exports and styling classes. Each business, responsive-setup and theme-authoring export has an individual reference; backend authoring has a separate guide. The [conceptual contracts](../contracts/README.md) describe the broader design, while these pages describe the current implementation.

The [control presentation principles](../guides/design-principles.md) define shared shape, state-size stability and backend adaptation expectations. The [input-styled control contract](../contracts/input-styled-controls.md) defines shared look-and-feel obligations for applicable editors; component references identify their participation and adaptations.

For setup, see [getting started](../getting-started.md); the [documentation index](../README.md) covers the full library.

The [native HTML content baseline](../guides/native-html.md) defines the supported native element/tag set alongside these exports. Backends declare `native.content.v1` for this contract.

Read the [usage guidelines](../guides/README.md) for principles and rationale, including how to [encapsulate a business component](../guides/business-components.md) so its consumer supplies typed data and operations without reconstructing controls.

| Category | Contents |
|---|---|
| [Vue components](components/README.md) | `UiCard`, `UiForm`, `UiField`, inputs, buttons, `UiLayout`, `UiRegionLayout`, `UiFlowLayout`, and `UiGridLayout` |
| [Functions](functions/README.md) | Control factories `createUiFieldControl`, `createUiFormControl`, `createUiListControl`, local list sources, `getUiRuntime`, responsive setup/profiles, and `useUiResponsive` |
| [Classes](classes/README.md) | Structured form submission errors |
| [Types and interfaces](types/README.md) | `UiFieldControl`, `UiFieldDraftChange`, `UiFormControl`, `UiButtonBinding`, codecs, validation results/rules, messages, theme colors, layout options, and backend metadata types |
| [Strategies](../strategies/README.md) | Common presentation strategies including checkable arrangement, values, recommended defaults and fallback relationships |
| [Constants and metadata](constants/README.md) | Strategy query identities, `uiEnglishMessages`, grouped `uiTheme` authoring, and capability metadata |
| [Styling classes](styling-classes/README.md) | Explicit body-margin and static navigation-focus utilities supplied by the core stylesheet |
| [Backend authoring](backend/README.md) | `@uninterface/uninterface/backend` binding types, Vue view module contracts, and static assembly |

`UiFormSubmissionError` and `UiFormSubmissionStateError` are exported Error classes. Controls are created by functions and described by interfaces/type aliases; controls are not constructed with `new`.

## Entry points by responsibility

| Entry point | Audience and exports |
|---|---|
| `@uninterface/uninterface` | Business components, control factories, common types, numeric codecs and currency formatting, `useUiResponsive`, `defineUiI18n`, `useUiI18n`, `useUiColorMode`, `getUiRuntime` |
| `@uninterface/uninterface/setup` | Application creation: `createUiApplication`, application types and options |
| `@uninterface/uninterface/i18n` | Typed namespace helpers, message resources, standalone localization controls and authoring types |
| `@uninterface/uninterface/vue-router` | Optional Vue Router adapter: `createVueRouterNavigationDriver` and `VueRouterNavigationOptions`; requires the optional Vue Router peer |
| `@uninterface/uninterface/icons` | Icon catalogue types and required names |
| `@uninterface/uninterface/vite` | Optional Vite build integration: `createUiIconLoader` for inline SVG catalogue assets |
| `@uninterface/uninterface/vite/client` | TypeScript declarations for `.svg?ui-icon` component imports |
| `@uninterface/uninterface/responsive` | Application setup: `createUiResponsive`, `defineUiResponsiveProfile`, responsive context/profile types |
| `@uninterface/uninterface/theme` | Theme authoring: `uiTheme.colors.define`, `UiThemeColor` and specialized definition/extension types |
| `@uninterface/uninterface/backend` | Backend authors and compatibility tooling: view contracts, `UiBackendDescriptor`, `assertUiCapabilities`, `uiCoreCapabilities` |
| `@uninterface/uninterface/style.css` | Application setup: opt-in public styling utilities |
| `@uninterface/uninterface/capabilities.json` | Build tools: machine-readable core capability declarations |

Ordinary callers use `getUiRuntime()` to inspect the active core/backend versions, backend description, toolkit dependencies, supported theme vocabulary and capabilities. See [runtime information](../guides/runtime-information.md). Theme authoring operations are grouped under `uiTheme` so future vocabularies can have their own groups without adding individual root functions for each operation. Specialized types stay in their relevant entry point.

Business components use named imports from `@uninterface/uninterface`; TypeScript types can use `import type`. Backend selection and stylesheet imports belong to application assembly. Import from documented entry points rather than private source paths.

Public components and types use `Ui` names. Functions use a verb followed by `Ui` and their purpose; control factories explicitly end in `Control`. Constants and shared objects use lower-camel `ui` names. Backend authoring exports follow the same convention. Object members such as `validate()` and `reset()` retain names scoped by their containing control.

Test-only exports are documented in the separate **testing API reference** in `@uninterface/testing` (`docs/api/README.md`).

For workflows and compositions, use the [guide catalog](../guides/README.md#guides), including [collections and presentation](../README.md#collections-and-presentation).

[Drawer navigation](../guides/drawer-navigation.md) composes existing views using [createUiNavigationDrawerControl](functions/createUiNavigationDrawerControl.md) and optionally coordinates the responsive switch using [useUiResponsiveNavigationSwitch](functions/useUiResponsiveNavigationSwitch.md).

[UiProgressBar](components/UiProgressBar.md) presents known and unknown task progress; [usage and ownership](../guides/progress.md).


[Collection editor coordination](../guides/collection-editors.md) uses [createUiCollectionEditorControl](functions/createUiCollectionEditorControl.md) and [useUiCollectionEditor](functions/useUiCollectionEditor.md).
