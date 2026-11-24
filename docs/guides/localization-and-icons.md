# Application localization and icons

Configure services at application setup. Component nesting does not register message packs or choose a backend. Each application/SSR request gets its own mutable locale control and icon catalogue. Ordinary code uses `useUiI18n()` from core; specialized types, message authoring and the standalone control factory live in `@uninterface/uninterface/i18n`. Icon authoring lives in `@uninterface/uninterface/icons`.

## Setup and language selection

```ts
import { createUiApplication } from '@uninterface/uninterface/setup'
import App from './App.vue'

const app = createUiApplication(App, {
  i18n: {
    locale: 'zh_Hans',
    formattingLocale: 'en-US',
    resources: {
      customer: {
        resources: {
          en: { nameRequired: 'Name is required.' },
          'zh-Hans': { nameRequired: '请输入姓名。' },
          'zh-Hant': { nameRequired: '請輸入姓名。' },
        },
      },
    },
  },
})
await app.ui.ready
app.mount('#app')
```

Inside a component, `const i18n = useUiI18n()` accesses that application's service. `await i18n.setLocale('zh-Hant')` loads registered resources and the selected backend's native pack. Inspect `i18n.state.value`: active `locale`, `requestedLocale`, `resolved` resource locales by namespace (including `backend`), `pending`, `error`, `direction` and `formattingLocale`. Handle rejected requests; the prior active language survives failure. A newer selection supersedes an older pending request. A superseded operation resolves without activating its language.

Underscores are accepted at input and normalized to BCP 47 tags. Regional/script resolution uses exact matches, declared aliases, compatible likely script/language matches, then the configured fallback (`en` by default; `false` disables cross-language fallback). A missing resource with no allowed fallback rejects. Resolution never drops a Traditional Chinese script into a Simplified Chinese default. Bare `zh` uses Simplified Chinese. Applications can override aliases in their own resource sources. Fallback applies to resource packs; missing keys in a selected pack are errors rather than silently mixing languages.

Built-in packs cover `en`, `zh-Hans`, `zh-Hant` and `ar` (العربية). Requests such as `en-GB`, `zh-CN`, `zh-TW` and `zh-HK` can use compatible packs without claiming region-specific translations. Native locale-pack mapping belongs to each backend and may use a compatible toolkit locale identifier. This does not change the selected language or imply a formatting region.

### Arabic and RTL

Select `await i18n.setLocale('ar')` for Arabic; its display name is **العربية**. Regional requests such as `ar-EG` resolve to the shared Arabic pack. Core derives `direction: 'rtl'` from the Arabic script, and Arabic text follows normal Unicode bidirectional ordering. No text reversal or bidirectional override is applied. Latin words, numbers, email addresses and business identifiers retain their logical contents.

Core owns its complete Arabic message pack. Applications must register their own Arabic messages or explicitly declare a resource alias. Backends own native-resource mapping; inspect `resolved.backend` for the actual pack. Native toolkit packs may contain upstream untranslated strings; registering a pack does not promise every native string is translated.

The document owner sets `lang` and `dir` through the existing `document` setup option. Embedded hosts must provide appropriate language/direction boundaries, including for teleports. Switching language preserves drafts and the independent formatting locale. Use `dir="auto"` or `<bdi>` where application-owned mixed-language content needs its own direction boundary. Do not reverse strings or apply a blanket bidi override.

The supplied font sets currently rely on system fallback for Arabic glyphs. Applications needing a consistent Arabic typeface can supply one through the documented typography customization. Verify shaping, mixed Arabic/Latin text, navigation, keyboard behavior and popups in the target browser, then switch back to an LTR language. Message and direction support do not establish complete backend RTL compatibility.

Resources can be objects or asynchronous zero-argument loaders. Register all required namespaces during setup; only the chosen packs are loaded. Their loader results are cached per control. Configure `overrides: { namespace: { 'canonical-locale': { key: replacement } } }` for explicit application replacements. Duplicate keys in a pack are ordinary JavaScript object ownership; plugins should use distinct namespaces. Use `resources.uninterface` to add complete new built-in locale packs or alias rules. Existing built-in packs use overrides for customization. The `backend` namespace is reserved for native integration.

For a feature that loads on demand, set `lazy: true` on its application locale source and use dynamic imports for each language, including the default language. Await `app.ui.i18n.loadNamespace('invoices')` alongside the feature code before rendering it. Synchronous translations then use the selected pack. Once requested, the namespace follows language changes for the life of the app so cached feature views retain translated text and editing state. An unsuccessful language switch preserves the current packs.

