# Application identity, isolation and server rendering

Each `createUiApplication` owns its localization controller, icon catalogue and native integration. Create separate business sessions when applications or requests must edit independently. Sharing an actual control remains a deliberate business decision; application setup does not clone externally supplied controls or take over their lifetime.

## Identity within a document

Client-only applications receive automatic ID prefixes. An optional `idPrefix` supplies an application-owned namespace:

```ts
const app = createUiApplication(App, { idPrefix: 'billing' })
await app.ui.ready
app.mount('#billing')
```

A prefix starts with a letter and otherwise contains letters, digits, underscores or hyphens. Setup assigns Vue's `app.config.idPrefix`; Vue configuration can change it before the first render/mount, but it must remain fixed for that application's lifetime. Two mounted applications cannot claim the same prefix in one document. Unmount releases the claim. Application-authored HTML IDs must also be unique; the library cannot namespace arbitrary HTML or third-party components that ignore Vue's application identity.

With `ssr: true`, `idPrefix` is required. Use the **same prefix on server and client**, and different prefixes for application roots sharing a document. Reusing `billing` in unrelated HTTP responses is safe. Do not derive SSR prefixes from process-global request counters or random client values.

## Document responsibilities

Passing `document` claims exclusive ownership of that document's `lang` and `dir`. A second concurrent owner fails during setup. Embedded apps omit this option and keep their own translations; the host supplies language boundaries for their content, including teleports. Disposal restores original attributes and releases the lease.

`colorMode.document` separately owns the document's native appearance selector. Other apps inherit it; independent simultaneous color modes inside one document are unsupported. Language and appearance may have different owners. See [color mode](color-mode.md).

## Cleanup and initialization failure

Use `app.unmount()` for a mounted app. Use `app.ui.dispose()` for an abandoned, failed-to-initialize or server-rendered app. Await `app.ui.ready` before rendering/mounting; if readiness rejects, still dispose the app, normally in `finally`.

Disposal attempts every registered release even if a backend release throws. A single cleanup error is rethrown; multiple errors produce an `AggregateError`. Repeated disposal does not rerun releases. Synchronous setup failure rolls back acquired services. If rollback also fails, the aggregate's `cause` and first error retain the original setup failure. Backend factories must clean up resources they allocate but never return, including when their own `create` throws.

Application disposal releases application services. Business sessions, application-plugin resources and pending persistence operations retain their own owners. Disposing a UI does not cancel or roll back an external save.

## Server request recipe

Construct a fresh app and business session per request. Both require explicit cleanup: component `onUnmounted` hooks do not run during server rendering. A business session factory can encapsulate fields/codecs/validation and supply its documented interface to its borrowing component:

```ts
import { renderToString } from 'vue/server-renderer'
import { h } from 'vue'
import { createUiApplication, type UiApplication } from '@uninterface/uninterface/setup'
import Editor from './Editor.vue'
import { createEditorSession } from './editor-session'

async function renderEditor(record, locale, mode) {
  const session = createEditorSession(record)
  let app: UiApplication | undefined
  try {
    app = createUiApplication(
      { render: () => h(Editor, { session }) },
      {
        ssr: true,
        idPrefix: 'editor',
        i18n: { locale },
        colorMode: { preference: mode },
      },
    )
    await app.ui.ready
    const context = {}
    const html = await renderToString(app, context)
    return { html, context }
  } finally {
    try { session.dispose() } finally { app?.ui.dispose() }
  }
}
```

The host renderer supplies the HTML document, matching native color selector, styles and safely serialized initial business data. Insert Vue's `context.teleports` output into the corresponding document hosts before hydration. Backend hosts may have generated IDs; preserve their selectors and empty teleport anchors.

Hydration creates a **new client session** from the same initial data, locale, mode and ID prefix. Use `ssr: true`, await readiness, then mount onto the rendered root. The client can explicitly own `document` and `colorMode.document`; the server must not access a browser document. Start with matching mode and responsive context, then enable environment-dependent changes after hydration. Register client session cleanup with its actual owner, for example `app.onUnmount(() => session.dispose())`.

## Supported envelope and acceptance

The verified server/hydration baseline is a request-owned form with text and multiline inputs, a checkbox, validation, submit/reset buttons, icons, linear layout, application/native localization and explicit initial light/dark mode. It covers concurrent requests, repeatable output, unique IDs, initial values, hydration without mismatches, retained input nodes, editing, validation, saving, reset and disposal. Install the backend's documented build integration on server and client.

This baseline does not establish SSR support for every component or strategy combination. Open menus/popups, server-side selection loading, complex responsive changes, streaming, partial hydration and arbitrary cross-document mounting remain outside the verified envelope. Backend field arrangements can settle into native integrated label/feedback presentation after mount while preserving editor identity. Browser layout, visible focus and assistive-technology acceptance remain separate from DOM hydration verification.

Verify two mounted apps with distinct label/feedback targets; changing one app's locale/draft without changing the other; unmounting one while continuing to use the other; rejected competing document owners; and replacement setup after an injected native cleanup failure. SSR acceptance must exercise actual fields and subsequent editing, not only successful string rendering.
