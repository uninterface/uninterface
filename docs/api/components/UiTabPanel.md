# UiTabPanel

A separately placed, retained content boundary coordinated with a tab bar. Import from `@uninterface/uninterface`.

| Prop | Default | Meaning |
|---|---|---|
| `binding: UiTabPanelBinding` | Required | Stable owner/key association, normally `tabs.bindings.panel('details')` |
| `lazy: boolean` | false | Defer only the first content mount until selected |
| `height` | `content` | `content` follows content; `full` fills a definite parent allocation |

The default slot is ordinary business content. No business v-if/v-show or visibility prop is required. Core derives selection from the shared binding. The backend renders a named, focusable tabpanel, pairs it with the trigger, and applies hidden/inert while inactive. Hidden panels do not occupy layout space. Once mounted, content remains mounted, including when lazy changes from false to true. Removing the panel or its keyed business composition unmounts it. Retention does not suspend validation, timers or background work, and never disposes external controls.

Panel boundaries must exist for each tab declaration, even before lazy content mounts. Each boundary uses one stable binding; replacing it requires a keyed remount. Put multiple panel boundaries inside one ordinary container when they should share one allocation. Do not give each hidden panel a separate UiLayout allocation: layout wrappers would reserve separate tracks.

`height="full"` requires the embedding owner to establish a definite height. It neither invents a height nor measures inactive panels. Use an inner `UiLayout height="full" scroll="vertical" aria-label="…"` for scrolling. Content-height panels clear inherited available-height context; full-height panels pass through the offered context. Frames, spacing and content insets belong to the surrounding composition.

When selection hides a panel that contains focus, the backend returns focus to the selected trigger unless the business operation has already moved it elsewhere. Ordinary switching does not steal focus from another visible destination. To focus an editor, select its panel, await Vue nextTick, then call the editor's focus handle. Owner-controlled focus recovery is required when removing an entire composition.

Verify retained input identity/value, lazy mount count, eager-to-lazy changes, reciprocal ARIA associations, no focusable inactive content and focus recovery. Browser checks must verify fixed allocation, scrolling, visibility and inert behavior. See [panels](../../guides/panels.md).

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