Native wording stays native. Core loading text is a manual-presentation fallback, not an instruction to override a toolkit's built-in loading text. Backend resource mapping updates native messages through native configuration APIs. Browser/system-owned menus and dialogs can follow system language instead.

### Built-in message packs

`uninterface.common` is the core startup pack. It contains `ok`, `cancel`, `close`, `retry`, `required`, `loadingIndicator`, `loading`, `emptyMessage`, and `clearSelection`. Core loads the active language's additional packs when a view or validation issue needs them.

| Namespace | Messages |
| --- | --- |
| `uninterface.collections` | Collections, tables, filters, sorting and pagination |
| `uninterface.entries` | Choices, suggestions and navigation entry states |
| `uninterface.feedback` | Notification viewport naming |
| `uninterface.files` | File selection, removal and upload |
| `uninterface.floating` | Floating-control positioning |
| `uninterface.numbers` | Numeric validation |
| `uninterface.password` | Password visibility |
| `uninterface.temporal` | Dates, times, intervals and temporal validation |

Components load their own dependencies. For direct application lookups, use `await i18n.loadNamespace('uninterface.collections')` before reading that pack synchronously, or configure `i18n.preloadCore` when creating the app. The original `uninterface` descriptor keys and overrides resolve from the owning pack. An override scoped to a specific pack takes precedence over the corresponding `uninterface` override.

Mounted and retained views keep their packs ready across language changes. Language activation prepares those packs and any explicit preloads before switching, preserving the visible language if preparation fails. Server-rendered applications preload all core packs by default to keep initial client hydration consistent. Supply matching `preloadCore` lists for server and client when the route's initial dependencies are known.

## Typed application helper

Declare one namespace and key union using [defineUiI18n](../api/functions/defineUiI18n.md). Core supplies descriptor construction and a hook that acquires the current application's translator. The definition can be shared by modules, components and SSR requests; resource registration remains application-owned.

Create `messages/en.ts`:

```ts
export default {
  name: 'Name',
  nameRequired: 'Name is required.',
  services: 'Services',
}
```

Create `i18n.ts`:

```ts
import { defineUiI18n } from '@uninterface/uninterface/i18n'
import type en from './messages/en'

export type AppMessageKey = keyof typeof en
export const { useI18n: useAppI18n, msg: appMessage } =
  defineUiI18n<AppMessageKey>('customer')
```

The type-only pack import avoids loading English resources merely to construct descriptors. Register resources at application startup, using the existing backend assembly described in [getting started](../getting-started.md):

```ts
import { createUiApplication } from '@uninterface/uninterface/setup'
import type { UiMessage } from '@uninterface/uninterface/i18n'
import type { AppMessageKey } from './i18n'
import en from './messages/en'
import App from './App.vue'

const simplified = {
  name: '姓名',
  nameRequired: '请输入姓名。',
  services: '服务',
} satisfies Record<AppMessageKey, UiMessage>

const app = createUiApplication(App, {
  i18n: {
    locale: 'en',
    resources: { customer: { resources: { en, 'zh-Hans': simplified } } },
  },
})
await app.ui.ready
app.mount('#app')
```

In a component, use the generated hook during setup:

```vue
<script setup lang="ts">
import { onUnmounted } from 'vue'
import { createUiEntryControl, createUiFieldControl, UiField, UiTextInput } from '@uninterface/uninterface'
import { useAppI18n } from './i18n'

const { t, lt, msg } = useAppI18n()
const name = createUiFieldControl('', undefined, [
  value => value.trim() ? null : msg('nameRequired'),
])
const categories = createUiEntryControl([
  {
    key: 'services',
    label: lt('services'),
  },
])
onUnmounted(() => categories.dispose())
</script>

<template>
  <UiField :field="name" :label="t('name')">
    <UiTextInput />
  </UiField>
</template>
```

The field belongs to this component's session; the entry control is disposed with that session. Categories illustrate lazy reusable labels and can be supplied to a choice editor. Switching language does not replace either control.

Standalone codecs import the same definition's `msg` under an application-selected alias, without calling a hook:

```ts
import type { UiCodec } from '@uninterface/uninterface'
import { appMessage } from './i18n'

export const nameCodec: UiCodec<string, string> = {
  parse: value => value.trim()
    ? { ok: true, value: value.trim() }
    : { ok: false, issue: appMessage('nameRequired') },
  format: value => value,
}
```

