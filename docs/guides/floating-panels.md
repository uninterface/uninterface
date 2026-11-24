# Floating launchers and resizable panels

Use UiFloating to keep a supplementary action available while its content is hidden. Use UiDrawer to present that content, and UiDrawerLayout when it should reserve room beside the main interface. These are separate responsibilities: floating owns placement, the drawer owns expansion/extent, and the layout owns the resulting allocation. Business forms and saved values keep their existing owners.

## Compose the panel

Assume the application's normal core/backend setup is installed. This complete composition uses the built-in desktop/mobile vocabulary; an application with a custom responsive profile supplies its own context policy.

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
  <UiDrawerLayout :min-main-extent="160">
    <template #main>
      <slot name="main" />
    </template>
    <template #drawer>
      <UiDrawer
        :mode="context === 'mobile' ? 'panel' : 'docked'"
        v-model:expanded="expanded"
        title="Workspace options"
        preferred-extent="24rem"
        max-extent="70%"
        resizable
        resize-label="Options width"
      >
        <template #host="{ buttonTrigger }">
          <UiFloating edge="end" draggable>
            <UiButton v-bind="buttonTrigger" variant="icon" color="primary">
              <template #icon><UiIcon name="settings" /></template>
              Workspace options
            </UiButton>
          </UiFloating>
        </template>
        <slot name="options" />
      </UiDrawer>
    </template>
  </UiDrawerLayout>
