# Add Uninterface to a Vue project

Use `@uninterface/uninterface` for business-facing components and controls, together with one presentation backend. Backend selection belongs to project setup; individual business components use the same public imports.

## Requirements

Use a Vue 3 project compatible with the current `^3.5.43` peer dependency and a bundler that processes Vue single-file components, such as Vite with `@vitejs/plugin-vue`. TypeScript projects should use Vue-aware type checking, such as `vue-tsc`.

These instructions assume an existing Vue application. See the [API reference](api/README.md) for supported exports and limitations.

## Package format

Core's compiled package provides ESM and TypeScript declarations. To use a local Core checkout, follow the selected backend's setup guide and substitute the tarball path for the Core package argument in its install command. Build the tarball from the Core checkout using the [package build instructions](architecture/package-build.md).

## Resolve core and select a backend

Make `@uninterface/uninterface` available to the application and resolve the chosen backend under `@uninterface/backend`. The alias must resolve to the same package for the bundler and TypeScript, including imports from core. Core resolves the descriptor and statically imported component views through that alias. Keep one runtime copy of Vue and core.

In a Vite app that consumes Core or its selected backend as Vue/TypeScript source, follow the selected backend's dependency optimizer configuration. Excluding Core and the backend alias from prebundling keeps setup and views on the same modules during development, so they share Vue injection keys.

Choose a backend whose declared capabilities satisfy your application. Follow that package's installation guide for compatible versions, dependencies, build plugins, stylesheet effects and limitations. Core defines the integration protocol without maintaining toolkit-specific setup branches.

## Initialize the application

Follow the selected backend's guide for required build plugins and stylesheet effects. Its `integration` module supplies native Vue setup, locale resources and icon defaults automatically:

```ts
import { createUiApplication } from '@uninterface/uninterface/setup'
import '@uninterface/backend/font.css'
import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import App from './App.vue'

const app = createUiApplication(App, {
  i18n: { locale: 'en', formattingLocale: 'en-US' },
  document, // Explicit ownership of this document's lang and dir.
  requires: ['actions.v1'],
})
await app.ui.ready
app.mount('#app')
```

The returned object is a Vue app: install routing and other application plugins with `app.use(...)` before mounting. Omit `document` for an embedded application. Use `ssr: true` with a stable `idPrefix` for each SSR root, identical during hydration. Create a fresh app per request, await readiness and dispose it in `finally`; see [application isolation and supported SSR scope](guides/application-isolation.md). Keep Vue and core deduplicated when using local packages. The backend's build plugin remains build-time configuration; no business component imports it.

Choose one font entry first: **Backend default · Network** (`@uninterface/backend/font.css`, recommended), **Backend default · Bundled** (`@uninterface/backend/font-bundled.css`), **Uninterface default · Network** (`@uninterface/fonts/font.css`), or **Uninterface default · Bundled** (`@uninterface/fonts/font-bundled.css`). Then always import `@uninterface/backend/style.css`. The Uninterface choices require the optional `@uninterface/fonts` package. Omit the font import to use system fonts without downloads. See [typography and font delivery](guides/typography.md) for exact steps, CSP and deployment requirements.

## Optional document margin policy

When your application owns the document and wants no outer body margin, apply the public class in its HTML entry:

```html
<body class="uninterface-body-margin0">
  <div id="app"></div>
</body>
```

Load the core stylesheet once in the application entry:

```ts
import '@uninterface/uninterface/style.css'
```

Core supplies this backend-independent utility. Declare `style.body-margin0.v1` in the application's required capabilities; HTML class usage is not automatically discovered by the capability checker. This removes body margins only. It does not change scrolling, padding or descendant styles, and UiApp does not apply it automatically. An embedded application leaves this choice to the document owner.

See the [class reference](api/styling-classes/uninterface-body-margin0.md) for its scope, cascade behavior and backend obligations.

## Use semantic components

A small `App.vue` can combine ordinary content with an Uninterface action:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UiApp, UiButton, UiContent } from '@uninterface/uninterface'

const reviewed = ref(false)
</script>

<template>
  <UiApp>
    <UiContent>
      <h1>Review request</h1>
      <p>Confirm that you have reviewed the request.</p>
      <UiButton
        :disabled="reviewed"
        @click="reviewed = true"
      >
        Mark reviewed
      </UiButton>
      <p v-if="reviewed" role="status">Request reviewed.</p>
    </UiContent>
  </UiApp>
</template>
```

This example keeps its state in memory. The application decides what reviewing means and how to persist it. The button provides action semantics; the backend provides its appearance and interaction treatment. The heading and explanatory content remain ordinary HTML.

[UiApp](api/components/UiApp.md) supplies the application surface through the selected backend and inherits the document typography established by backend assembly. It follows ordinary document flow; the application supplies its content and internal layouts. Individual Uninterface components can also be used without UiApp.

[UiContent](api/components/UiContent.md) gives ordinary content backend-owned insets while preserving the available outer width. Use it inside main/footer or other intended content areas; UiApp itself remains free of content padding and width constraints.

Initialize the application with `createUiApplication` from `@uninterface/uninterface/setup`. Message resources and icon overrides belong to setup, independently of component nesting. See [localization and icons](guides/localization-and-icons.md).

For an actual editor, encapsulate field definitions, codecs, validation, and control lifetime inside a business component. Its consumer should normally provide typed data and a save operation. Follow [business component composition](guides/business-components.md), then use [control bindings](guides/control-bindings.md) for submit/reset activity and availability.

## Inspect the selected assembly

Use `getUiRuntime` from `@uninterface/uninterface` for the backend name, description, adapter version, toolkit dependency versions, theme vocabulary and capability checks. Business components do not need to import the backend package. See [runtime information](guides/runtime-information.md).

Optional detector setup uses `@uninterface/uninterface/responsive`; theme authoring uses `@uninterface/uninterface/theme`. Vite applications can load SVG files into icon catalogues with `createUiIconLoader` from `@uninterface/uninterface/vite`; see [SVG setup](guides/localization-and-icons.md#svg-files). Ordinary components, controls and common types remain in core. The [API entry-point table](api/README.md#entry-points-by-responsibility) maps each audience to its imports.

## Continue

- [Usage principles](guides/README.md): scope, responsibility boundaries, and evidence-based decisions.
- [API reference](api/README.md): individual components, factories, types, and constants.
- [Current implementation](api/README.md): capabilities and limitations.
- [Architecture](architecture/README.md): how controls, Vue components, and backend views connect.