Use this codec when constructing a field that needs its parsing rule. Descriptor creation needs no application, locale or loaded resource; the field's consuming application resolves the issue when displayed. The hook's `msg` has the same behavior as standalone `appMessage`.

`t` returns an immediate string, `lt` returns a lazy `UiTextSource`, and `msg` returns `UiMessageDescriptor`. A string captured once is not reactive; evaluate `t` in rendering/computed bindings when it must follow language changes. Lazy text belongs to supported reusable text definitions; descriptors belong to validation/codec/upload issue contracts. Neither is a substitute for a string-valued component prop. See [text sources](text-sources.md) for the supported inputs and parameter-reference behavior.

All three operations enforce the declared key union at compile time and accept optional string/number parameters. They do not infer required parameter names or prove pack completeness. `msg` does not translate, load resources or validate message existence; missing-key errors occur on `t`, when an `lt` source is read, or when a descriptor is resolved. Definitions own no global locale or control lifetime. `useUiI18n<Key>(namespace)` exposes `msg` alongside `t` and `lt`; no-argument `useUiI18n()` returns the localization control.

Verify invalid keys fail TypeScript, one module-level definition works in two apps with independent locales, and a stored validation issue updates its displayed language without revalidation, draft/baseline changes or session replacement. `msg` is a descriptor-authoring convention with precedent, not a universal standard or a compile-time macro; `lt` is Uninterface's selected lazy-text name.

## Parameters, plurals and formatting

A message is plain text or a typed function. There is no custom interpolation language. Use named parameters and native Intl plural rules:

```ts
const messages = {
  en: {
    count: ({ params, plural, number }) => {
      const count = Number(params.count)
      return `${number(count)} ${plural(count, { one: 'record', other: 'records' })}`
    },
  },
} satisfies Record<string, import('@uninterface/uninterface/i18n').UiMessagePack>
```

Resolve with `i18n.text({ namespace: 'customer', key: 'count', params: { count: 2 } })`. `plural` uses the selected message resource's language; number formatting uses the independently configured formatting locale. `number(value, options)` and `date(value, options)` also exist on the control. Intl options carry explicit currency/time zone facts. No currency is inferred from language; absent time zone uses the platform's Intl default, so specify one when consistent server/client output matters.

For localized decimal editing and exact scaled-integer currency display, see [edit numbers and monetary amounts](number-and-money.md). Supply the formatting locale when creating a numeric codec or formatting money. The codec's issue descriptors resolve using the application's message language.

All messages are text. Do not pass translated HTML to `v-html`. Custom rich content remains an explicit Vue composition. Literal strings are returned unchanged by `text`.

## Validation and editing

Rules and codecs may return an issue as a literal string or a descriptor created by `msg(key, params?)`. The equivalent `{ namespace, key, params? }` object remains valid. Field/form views resolve message descriptors when rendering. Already-visible issues therefore change language without another validation pass. Literal application messages and UiFormSubmissionError general messages stay literal. Submission field issues also accept descriptors. Unexpected exception messages are not displayed automatically.

Changing interface language preserves control lifetime, input drafts, selection and validation state. It does not change parsing/formatting locale. `setFormattingLocale()` is explicit; the application must resolve or defer locale-sensitive unfinished editing before calling it. No automatic reinterpretation of drafts is promised.

## Application content and stable controls

Core and backend resources translate library-owned messages. Applications also register their own namespace for headings, navigation, field labels, help, action feedback and business validation; changing only native control messages leaves an inconsistent interface. Resolve application text while rendering, or through reactive getters. Do not capture translated strings once during setup or use translated labels as entry keys.

For entry controls, core-provided `lt` keeps existing collections, selection and asynchronous branch caches intact:

```ts
const i18n = useUiI18n()
const categories = createUiEntryControl([
  {
    key: 'services',
    label: i18n.lt({ namespace: 'customer', key: 'services' }),
  },
])
```

The application must register `customer.services` in each supported pack. The same `lt` method applies to descriptions and entries returned by asynchronous sources. Use `useUiI18n<AppMessageKey>('customer')` to obtain `{ i18n, t, lt, msg }` with the namespace already bound. A reusable application hook can return this directly; core owns descriptor mapping and deferred translation. It suits application-owned vocabulary; remote business text needs its own localization policy rather than automatic translation. Dispose controls according to their normal lifetime, not when the language changes.