</template>
```

The panel starts hidden. Desktop expansion squeezes the main allocation; mobile expansion overlays it without blocking background use. Changing that mode preserves the same mounted content, drafts, expansion owner and meaningful focus. A separate overlay extent memory prevents a narrow mobile clamp from overwriting the docked preference. The library does not detect mobile inside a drawer or silently choose a different mode. Select a useful minimum main allocation and an overlay policy for insufficient space. For top/bottom docking or bounded internal scrolling, use height="full" in a parent with a definite height.

Place the drawer host around the entire area that should yield. For a workspace below a retained application header, give the outer vertical UiRegionLayout full height, put the header in start and a full-height UiDrawerLayout in main. Inside the drawer host's main slot, use a full-height scrolling UiContent containing the page introduction, business content and footer. Keep content insets inside that scrollport. This gives the docked panel the full remaining height and lets main and panel content scroll independently. A host inside a form or a content-sized scroll item only displaces that local section.

A direct icon UiButton in UiFloating receives a visible backend-themed surface and a larger target/artwork suitable for an isolated launcher. Normal toolbar icon buttons retain their native treatment. Exact geometry, colors and shape belong to the backend; the author supplies the named button and icon without CSS tuning.

Ordinary clicks toggle the bound drawer. A composition can bind UiFloating hidden to the expansion state when its launcher should disappear while the drawer is open. Keep an accessible close action in the drawer; hiding retains the launcher so closing can restore focus and its remembered position. Dragging the launcher moves only its host and snaps to its configured logical edge on release. Alt+arrow along the edge and the context-menu/touch-hold range editor provide alternatives. A controlled v-model:position can remember placement elsewhere; it is optional. Supply localized titles and resize names in production. The standard optional zOrder declaration participates in core ordering; a launcher cannot outrank its owning Surface's modal descendants through fixed CSS ranks.

## Drawer boundary and depth

The drawer/docking presentation owns the visible border and depth treatment that presents it as raised relative to the content it overlays or pushes. The theme/backend supplies the concrete line and depth artwork. A flat line establishes separation but does not by itself fulfill the normal depth treatment. Forced-colors presentation retains a visible boundary when shadows are suppressed. This relationship preserves existing popup/modal ordering and does not assign a fixed global z-index.

UiDrawerLayout owns space allocation and must allow the drawer's border and depth to remain visible. Its clipping and enclosing scroll/layout integration must accommodate the required paint while containing moving content. The layout does not own another border, and consumers do not add CSS, extra inset space or an explicit strategy to repair the default.

The supporting backends provide a default boundary and depth treatment in overlay and docked modes. The docking frame separates its paint from clipped moving content; core orders the drawer allocation above main through the shared stacking protocol. Verify the actual border and depth toward main content at all edges and in RTL, before/after resizing and during entry/exit, in light/dark and supported themes. Check that content/focus remains reachable, the resize target remains operable and the decoration does not alter allocation or create a second boundary. A stylesheet shadow declaration alone does not prove visible depth.

## Choose sizing and lifetime deliberately

Every drawer mode supports preferredExtent, minExtent, maxExtent, resizable and resizeLabel. The default preferred extent is 24rem. Start/end resize width; top/bottom resize height. Constraints use the current available axis; percentage constraints in docked mode apply after reserving the main minimum. Available space wins over an impossible minimum. User resizing does not invoke close guards or change expansion.

Collapse does not unmount panel/docked content or stop its business work. Modal mode retains run/session ownership and background blocking; switching to or from it requires a keyed remount. Extent memory lasts for the mounted drawer, even across modal runs; business draft lifetime still follows its own control/session. Preferred-extent or edge changes reset adjusted extents. Changing the docking edge reconfigures the allocation and surface together immediately; it does not interpolate incompatible grid tracks. Ordinary opening/closing retains backend motion and reduced-motion behavior. Bounds changes only clamp them. Consumers needing persistence across remounts must retain the composition; this version has no controlled-extent API.

Owned pickers and other popups remain usable outside the drawer body's scroll
boundary. A docked drawer is a layout region: its popups use the enclosing
overlay host, including an enclosing modal's interaction scope when present.
Panel and modal drawers host their popups within their own overlay scope.

## Present narrow content through strategies

A narrow panel is a presentation context, not evidence that the device became mobile. Use UiStrategy with applicable label/width queries and application-owned arrangement queries. A reusable settings composition can participate in such a query and resolve its actions vertically/full-width while leaving controls normally sized. Query barriers and agreement still apply; an outer wrapper cannot override an inner composition that never consumes that policy. Keep the actual responsive environment intact and keep the demonstrated business form outside a demo-options strategy.

## Give supplementary content a clear hierarchy

A panel title names the whole surface. A panel with one subject can present its content directly, avoiding a redundant card or repeated generic heading. Group multiple subjects such as controls, read-only output and usage guidance as peers beneath that title; use matching section heading ranks and visual treatment. Avoid repeating the surface title as a larger inner heading or giving only one peer an additional frame. Keep output-related status with its output, and make general usage guidance independent of that output. A panel's scrollport already supports reading; a nested disclosure needs a separate reason.

A reusable application composition can own these section slots, order and titles, while pages supply their controls, values and operations. Existing UiCard, UiLayout and scoped card strategies can give peer sections consistent compact treatment across backends without application CSS or a new library component. Keep the strategy scope limited to its intended section frame so opaque content retains its presentation policy. The General demo uses this pattern under the common localized title Demo settings.

## Ownership and acceptance

Consumers supply expansion or one drawer binding, meaningful names, bounded hosts where required, and business content with its existing lifetime. The host cannot infer useful minima or retention from opaque children. Backends supply independent markup/native surface integration, resize handles, safe-area and visual-viewport geometry, accessible state/focus and actual stacking targets. No extra provider styling boundary or mandatory trigger component is required.

Check default hidden state, ordinary activation after a cancelled/completed drag, all-edge/RTL bounds, click/tap and keyboard movement, controlled denial, resize values/limits and main reflow. Collapse/reopen and cross viewport changes must preserve drafts, saved outputs and native form event paths. Modal resizing must preserve guarded dismissal and blocking; nonmodal modes must leave background interaction available. Browser tests are needed for hit targets, clipping, zoom/software keyboards and top-layer behavior; component DOM checks alone cannot establish those results.

References: [UiFloating](../api/components/UiFloating.md), [UiDrawer](../api/components/UiDrawer.md), [UiDrawerLayout](../api/components/UiDrawerLayout.md), [drawer sizing](../api/types/UiDrawerSizingProps.md), [strategies](strategies.md) and [dynamic z-order](dynamic-z-order.md).
