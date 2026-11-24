# UiApplication

The Vue application returned by [createUiApplication](../functions/createUiApplication.md), with installed Uninterface services. Import the type from `@uninterface/uninterface/setup`. Normal Vue `mount`, `use`, `provide` and `config` APIs remain available.

## UI services

The readonly `ui` property exposes:

| Member | Type | Responsibility |
|---|---|---|
| `i18n` | [UiI18nControl](UiI18nControl.md) | Application language, resources and formatting |
| `icons` | [UiIconCatalogue](UiIconCatalogue.md) | Immutable catalogue for this application |
| `colorMode` | [UiColorModeControl](UiColorModeControl.md), optional | Mode service when supported by the backend integration |
| `ready` | `Promise<void>` | Initial resource readiness; await before mount or SSR rendering |
| `dispose()` | `void` | Release services for an abandoned or server-rendered app; attempts all releases, reporting errors afterward; repeated calls are safe |

Change language through the locale control, not global runtime metadata. `colorMode` is absent when the backend lacks its integration; supplying explicit color-mode options then fails.

## Lifecycle and verification

Unmounting disposes locale and color-mode work and restores owned document settings. A never-mounted application must be explicitly disposed. Backend integration and core must keep application services isolated; independent applications can select different locales and icon overrides. Different simultaneous color modes within one document are outside the supported color-mode contract.

Use `app.ui.dispose()` in the server request's `finally`, including readiness/render failures. Dispose owned business sessions separately. See [application isolation](../../guides/application-isolation.md) for ID namespaces, cleanup errors and hydration obligations.
