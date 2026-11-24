# Build the Core package

From the Core repository root with Node.js 24 and npm:

```sh
npm ci
npm test
npm pack ./dist/package
```

`npm run build` creates `dist/package`. Its runtime exports use compiled ESM, and its TypeScript entries use generated declarations. Core builds all entries together so setup, components and helpers share one copy of each emitted module. The build keeps Vue and the selected backend external. The application's `@uninterface/backend` alias still selects the adapter at build time.

The tarball includes scoped component styles, the public stylesheet, lazy locale modules, the Vite SVG loader, capability metadata, documentation and license. `npm test` checks the tarball's export targets and verifies that the compiled `UiIcon` retains its stylesheet import. The GitHub release workflow retains that same inspected tarball for staging.

To verify application behavior, install the tarball in a Vue/Vite app with a compatible backend and run the backend's setup and integration checks. See [application setup](../getting-started.md).
