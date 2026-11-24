# UiCollapsible

A labeled expandable content region. Import from `@uninterface/uninterface`. Expansion belongs either to the caller's boolean v-model or to a target-specific binding. It does not imply a document heading or a visually joined accordion group.

| Prop | Default | Meaning |
|---|---|---|
| `label?: string` | — | Nonempty visible toggle text when no summary slot is supplied |
| `modelValue?: boolean` | — | Required for standalone controlled use; use v-model |
| `binding?: UiCollapsibleBinding` | — | Alternative owner of expansion and user request routing |
| `disabled?: boolean` | false | Prevent user toggling; can only tighten binding availability |
| `lazy?: boolean` | false | Defer first content mount until expanded |
| `color?: UiThemeColor` | — | Optional semantic color request; ignored when the backend does not support collapsible color |

Provide either v-model or binding. Combining a binding with modelValue or an update:modelValue listener is an error. The standalone update:modelValue event requests a boolean state; an owner may decline it by leaving the value unchanged. A bound component routes requests only through the binding. Programmatic owner changes remain effective when the view is disabled, including automatic collapse when another key opens.

Color is optional presentation. Omission retains native defaults. A backend declaring `collapsible.color.v1` consumes the installed theme's semantic roles; supported backends validate the requested role normally. Without that capability, core ignores the color request before theme support validation and passes no effective color to the view. This also prevents undeclared native color attributes from accidentally selecting backend-specific behavior. There is no fallback to another role, expansion policy, or validation state.

Concrete color mappings and support are documented by the selected backend.

Color treatment and which states show it belong to the backend. Summary badges and nested controls keep their own explicit color requests. For example, `<UiCollapsible v-model="expanded" label="Delivery" color="info">…</UiCollapsible>` is valid on every backend; it does not guarantee a visible color difference on every backend. An application needing guaranteed support can explicitly require `collapsible.color.v1` in its capability requirements. See [theme colors](../../guides/theme-colors.md).

The default slot supplies expandable content. The optional summary slot replaces visible label text and receives read-only `{ expanded, disabled }` values. It lives inside the backend-owned toggle: use meaningful text, icons and passive badges. Do not nest buttons, links, inputs or other interactive widgets inside it. The rendered summary supplies the accessible name; label is a fallback, not an aria-label masking rich summary content. A slot must produce meaningful text even when its output is an opaque business component.

```vue
<UiCollapsible v-model="expanded" lazy>
  <template #summary>
    <span>Billing information</span>
    <UiBadge color="warning">Incomplete</UiBadge>
  </template>
  <BillingInformation />
</UiCollapsible>
```

Root attributes/listeners target the backend's root wrapper. No imperative handle or headingLevel prop is provided. The backend supplies the operable toggle, expansion indicator, focus treatment, accessible expanded/content associations and native motion. Native summary elements or role=button elements are valid adaptations; consumers should not depend on one DOM tag.

Collapsed content is hidden from interaction and retained after mounting. Lazy content remains mounted after its first expansion. Native exit motion may briefly display the closing surface, but its content is already inert. Hiding never disposes controls or suspends validation, timers or business work. Reveal a section and await Vue rendering before focusing an invalid field. If business code hides currently focused content, it must restore focus to a meaningful visible destination.

Core owns request validation and retention; backends adapt native presentation without a competing expansion owner. Strategy target `collapsible`; backend capability `collapsible.v1`; bindings use core `collapsible.binding.v1`. See [UiCollapsibleBinding](../types/UiCollapsibleBinding.md), [createUiExpansionControl](../functions/createUiExpansionControl.md) and the [panels guide](../../guides/panels.md).

Verify controlled denial, disabled and live owner changes, summary naming/scoped state, no implicit headings, lazy mounting, retained draft identity, binding conflicts, multiple-view synchronization and owner disposal. Browser checks must verify Enter/Space, hidden-focus exclusion, native motion, narrow/RTL layouts and visible focus.

## Stacking

`zOrder?: UiZOrder` requests outward stacking. See [dynamic stacking](../../guides/dynamic-z-order.md) for identity, scope, lifetime, backend rendering obligations and overlap checks.
