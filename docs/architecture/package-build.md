# Build the Core package

From the Core repository root with Node.js 24 and npm:

```sh
npm ci
npm test
npm pack ./dist/package
```

`npm run build` creates `dist/package`. Its runtime exports use compiled ESM, and its TypeScript entries use generated declarations. Core builds all entries together so setup, components and helpers share one copy of each emitted module. The build keeps Vue and the selected backend external. The application's `@uninterface/backend` alias still selects the adapter at build time.

The tarball includes scoped component styles, the public stylesheet, lazy locale modules, the Vite SVG loader, capability metadata, documentation and license. `npm test` checks the tarball's export targets and verifies that the compiled `UiIcon` retains its stylesheet import. The GitHub release workflow uses that same inspected tarball for npm releases.

To verify application behavior, install the tarball in a Vue/Vite app with a compatible backend and run the backend's setup and integration checks. See [application setup](../getting-started.md).

## Release from a Git tag

Set the intended version with `npm version <version> --no-git-tag-version` and commit `package.json` and `package-lock.json`. Tag that commit as `v<version>` and push the tag. For example, push `v0.0.2` from a commit whose `package.json` version is `0.0.2`.

The [release workflow](../../.github/workflows/publish.yml) checks the tag against the committed version before testing and packing. A version such as `9.9.9` publishes under npm's `latest` dist-tag. A version with a SemVer prerelease suffix, such as `9.9.9-rc.1`, publishes under `pre-release`. Manual staging uses the same rule. The npm trusted publisher for `publish.yml` and the GitHub `npm` environment must allow `npm publish` for tag releases.
