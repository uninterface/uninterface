# UiApplicationOptions

Configuration for [createUiApplication](../functions/createUiApplication.md). Import from `@uninterface/uninterface/setup`. Members are optional except `idPrefix` when `ssr: true`.

| Property | Type | Default and effect |
|---|---|---|
| `idPrefix` | `string` | Automatic for client-only apps; required with `ssr: true`. Stable Vue/native ID namespace, identical across server and hydration and distinct per root in one document |
| `i18n` | [UiI18nOptions](UiI18nOptions.md) | English interface and independent English formatting; configures locale resources and fallback |
| `icons` | [UiIconCatalogue](UiIconCatalogue.md) | Backend defaults; supplied names replace or extend catalogue definitions |
| `zLayers` | `Readonly<Record<string, { above?: readonly string[]; below?: readonly string[] }>>` | Named application-lifetime layer extensions in dependency order; built-in Background < Content < Floating remains intact |
| `requires` | `readonly string[]` | No extra requirements; unmet capabilities fail before mount |
| `document` | `Document` | No document-language ownership; when supplied, maintains this document's lang/dir |
| `colorMode` | [UiColorModeOptions](UiColorModeOptions.md) | Supporting backends observe the host document in a browser; see the color-mode reference for SSR behavior |
| `ssr` | `boolean` | `false`; true creates a Vue SSR application |
| `backend` | [UiBackendIntegration](../backend/assembly.md#uibackendintegration) | Statically selected backend integration; assembly customization only |

## Ownership and restrictions

`backend` can extend the selected integration, for example with native locale resources. It must match the statically selected component backend; it is not a runtime backend switch.

`document` grants exclusive ownership of language attributes only; a second concurrent owner fails. `colorMode.document` independently grants native document-mode ownership. Explicit color-mode options are rejected when the backend lacks that integration. Embedded applications normally leave document ownership to their host.

An ID prefix starts with a letter and otherwise contains letters, digits, underscores or hyphens. Mounted prefixes cannot conflict within a document. See [application identity and SSR](../../guides/application-isolation.md) for lifecycle, matching hydration and the verified scope.

Create one application per SSR request and await `app.ui.ready` before rendering or mounting. The application owns service cleanup; do not share its mutable services across requests. See [UiApplication](UiApplication.md).

## Implementation responsibility and verification

Setup must isolate per-application resources, validate required capabilities and release owned services. Verify that omitted document ownership leaves host language attributes unchanged, explicit ownership updates/restores them, independent applications retain their own resources, and unmet requirements fail before mount.
