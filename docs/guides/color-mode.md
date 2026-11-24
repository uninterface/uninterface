# Application color mode

Color mode is application UI state, separate from language resources, theme color roles and UiApp's frame. Business components inherit it. Backends declaring `theme.color-mode.v1` translate the shared policy into native document styling, including teleported surfaces; they must not start an independent toolkit preference controller.

## Own the document explicitly

```ts
import { createUiApplication } from '@uninterface/uninterface/setup'

const app = createUiApplication(App, {
  requires: ['theme.color-mode.v1'],
  colorMode: {
    document,
    // Optional; omit to avoid storing preferences.
    storageKey: 'my-app-appearance',
  },
})
await app.ui.ready
app.mount('#app')
```

The default preference is system. An explicitly supplied `preference` takes precedence over stored data; otherwise a valid saved light/dark/system value is used. System changes affect only system preference. Storage is opt-in and best effort, with same-key cross-tab changes observed. No process-global preference store is used.

In a Vue component, `useUiColorMode()` exposes readonly `state` and `setPreference()`. Offer Light, Dark and System choices using ordinary Uninterface fields and controls. Labels belong to application translations. No business component toggles toolkit classes or supplies per-control mode props. Theme palettes, transitions, focus styles and native loading presentation stay with the backend.

The integration updates the backend's native document selector and `color-scheme` before mounting. The selector covers descendants and body-level popups together. Unmount restores the original owned selector and inline color-scheme, removes media/storage listeners and preserves unrelated classes. A second concurrent owner throws; embedded consumers never claim ownership. For abandoned applications that never mount, call `app.ui.dispose()`; on a mounted application use `app.unmount()`.

## Inherit a host

Omit `colorMode` in a browser to observe the current document, or pass `{ colorMode: { host: hostDocument } }`. Existing native mode is honored immediately; without an explicit selector, the backend’s documented ordinary policy applies (including system appearance where supported); later selector changes update the shared state. Hosted mounting and teardown never reset the host selector or consult a private preference store. Inherited controls reject `setPreference`: ask the host owner to make changes.

Alternatively pass `{ colorMode: { inherit: hostApp.ui.colorMode } }` when coordinating through a host control. The host must also manage the same document's native mode. This shares state, not stylesheet injection across documents or iframes. Different documents may have independent owners. Independently themed applications within one document are not supported by this initial contract.

## Server rendering and first paint

Create one app per server request, with `ssr: true`, an explicit stable `idPrefix`, no browser document and an explicit preference or `initialMode` matching the server's known preference. The controller does not read global browser state on the server. The HTML renderer must emit the native selector and matching stylesheet; the backend documents that selector. The core does not rewrite server HTML.

Hydration must begin with the same resolved mode as SSR, especially if components render mode-dependent content. Supply that explicit preference on the client until mounting completes, then opt into system or persisted policy. A system preference resolved before hydration can differ from a server fallback; Uninterface does not pretend those are equal. Client-only applications apply mode before mount, but avoiding a light flash before JavaScript loads requires a server- or host-authored initial selector. No automatic inline script or cookie policy is injected.

## Backend and acceptance obligations

A supporting backend exports a `colorMode` native selector in its integration and declares `theme.color-mode.v1`. Its document typography and palette must cover ordinary content, nested compositions, open menus, nested submenus and selection popups. Add dialogs to the same acceptance when that component exists. Applying a class to UiApp alone is insufficient. Unsupported backends reject explicit color-mode options rather than silently pretending to switch.

Verify explicit light/dark, persisted preference, live system changes, inherited host mode, late mounts, reopening overlays, light restoration, listener cleanup and rejected competing owners. Verify actual computed backgrounds/foregrounds, text contrast, keyboard focus, reduced-motion treatment and draft/selection retention in a real browser. Class assertions and DOM simulations establish propagation but cannot establish visual or accessibility conformance. The shared tests provide reusable scenarios; backend documentation states verification limits.


Backends declaring color-mode support integrate the shared API. Native selectors and theme-service coordination are assembly details documented by each backend; business components use the shared controller. Explicit host selectors take precedence over supported system-following defaults. Browser verification remains required for surfaces, popups and appearance.

For request cleanup, identity and the verified hydration baseline, see [application isolation](application-isolation.md).
