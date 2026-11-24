# Architecture

Uninterface separates application policy, shared UI control, and presentation. Business compositions use the public Vue interface; backends implement the views required by that interface.

## From business intent to a rendered view

Business code supplies values, labels, rules, and operations. Controls maintain editing and interaction state and expose it through bindings. Core Vue components connect that state and those relationships to independently implemented backend views. The backend owns rendered structure, accessibility wiring, toolkit integration, and styles.

For example, `form.bindings.submitButton` supplies a button's role, availability, and loading state. `UiButton` consumes the producer-independent binding and passes resolved properties to its backend view. The form's submission route calls the shared control, which validates and invokes the application's save operation. The backend does not run a competing form manager.

Responsive context is independently observed through `useUiResponsive()`. Business compositions or controls derive ordinary layout props and pass them with `v-bind`; UiLayout has no knowledge of the detector or producing control. See [responsive layouts](../guides/responsive-layouts.md) for the ownership and reactive binding pattern.

See [control bindings](../contracts/control-binding.md) and the [backend view contract](../api/backend/README.md) for exact responsibilities.

## Assembly and selective imports

An application selects one backend under the package name `@uninterface/backend`. Core components that require a backend view statically import it, such as `@uninterface/backend/UiButton.vue`. UiFlowLayout and ordinary UiRegionLayout arrangements reuse UiLayout. Grouped region scrolling delegates to a dedicated UiRegionLayout backend view. This avoids an eager rendering registry and supports tree shaking. Business compositions import `@uninterface/uninterface` regardless of the selected backend.

Applications can split their JavaScript by importing Vue pages or features on demand. Pass a loader such as `() => import('./ReportsPage.vue')` to a Vue Router route or to Vue's `defineAsyncComponent`. Import Uninterface components normally inside each feature. The bundler can share common modules across chunks, with every chunk using the same selected backend. Load the application’s chosen backend stylesheet during setup so it is available when a feature opens.

The entry point imports one backend stylesheet, including the documented document baseline its toolkit expects. UiApp is an application frame, not a substitute for that baseline. A backend exports native setup, locale resources and icon defaults through `./integration`; an optional `./vite` factory provides build plugins. Application assembly installs only the selected backend's hooks. They supply toolkit configuration and build processing without introducing a business-facing setup API or eager view registry. Selecting a backend for a build is distinct from selecting a presentation strategy for a form or another logical node. Renderless attachment and typed queries are available through [UiStrategy](../api/components/UiStrategy.md), with backend-specific support documented in the [strategy contract](../contracts/strategy.md).

Consumer setup is described in [getting started](../getting-started.md). The [backend authoring reference](../api/backend/README.md) specifies view modules, bindings, events, and capability declarations. See [the package build](package-build.md) for compiled exports and release checks.

## Source organization

The source separates control behavior, presentation contracts, and Vue composition:

| Location | Responsibility |
|---|---|
| `src/index.ts` | Explicit consumer API exports |
| `src/components/` | Public Vue components connecting controls to backend views |
| `src/components/internal/` | Private helpers shared by components for control/view coordination; not public components or package exports |
| `src/feedback/` | Virtual feedback targets, connected routes and delivery lifecycle contracts |
| `src/bindings/` | Producer-independent component binding contracts and scope checks |
| `src/controls/` | Field/form control factories, codecs, validation rules, and field context |
| `src/entries/` | Shared entry/source definitions, async collection and selection control, and core view coordination |
| `src/backend/` | Backend authoring types and capability checks |
| `src/setup/` | Vue application assembly and native contexts |
| `src/text/` | Text-source contract and synchronous core resolution helpers |
| `src/i18n/` | Locale control, message resources and reactive app context |
| `src/icons/` | Semantic catalogue, icon definitions and application context |
| `src/build/` | Optional build-time integration, including the Vite SVG icon loader and its import declarations; excluded from runtime entry points |
| `src/environment/` | Responsive context, detection and the responsive setup entry |
| `src/runtime/` | Read-only inspection of the selected assembly |
| `src/layout/` | Layout resolution and participating-child handling |
| `src/presentation/` | Shared theme colors and button treatment vocabulary |

Import consumer APIs from `@uninterface/uninterface`, responsive setup from `@uninterface/uninterface/responsive`, theme authoring from `@uninterface/uninterface/theme`, and backend authoring contracts from `@uninterface/uninterface/backend`. Internal source paths are implementation details. Control factories include `createUiFieldControl`, `createUiFormControl`, and `createUiEntryControl`; their returned controls are distinct from the `UiField` and `UiForm` Vue components.

Use `@uninterface/uninterface/setup` for application creation, `/i18n` for resource authoring and `/icons` for catalogue configuration. The [API entry-point table](../api/README.md#entry-points-by-responsibility) lists the complete public import boundaries.