Store semantic keys and parameters for action feedback and resolve them when displayed, so existing feedback can change language too. Use message descriptors for validation issues. Keep user-entered names and business identifiers intact. A backend's native wording stays with its native pack, and a custom literal save error remains the application's responsibility. If no custom save error text is supplied, UiForm uses its localized default failure message.

## Native contexts, documents and isolation

`createUiApplication` internally uses native toolkit contexts where needed. These are integration components, not business-facing styling boundaries or message-pack owners. Components can use localization without UiApp. Do not separately install the toolkit's setup plugin on this app; the integration owns it.

Passing `document` explicitly lets setup maintain that document's `lang` and `dir` and restore original attributes on unmount. Only one app can own a document's language attributes; competing owners are rejected. Embedded applications omit this option and the host owns HTML language boundaries. Native Vue contexts survive teleports; ensure the embedding page's language attributes also describe teleported content appropriately. Direction is propagated to supported native contexts, but complete RTL compatibility is not certified; Arabic layout, shaping and mixed-direction behavior need backend-specific browser acceptance beyond message loading.

Use `ssr: true` with the same explicit `idPrefix` on server and client for server rendering/hydration; await `app.ui.ready` on both sides with the same initial locale/resources. Create one application per request and dispose its services in `finally`. See [application isolation and the verified SSR envelope](application-isolation.md). For applications with an existing localization engine, register message functions/loaders calling that engine and explicitly coordinate the selected locale; an automatic Vue I18n adapter is not included.

## Semantic icons

```vue
<UiIcon name="save" />
<UiIcon name="warning" tone="warning" aria-label="Attention required" />
```

The [catalogue](../api/constants/uiIconNames.md) defines 58 required names. Every backend maps them to its default artwork. `UiEntry.icon` in UiMenu/UiNavMenu uses the same catalogue automatically. UiSelect currently presents text labels; native HTML select options cannot contain this SVG composition. A custom menu icon slot may replace this composition.

Override mappings once at setup:

```ts
import CompanySaveIcon from './CompanySaveIcon.vue'
const app = createUiApplication(App, {
  icons: {
    save: { component: CompanySaveIcon },
    'billing.invoice': { component: InvoiceIcon },
  },
})
```

Prefer `create`/`delete` for resource creation/deletion and `add`/`remove` for membership or association changes. Existing creation uses of `add` remain valid. Removing a pending upload from a queue is removal; deleting a stored file is deletion, even if recoverable. `reset` restores a baseline, `refresh` reloads data, `retry` repeats a failed operation, and `clear` empties a value. `bookmark` means a saved reference; `save` persists edits. `link` uses chain-link artwork for a hyperlink or reference without specifying where it leads. `external-link` uses distinct outward-arrow artwork for an external destination without promising a new window.

Semantic clear artwork should express clearing rather than closing where the icon set permits that distinction. Glyphs, transformations and missing-set adaptations belong in backend documentation. This changes neither close/cancel mappings nor toolkit-owned input clear glyphs.

Shared artwork does not merge meanings or override keys. For example:

```ts
createUiApplication(App, {
  icons: { add: { component: TeamAddIcon } },
})
```

This changes `add` only; `create` keeps the backend default even when both use a plus. Similarly, replacing `delete` leaves `remove` unchanged. Accessible labels still describe the actual operation. The [catalogue](../api/constants/uiIconNames.md) lists every required name; overrides remain independent in separate applications.

`first`/`last` and `previous`/`next` mirror in RTL. Ordering arrows retain their backend meaning and do not mirror automatically. Sets may use simple up/down sorting arrows or explicit ordering marks. Pair sorting artwork with an accessible ordering-state label.

`more-horizontal` is the explicit horizontal alias of `more`; both default to the same three-dot artwork in every backend. They retain independent catalogue keys: overriding one does not change the other. `more-vertical` selects the vertical mark.

An override replaces a complete named definition; other defaults remain intact. Supply a complete alternative mapping to replace the set. Vue components can render SVG, font artwork or multicolor variants. Supply `mirrorInRtl: true` only for logical directional symbols. A `tones` map selects authored component variants and rejects unsupported explicit tones; without it, monochrome artwork uses the backend's theme foreground. Omitted tone inherits surrounding foreground for monochrome artwork and preserves authored multicolor colors. Icon names do not imply color.

