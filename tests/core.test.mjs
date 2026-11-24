import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, posix } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { checkboxValue, choiceKeys } from '../src/controls/choices.ts'
import { localeDirection, resolveLocale } from '../src/i18n/locale.ts'

test('regional locale fallback preserves the requested script', () => {
  const source = { resources: { en: {}, 'zh-Hans': {}, 'zh-Hant': {}, ar: {} } }

  assert.equal(resolveLocale('zh_TW', source, 'en'), 'zh-Hant')
  assert.equal(resolveLocale('ar-EG', source, 'en'), 'ar')
  assert.equal(localeDirection('ar-EG'), 'rtl')
  assert.throws(
    () => resolveLocale('zh-Hant', { resources: { zh: {} } }, false),
    /No locale resource satisfies zh-Hant/,
  )
})

test('choice controls preserve empty keys and reject duplicate membership', () => {
  assert.deepEqual(choiceKeys(undefined, false), [])
  assert.deepEqual(choiceKeys('', false), [''])
  assert.deepEqual(choiceKeys(['', 'a'], true), ['', 'a'])
  assert.throws(() => choiceKeys(['a', 'a'], true), /duplicate-free/)
  assert.equal(checkboxValue('indeterminate', true), 'indeterminate')
  assert.throws(
    () => checkboxValue('indeterminate', false),
    /boolean raw value/,
  )
})

test('npm packs Core metadata, public export targets, and documentation', () => {
  const root = new URL('../', import.meta.url)
  const readJson = (path) =>
    JSON.parse(readFileSync(new URL(path, root), 'utf8'))
  const source = readJson('package.json')
  const manifest = readJson('dist/package/package.json')
  const capabilities = readJson('dist/package/capabilities.json')
  assert.equal(manifest.name, source.name)
  assert.equal(capabilities.name, manifest.name)
  assert.deepEqual(Object.keys(manifest.exports), Object.keys(source.exports))
  assert.match(manifest.exports['.'].import, /^\.\/esm\/.+\.js$/)
  assert.match(manifest.exports['./setup'].types, /^\.\/types\/.+\.d\.ts$/)

  const directory = mkdtempSync(join(tmpdir(), 'uninterface-core-pack-'))
  try {
    const report = join(directory, 'pack.json')
    const output = openSync(report, 'w')
    try {
      execFileSync(
        process.execPath,
        [
          process.env.npm_execpath,
          'pack',
          './dist/package',
          '--offline',
          '--ignore-scripts',
          '--json',
          '--pack-destination',
          directory,
          '--cache',
          join(directory, 'cache'),
        ],
        { cwd: fileURLToPath(root), stdio: ['ignore', output, 'inherit'] },
      )
    } finally {
      closeSync(output)
    }
    const [pack] = JSON.parse(readFileSync(report, 'utf8'))
    assert.equal(pack.name, manifest.name)
    assert.equal(pack.version, manifest.version)
    const tarball = join(directory, pack.filename)
    assert.ok(existsSync(tarball))

    const files = new Set(pack.files.map(({ path }) => path))
    const targets = Object.values(manifest.exports).flatMap((entry) =>
      typeof entry === 'string' ? [entry] : Object.values(entry),
    )
    for (const target of targets)
      assert.ok(files.has(target.slice(2)), `Missing export target ${target}`)

    const rootFiles = [
      'LICENSE',
      'README.md',
      'capabilities.json',
      'package.json',
    ]
    for (const path of [...rootFiles, 'style.css', 'docs/getting-started.md'])
      assert.ok(files.has(path), `Missing package file ${path}`)
    for (const path of files)
      assert.ok(
        [...rootFiles, 'style.css'].includes(path) ||
          /^(docs|build|esm|types)\//.test(path),
        `Unexpected package file ${path}`,
      )

    const icon = readFileSync(
      new URL('dist/package/esm/components/UiIcon.vue.js', root),
      'utf8',
    )
    const style = icon.match(/^import "(.*\.css)";/m)?.[1]
    assert.ok(style, 'UiIcon keeps its compiled scoped stylesheet import')
    const stylePath = posix.join('esm/components', style)
    assert.ok(files.has(stylePath), 'UiIcon stylesheet is packed')

    const messages = readFileSync(
      new URL('dist/package/esm/i18n/packs.js', root),
      'utf8',
    )
    assert.match(messages, /import\(["']\.\/locales\/common\/ar\.js["']\)/)
    assert.doesNotMatch(messages, /__vitePreload/)

    // The release workflow stages the exact tarball verified here.
    if (process.env.UNINTERFACE_PACK_FILE)
      copyFileSync(tarball, process.env.UNINTERFACE_PACK_FILE)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
