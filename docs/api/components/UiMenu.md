# UiMenu

Presents commands and selectable choices from a shared entry control. Import from `@uninterface/uninterface`; requires application localization for statuses and backend capability `menu.v1`.

```vue
<UiMenu :control="commands" mode="popup" aria-label="Record commands" @activate="runCommand">
  <template #host="{ buttonTrigger }">
    <UiButton v-bind="buttonTrigger">Record commands</UiButton>
  </template>
</UiMenu>
```

## Properties

| Property | Type | Default | Meaning |
|---|---|---|---|
| `control` | `UiEntryControl` | Required | Entries, source state and optional selection scopes |
| `aria-label` | `string` | Required | Nonempty accessible name for the menu |
| `mode` | `'inline' \| 'popup'` | `'inline'` | Root menu participates in content flow or appears as a floating surface |

Inline displays the root collection directly. Popup requires a `host` slot. The menu supplies no automatic button or context-target element. Mode describes presentation only; it does not choose invocation or attachment. Submenus open attached floating surfaces in either mode. Backend presentation decides their concrete placement and viewport adaptation; no business offsets or numeric stacking values are exposed.

## Host integration

The `host` slot receives [UiMenuHostBindings](../types/UiMenuHostBindings.md). The surrounding composition renders its own elements and applies the relevant bindings through `v-bind`:

- `buttonTrigger` opens/toggles the popup from an actual button and supplies its accessibility state. Use UiButton or a native button with type="button".
- `contextTrigger` requests the same popup through right-click, ContextMenu or Shift+F10 and supplies a named, focusable group. Use an appropriate native content element. Pair it with a visible trigger for touch/pointer discoverability.

```vue
<UiMenu :control="commands" mode="popup" aria-label="Record commands">
  <template #host="{ buttonTrigger, contextTrigger }">
    <UiButton v-bind="buttonTrigger">Record commands</UiButton>
    <div v-bind="contextTrigger"><RecordPreview /></div>
  </template>
</UiMenu>
```

Both bindings refer to one popup session. Their handlers receive the actual DOM event: currentTarget supplies the anchor and focus-return destination, and contextual pointer invocation supplies the location. A keyboard request anchors to the context target itself. When viewport resizing puts a pointer invocation point outside the window, constrain the effective point to the current viewport and recalculate popup placement so commands remain reachable. Supporting backends apply this rule while retaining the original point, open state and focus; expanding can restore the original anchor. Native backend logic still owns final placement, flipping and sizing. Its consumed shortcut and any resulting native context-menu event must not open a second browser menu after focus moves into the popup. This suppression is scoped to that invocation and popup family; unrelated context menus retain their native behavior. Ordinary authors specify no coordinates, offsets or placement algorithm. Do not replace binding-owned handlers/ARIA state or forward synthetic events lacking a rendered currentTarget. Apply context bindings to a suitable content group, not a nested interactive button. Independently interactive descendants keep their ordinary behavior except a contextual request bubbled to the bound group. The host slot is invalid with inline mode. No default or trigger-content slot is provided.

## Interaction and ownership

`activate(key: string)` reports eligible ordinary item activation after applying any selection scope. Submenu opening emits no activation. Actions close popup sessions; scoped selection keeps them open. Escape closes the nearest submenu or root popup and returns focus; outside interaction dismisses floating surfaces. Arrow/Home/End/type-ahead operate command menus; Tab retains document navigation and closes a root popup. Disabled commands cannot activate.

Each view maintains its own open/submenu session. Closing a popup resets its open submenus. Supplied control lifetime and selection remain business-owned; view unmounting does not dispose it. Initial loading is requested automatically, with pending/error/empty states and retry. KeepAlive deactivation closes floating surfaces and releases global listeners without focusing inactive content; reactivation leaves popups closed while retaining control state.

The included backends show a text-style **Retry** button with localized failure feedback. It participates in command-menu keyboard navigation and reloads the failed collection in place.

`entry({ entry })` and `icon({ entry, icon })` slots render non-interactive entry content and resolve semantic icons. Entry slot overrides entry.render; both fall back to the text label. Declared icons use UiIcon and the application catalogue by default; the optional icon slot overrides that rendering. There are no exposed imperative methods or externally controlled open-state props.

## Backend responsibilities and verification

Core owns eligibility, activation, selection, source state and open/submenu state. Backends generate host bindings, derive anchors from actual events, render surfaces, place them within the viewport, and manage focus and listener cleanup. They must not create a competing selection/source model. Toolkit treatments, top-layer integration and anchoring mechanisms are private backend details.

Verify host-authored UiButton/native targets, matching expanded/control attributes, independent sessions sharing selection, lazy submenus, disabled actions, contextual pointer/keyboard requests, dismissal/focus return and cleanup. Real-browser tests must verify submenu overlays do not enlarge their parent, navbar height remains stable, popup bounds, RTL and Tab behavior. DOM simulation cannot establish geometry or visual quality.

Floating surfaces may use native browser facilities or toolkit overlays. Backend setup documents required browser APIs; no hosting mechanism or fixed numeric z-index is part of the business contract. General mobile stacked-submenu navigation and hover opening are not implemented; reference submenus use keyboard/click opening and viewport-clamped, direction-aware placement.

Native toolkit menu components may supply item, submenu and keyboard presentation. Core owns source state and selection scopes; the backend translates them rather than replacing native features with styled imitation elements. Where the toolkit lacks async menus, the backend adds status and retry presentation. Generated core loading wording is a fallback; native loading wording and localization take precedence when available.

Mixed icon entries align labels within each vertical level or popup surface: if any sibling (including entries within groups) has an icon, all siblings receive the same leading column. Missing icons leave empty, aria-hidden space; all-icon-free surfaces omit it. Submenus establish their own columns. Horizontal navigation retains per-item icon/label spacing. Authors supply no placeholder icons or spacing; native dimensions and RTL placement remain backend-owned. See the [navigation menu guide](../../guides/navigation-menus.md#presentation).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.

The outward declaration concerns the host/trigger composition. Its owned popup is separately registered in the owning Surface’s Floating layer; moving the host does not change that automatic attachment.