UiIcon fits proportional artwork into a square that follows the surrounding text size by default. Use [UiIcon's size prop](../api/components/UiIcon.md) when the icon needs a specific side length. The parent owns spacing and alignment. Decorative icons are hidden from assistive technology. Give a meaningful standalone icon an `aria-label` and give an icon-only button its own action name.

Backend authors should follow the [artwork selection principles](../contracts/icon.md#backend-artwork-selection), including native-first mappings, documented adaptations and visual acceptance. `menu-item` is the generic entry icon. It shares default page artwork with `file`, with independent overrides.

Native internal glyphs retain their native defaults. Catalogue overrides cover UiIcon and application entry icons; they do not currently rewrite toolkit-internal close buttons, checks or disclosure indicators. Native APIs can be used by a specialized backend where required, without DOM/CSS replacement tricks.

`arrow-up`, `arrow-down`, `arrow-left` and `arrow-right` depict physical directions with shafted arrows. They retain their direction in RTL. Use `previous`/`next` for navigation that follows reading direction, and `move-up`/`move-down` for reordering a vertical list. The move names share the default `arrow-up`/`arrow-down` artwork. Applications may override each name independently.

The shipped catalogue is an explicit 58-name subset, with local artwork and license notices. Setup currently includes that bounded subset; it is not a claim of individual-icon elimination from a dynamic catalogue. It does not import complete vendor icon libraries or contact an icon service. Ordinary component-only imports do not pull in catalogue setup.

### SVG files

Core provides an optional Vite loader for application-owned SVG files. Use it when you want catalogue artwork in `.svg` assets without writing Vue wrapper components. It renders SVG inline, so theme foreground and requested tones can reach `currentColor`; an SVG image URL does not provide that inheritance.

Add the loader alongside your existing Vue and backend build plugins:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createUiIconLoader } from '@uninterface/uninterface/vite'

export default defineConfig({
  plugins: [createUiIconLoader(), vue()],
})
```

Declare the imports in a TypeScript declaration file included by your project:

```ts
// svg.d.ts
/// <reference types="@uninterface/uninterface/vite/client" />
```

Register imported artwork in application setup:

```ts
import { createUiApplication } from '@uninterface/uninterface/setup'
import FlaskIcon from './icons/flask.svg?ui-icon'
import App from './App.vue'

const app = createUiApplication(App, {
  icons: { 'demo.flask': { component: FlaskIcon } },
})
```

Business compositions use `<UiIcon name="demo.flask" />`; they do not import the loader or asset. The same compiled SVG can be used in a `tones` map for an authored variant. Existing Vue component artwork continues to work without this loader.

Applications own the source, license, name and complete catalogue definition. Supply static, self-contained SVG with one `svg` root, `viewBox` and proportional scaling. Use `currentColor` for foreground inheritance; authored multicolor values stay intact. Core owns compilation and client/server render output, while UiIcon and the backend retain their accessibility, square occupancy and tone responsibilities. The loader watches imported files in development and leaves unrelated SVG URL/raw imports alone. It does not rewrite fragment IDs or embed external resources. Vue directives/expressions and malformed roots are build errors. Assets are trusted application source; this is not a sanitizer for user-provided content.

Verify that the asset renders as inline SVG through UiIcon and entry icons, follows inherited foreground, preserves authored colors and local references, switches declared variants, retains accessible naming and focusability, and mirrors only when requested. Server-rendered markup should hydrate using the same catalogue. DOM assertions establish markup and wiring; visual/assistive-technology acceptance remains separate. See [createUiIconLoader](../api/functions/createUiIconLoader.md) for its Vite requirement and exact import behavior.

## Verification

Verify that locale aliases and script-safe fallback choose compatible resources; failed or superseded loads retain the appropriate active language; message functions use the selected pack; and resources/overrides remain isolated per application. Change language with existing validation feedback and selected entries to verify that labels update without resetting their state. Native resources must follow the same committed language selection.

Inspect icon overrides, optional tones, square occupancy and directional mirroring in a browser. Change languages with a field error and a selected async candidate already visible. Verify that both labels update without clearing the draft or reloading candidates. Visual quality, full RTL behavior and assistive-technology support require separate acceptance evidence.

For dynamic text in reusable definitions, use [UiTextSource and the text-source practice](text-sources.md). Keep stable identities independent of labels; ordinary component text props continue to use Vue bindings.
