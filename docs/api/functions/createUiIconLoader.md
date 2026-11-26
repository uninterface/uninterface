# createUiIconLoader

Import from `@uninterface/uninterface/vite`. This optional build-time integration uses the Vite `^7.3.7 || ~8.1.6 || ~8.2.4 || ^8.3.3` peer and the application's Vue dependency.

```ts
function createUiIconLoader(): import('vite').Plugin
```

Install the returned plugin once in Vite configuration, alongside the Vue plugin. It compiles local `.svg?ui-icon` imports into inline Vue components usable as catalogue `component` values and authored `tones` variants. No Vue wrapper file, runtime SVG parser, compiler, download or icon service is needed in the application bundle. Ordinary `.svg`, `?url` and `?raw` imports retain their existing bundler behavior. Combining `?ui-icon` with `?url` or `?raw` is an error.

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createUiIconLoader } from '@uninterface/uninterface/vite'

export default defineConfig({
  plugins: [createUiIconLoader(), vue()],
})
```

```ts
// Application setup
import FlaskIcon from './icons/flask.svg?ui-icon'

const icons = { 'demo.flask': { component: FlaskIcon } }
```

TypeScript applications include `/// <reference types="@uninterface/uninterface/vite/client" />` in an included declaration file. This declares the matching imports as Vue components. The plugin and its optional Vite peer are needed only for this build path; ordinary component catalogue entries need neither. Other build systems may supply equivalent component imports, but this loader supports Vite only.

Core owns compilation, build diagnostics, file watching and client/server render output. Applications own the SVG source, licensing, catalogue name and registration. Supply static, self-contained SVG artwork with one `svg` root, a proportional `viewBox` and suitable `preserveAspectRatio`. Vue directives and expressions are rejected. An initial XML declaration is accepted. Local fragment references, gradients, authored colors and `currentColor` are preserved. Root attributes supplied by UiIcon continue to control accessibility and focusability. Use `currentColor` where theme foreground or tone should apply; fixed authored colors stay fixed.

Assets are trusted application source, not user uploads; this build tool does not sanitize SVG. Referenced fragment IDs must be unique where necessary in the rendered document; the loader does not rewrite IDs. External images, fonts and styles are not fetched, embedded or rewritten by the loader. Keep icon artwork noninteractive. Do not use an image URL or `<img>` when inheritance from the surrounding foreground is required.

Client builds produce Vue render functions; Vite SSR builds produce server render functions. Use the same catalogue and stable application setup on the server and client. The [SVG usage guide](../../guides/localization-and-icons.md#svg-files) provides the complete integration pattern.

Observable verification: an imported SVG renders inline through UiIcon and entry icons; viewBox, color, local references, accessible naming and declared mirroring survive; explicit tone variants switch artwork; SSR output hydrates without replacing the SVG; invalid sources fail the build; browser output excludes the loader/compiler; ordinary asset imports remain URLs or raw text as requested. DOM checks establish wiring and preserved markup; browser paint and assistive-technology behavior require their own acceptance.
