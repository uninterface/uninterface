# UiTab

Declares one tab trigger inside [UiTabs](UiTabs.md). Import from `@uninterface/uninterface`.

| Prop | Meaning |
|---|---|
| `value: string` | Required stable, nonempty key, unique within the bar |
| `disabled: boolean` | Default false; prevents user activation without erasing selection or panel contents |

The **default slot is the label**. It receives `{ selected, disabled }` observations and accepts noninteractive content such as text, icons and passive badges. There is no label prop, named label slot or panel content here.

```vue
<UiTab value="issues">Issues <UiBadge>{{ issueCount }}</UiBadge></UiTab>
```

Supply meaningful accessible text. `aria-label` may name an icon-only tab. Avoid nested buttons, links, inputs or independent focus targets. Close actions require a separately defined workspace-tab interaction contract and are not supported. The backend supplies the actual interactive element, indicator, focus and native typography. Core consumes this logical declaration rather than mounting an extra component wrapper; it has no imperative instance or backend UiTab.vue module.

Use direct children, fragments or v-for under UiTabs. Keep value stable when translating or editing the label. Pair the value with `tabs.bindings.panel(value)` on a separately placed UiTabPanel. Verify accessible names, slot updates, disabled behavior and identity after reordering.

## Stacking

`zOrder?: UiZOrder` describes outward stacking. The declaration host projects this identity onto its rendered tab or breadcrumb target. See [dynamic stacking](../../guides/dynamic-z-order.md) for scope, lifetime, pending refs and observable overlap checks. Core owns order; the backend owns rendering targets.

Declaration refs expose a stable stacking identity (`zHandle`), not a mounted component DOM API. Their ordering parent/layer belongs to the declaration host and cannot be overridden.
