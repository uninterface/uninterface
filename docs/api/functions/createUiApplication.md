# createUiApplication

Import from `@uninterface/uninterface/setup`.

`createUiApplication(root: Component, options?: UiApplicationOptions): UiApplication`

Creates an ordinary Vue app with app-scoped localization and a semantic icon catalogue, installs the selected backend's native integration, and checks `requires`. It introduces no business-facing context component. `root` is the application component. Use the returned `app.use(...)` for routing and other plugins, await `app.ui.ready`, then mount. Set `ssr: true` for Vue's SSR/hydration factory; create one per request.

Options: `idPrefix` supplies the generated-ID namespace (required for SSR/hydration); `colorMode` configures appearance ownership/inheritance and optional persistence; `i18n` configures resources/languages; `icons` replaces/adds catalogue definitions; `requires` lists capabilities; `document` exclusively owns document lang/dir; `backend` supplies an assembly-authored integration override; `ssr` selects SSR creation. See [UiApplicationOptions](../types/UiApplicationOptions.md).

Client-only apps get automatic prefixes. SSR and hydration must use the same explicit prefix, distinct for each root within a document. Duplicate mounted prefixes and concurrent document-language owners fail loudly. Disposal/rollback attempts every acquired service release even if one fails; rollback errors retain the setup failure as their cause. A readiness rejection still requires caller cleanup. See [application identity, cleanup and the verified SSR envelope](../../guides/application-isolation.md).

The static `@uninterface/backend/integration` supplies native contexts, resources, artwork and installation. It does not globally register all toolkit components. No business component needs that import. Missing capabilities/icons reject synchronously; unavailable locale resources reject `app.ui.ready`/`setLocale`. Unmount disposes locale and color-mode work and restores owned document attributes. Do not mount before readiness or separately install the toolkit plugin.

Acceptance: mount two apps in different languages; changing one must not affect the other's messages or native context. Teleported menus retain native configuration and form drafts survive language changes. See [the guide](../../guides/localization-and-icons.md).

See [application color mode](../../guides/color-mode.md) for supported backend requirements and SSR/hydration policy.
