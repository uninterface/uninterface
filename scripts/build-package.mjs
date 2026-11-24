import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { build } from 'vite'

const root = new URL('../', import.meta.url)
const source = new URL('src/', root)
const destination = new URL('dist/package/', root)
const manifest = JSON.parse(await readFile(new URL('package.json', root)))
const { scripts, devDependencies, ...distribution } = manifest
const exports = { ...manifest.exports }
const entries = {}
for (const [name, target] of Object.entries(manifest.exports)) {
  if (
    typeof target !== 'string' ||
    !target.endsWith('.ts') ||
    target.endsWith('.d.ts')
  )
    continue

  const module = target.slice('./src/'.length, -'.ts'.length)
  entries[module] = fileURLToPath(new URL(target, root))
  exports[name] = {
    types: `./types/${module}.d.ts`,
    import: `./esm/${module}.js`,
  }
}

await rm(destination, { force: true, recursive: true })
await build({
  root: fileURLToPath(root),
  configFile: false,
  plugins: [
    vue(),
    {
      name: 'uninterface-component-styles',
      // Vite extracts scoped styles from the Vue modules. Keep the imports on
      // their owning chunks so styles follow the selected components.
      generateBundle: {
        order: 'post',
        handler(_options, bundle) {
          for (const chunk of Object.values(bundle)) {
            if (chunk.type !== 'chunk') continue
            for (const asset of chunk.viteMetadata?.importedCss ?? []) {
              const relativeAsset = posix.relative(
                posix.dirname(chunk.fileName),
                asset,
              )
              const specifier = relativeAsset.startsWith('.')
                ? relativeAsset
                : `./${relativeAsset}`
              chunk.code = `import ${JSON.stringify(specifier)};\n${chunk.code}`
            }
          }
        },
      },
    },
  ],
  logLevel: 'warn',
  build: {
    outDir: fileURLToPath(new URL('esm/', destination)),
    lib: { entry: entries, formats: ['es'] },
    cssCodeSplit: true,
    minify: false,
    // Core's entries must share module instances, including when code is split.
    rollupOptions: {
      external: /^(vue(?:-router)?|@uninterface\/backend)(\/|$)/,
      output: {
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: fileURLToPath(source),
        entryFileNames: '[name].js',
      },
    },
  },
})

execFileSync(
  process.execPath,
  [
    fileURLToPath(import.meta.resolve('vue-tsc/bin/vue-tsc.js')),
    '-p',
    fileURLToPath(new URL('tsconfig.build.json', root)),
  ],
  { stdio: 'inherit' },
)

await mkdir(new URL('build/', destination), { recursive: true })
for (const file of [
  'index.mjs',
  'index.d.mts',
  'icon-loader.mjs',
  'icon-loader.d.mts',
  'client.d.ts',
]) {
  await cp(
    new URL(`build/${file}`, source),
    new URL(`build/${file}`, destination),
  )
}
for (const file of ['README.md', 'LICENSE', 'capabilities.json', 'docs']) {
  await cp(new URL(file, root), new URL(file, destination), { recursive: true })
}
await cp(new URL('style.css', source), new URL('style.css', destination))
exports['./style.css'] = './style.css'
exports['./vite'] = {
  types: './build/index.d.mts',
  import: './build/index.mjs',
}
exports['./vite/client'] = './build/client.d.ts'
distribution.files = [
  'esm/',
  'types/',
  'build/',
  'style.css',
  'capabilities.json',
  'docs/',
]
distribution.exports = exports
await writeFile(
  new URL('package.json', destination),
  `${JSON.stringify(distribution, null, 2)}\n`,
)
