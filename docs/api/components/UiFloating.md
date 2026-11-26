# UiFloating

A viewport-attached host for supplementary actions, normally one ordinary button. Import from `@uninterface/uninterface`; requires `floating.v1`. See [floating panels](../../guides/floating-panels.md).

| Input | Default | Meaning |
| --- | --- | --- |
| `edge?: UiDrawerEdge` | `end` | Configured attachment and snap destination: start/end/top/bottom. |
| `draggable?: boolean` | `false` | Enable user repositioning and its keyboard/tap alternatives. |
| `hidden?: boolean` | `false` | Hide the floating host and suspend movement while retaining its content and position. |
| `initialPosition?: number` | `0.5` | Initial local preference in [0, 1], read on mount. |
| `position?: number` | Unspecified | Controlled preference, taking precedence over local state. |
| `zOrder?: UiZOrder` | Owning Surface's Floating layer | Standard shared ordering declaration, never a numeric CSS rank. |

The default slot supplies one floating unit, potentially a composition. UiFloating contributes no normal-flow allocation and no button action or expansion owner. A UiButton is optional. A custom clickable icon host must supply its accessible name, action semantics, keyboard activation, visible focus and disabled behavior where applicable; an image role and click listener alone do not supply those interactions. An icon-only UiButton provides these behaviors when given an accessible name. Attributes reach the actual floating host.

For start/end, position zero is top and one is bottom. For top/bottom, zero is logical start and one is logical end. End is right in LTR and left in RTL. Position describes available travel after accounting for the unit's size, backend clearance and platform safe areas. A viewport clamp preserves the remembered preference. Keep floating content small enough to fit the viewport.

`update:position` requests a committed preference after a completed drag or alternative movement. Without position, the component also updates its local preference. With position, the owner may decline by retaining its value. Pointer movement is transient; release snaps to the configured edge. Cancellation restores the committed position. A drag must not activate its button. Changing edge preserves the normalized preference; changing initialPosition after mount does not reset it. Preferences last for the mount, including KeepAlive retention; persistence across remounts belongs to the application.

When draggable, Alt+arrow along the edge moves by 0.02; Shift increases the step to 0.1. Context menu, Shift+F10, the ContextMenu key or a touch hold opens a named range control for click/tap movement. Escape or its close action dismisses that control and restores focus. Movement instructions are localized. Normal button activation remains unchanged.

A directly supplied icon UiButton receives the backend's standalone launcher surface, target and artwork sizing so it remains visible over page content. Other floating compositions keep their own presentation; normal icon buttons elsewhere are unaffected. Exact dimensions and surface styling are backend-owned.

Use `hidden` to temporarily remove a launcher from display and keyboard navigation,
for example while its associated docked panel is open. The host stays mounted,
preserving the trigger association and position for reopening and focus return.
Hiding also dismisses its movement editor and cancels an in-progress drag.

## Use as a panel launcher

A floating launcher can remain available while supplementary settings are closed,
then hide when opening those settings makes the launcher redundant. The enclosing
composition owns expansion and chooses this visibility policy. UiFloating supplies
the `hidden` behavior; UiDrawer supplies expansion, dismissal and focus return.
The relationship is explicitly composed rather than automatically inferred.

This example hides the launcher while the desktop docked drawer is open and keeps
it available for the mobile nonblocking panel. It assumes the normal core/backend
application setup; see [floating panels](../../guides/floating-panels.md) for
allocation and bounded-height requirements.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  UiButton, UiDrawer, UiDrawerLayout, UiFloating, UiIcon,
  useUiResponsive,
} from '@uninterface/uninterface'

const expanded = ref(false)
const { context } = useUiResponsive()
</script>

<template>
  <UiDrawerLayout>
    <template #main><slot /></template>
    <template #drawer>
      <UiDrawer
        :mode="context === 'mobile' ? 'panel' : 'docked'"
        v-model:expanded="expanded"
        title="Workspace settings"
      >
        <template #host="{ buttonTrigger }">
          <UiFloating
            :hidden="expanded && context !== 'mobile'"
            edge="end"
            draggable
          >
            <UiButton v-bind="buttonTrigger" variant="icon" color="primary">
              <template #icon><UiIcon name="settings" /></template>
              Workspace settings
            </UiButton>
          </UiFloating>
        </template>
        <slot name="settings" />
      </UiDrawer>
    </template>
  </UiDrawerLayout>
</template>
```

Retain an accessible close mechanism while the launcher is hidden. UiDrawer's
default Close action and Escape handling supply this in the example. Forward
`buttonTrigger` to the actual button so its association and keyboard behavior
remain intact. Keep the floating host and button mounted: binding `hidden`
preserves their identity and the remembered position. Closing makes the launcher
available again and lets the drawer restore focus when appropriate. Supply
localized names in production.

The mobile visibility choice is application policy. Use `:hidden="expanded"`
when the launcher should disappear while either drawer mode is open. Verify
keyboard opening, launcher absence from display and Tab navigation while hidden,
Close/Escape operation, focus return and retained position after reopening.

## Implementation and verification

Core owns preference validation, active lifetime, strategy role `floating` and shared stacking. Backend views own markup, focus, geometry, hit targets, safe-area/visual-viewport updates and movement presentation. The host stays inside its logical Surface: a page launcher cannot overtake a later modal Surface. Backends register the actual floating root without independent counters or top-layer promotion. Ordinary SSR renders the host without browser geometry; client mount activates placement.

Verify LTR/RTL and all four edges, click versus drag, pointer cancellation, controlled denial, keyboard/range movement, viewport and unit resizing, zoom/keyboard bounds, modal ordering and cleanup on deactivation/unmount. DOM checks establish wiring; browser geometry and assistive-technology acceptance are separate.
