# UiTabs

Presents an in-page tab bar. Content is declared separately with [UiTabPanel](UiTabPanel.md), and selection is coordinated through a [UiTabsBinding](../types/UiTabsBinding.md). Import from `@uninterface/uninterface`.

| Prop | Meaning |
|---|---|
| `binding: UiTabsBinding` | Required, stable selection owner and association identity |
| `aria-label: string` | Required nonempty accessible name for the tablist |
| `orientation` | `horizontal` (default) or `vertical`; controls tab-bar arrangement and arrow keys |

The default slot contains [UiTab](UiTab.md) declarations. Fragments, `v-for`, and conditional declarations are supported. Declarations must be direct; opaque business components cannot hide declarations from the bar. Wrap an entire tab composition in a business component instead. Panel contents remain opaque business components and can be placed outside the bar in the owner's layout.

There is no content slot, items prop, v-model, or imperative component handle. Attributes on UiTabs target its outer element; aria-label names the actual tablist. Each declaration uses a unique nonempty string value. Selected must identify a declared tab. When removing it, select its replacement in the same Vue update. Keep one panel boundary per declared value, including lazy panels; missing/duplicate associations are errors after mounting or updating. One binding supports one mounted bar. Changing its binding requires a keyed remount.

Activation is manual: arrows/Home/End move focus, while Enter/Space or pointer activation requests selection. Horizontal arrows honor rendered direction. Disabled tabs are skipped. A selected tab becoming disabled keeps its panel; owner-driven selection may reveal a disabled tab. Only accepted binding state changes the selected header and visible panel.

Core interprets declarations, validates associations and routes requests. Backends own native tab components/markup, indicators, overflow, focus and theme treatment. Strategy target `tabs`; capability `tabs.v1`. This is not route navigation or a closable workspace-tab system. See [the panels guide](../../guides/panels.md) for complete composition, control lifetime, and sizing examples.

Verify rich labels, native selected presentation, controlled denial, keyboard/RTL/vertical movement, live label updates and keyed reordering/removal. DOM tests do not establish overflow geometry or visible-focus quality; test those in a browser for each selected backend.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
