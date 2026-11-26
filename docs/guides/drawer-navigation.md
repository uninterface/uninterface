# Navigation in a drawer

A navigation drawer combines a trigger, a modal surface and a persistent hierarchy view. `createUiNavigationDrawerControl` supplies their coordination without introducing a required component tree. Compose the existing views; ordinary consumers need no backend imports, CSS, duplicate navigation controller or open boolean.

## Ownership and consumer obligations

The application owns its router/hash driver, confirmed location and permission/guard policy. A navigation control borrows the entry hierarchy and projects current/path. The navigation-drawer control borrows that navigation binding and owns one modal drawer run. Menu views own their independent expansion; a controlled `expandedKeys` can retain the drawer menu's expansion across runs.

The backend owns markup, native drawer treatment, accessible host relationships, focus entry/containment/restoration, scrolling, motion, RTL edges and theme integration. Core coordination owns neither DOM focus targets nor a competing router. The application can use `useUiResponsive` to map its context to a navigation presentation. No hamburger presentation is added to UiNavMenu, and UiNavbar remains a bar with always-visible supplied content and wrapping.

```vue
<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import {
  createUiNavigationDrawerControl,
  UiButton, UiDrawer, UiIcon, UiNavMenu,
} from '@uninterface/uninterface'
import type { UiNavMenuBinding } from '@uninterface/uninterface'

const props = defineProps<{ navigation: UiNavMenuBinding }>()
const destination = ref<HTMLElement>()
const menu = createUiNavigationDrawerControl(props.navigation, {
  async afterNavigate(_, { signal }) {
    await nextTick()
    if (!signal.aborted) destination.value?.focus({ preventScroll: true })
  },
})
onBeforeUnmount(() => { void menu.dispose() })
</script>

<template>
  <UiDrawer mode="modal" :control="menu.drawer" aria-label="Navigation" edge="start">
    <template #host="{ buttonTrigger }">
      <UiButton v-bind="buttonTrigger" variant="icon" @click="menu.open()">
        <template #icon><UiIcon name="menu" /></template>
        Open navigation
      </UiButton>
    </template>
    <UiNavMenu :binding="menu.bindings.navMenu"
      presentation="vertical-tree" aria-label="Destinations" />
  </UiDrawer>
  <main ref="destination" tabindex="-1" class="uninterface-navigation-focus-target">
    <slot />
  </main>
</template>
```

Supply localized names and labels in an actual application. A navigation drawer needs an accessible name, not a repeated visible title; `aria-label` names it without a heading. The backend keeps its close button at the logical end. A root menu sharing the drawer’s orientation uses its frame boundary instead of adding another outside border. The example uses the existing [navigation-focus utility](../api/styling-classes/uninterface-navigation-focus-target.md). The borrowed binding must remain valid throughout this owner's lifetime; deliberately remount when replacing that owner. Application-owned entries/navigation are disposed separately. Use the drawer host's buttonTrigger on one actual button; the navigation control does not replace backend DOM registration or expanded/controlled relationships.

## Outcomes and focus

Ordinary requests forward once and synchronously through the borrowed binding, allowing it to prevent default before an async guard yields. Completed or unchanged results close the drawer only when the requested key is confirmed current. Blocked, cancelled or failed requests leave it open; `state.error` makes failures observable without inventing user-facing messages. Pending requests do not disable navigation: a newer request can supersede an older one through the navigation owner.

An external confirmed-location change, such as Back/Forward, completes an active drawer too. Modified/new-tab link operations remain native and do not complete the drawer. Late results from dismissed/superseded sessions cannot close a newer session or perform its destination callback. Dismissal does not cancel a router operation owned elsewhere; any later independently observed location change remains authoritative.

Opening uses the drawer backend's focus entry. Escape, outside interaction and the close button follow UiDrawer policy and restore its invoking target. On confirmed navigation, exit and modality cleanup finish first; `afterNavigate` can then focus the destination. If history advances during exit, the callback receives the latest confirmed key. An async callback must respect its abort signal before moving focus. Applications must avoid a separate route watcher trying to focus behind the open drawer. Destination focus from inline navigation remains application-owned.

## Responsive headers

Keep branding and settings mounted while switching navigation presentation. For a compact navbar, place the drawer trigger beside the brand and settings at the opposite end. Render the default navbar navigation slot only in inline mode so the hidden horizontal menu consumes no space. The inline menu and drawer use the same navigation binding.

Use [useUiResponsiveNavigationSwitch](../api/functions/useUiResponsiveNavigationSwitch.md) when an inline menu and drawer replace one another. Map your responsive contexts to `'inline'` or `'drawer'` and supply that mode, the drawer control and a surviving focus target, such as the brand link. Render from its committed `mode` ref and connect the menu and trigger refs. It waits for drawer exit before removing its host, handles superseding mode requests, and recovers focus when the switch removes it. Contexts that map to the same mode can share the mounted navigation. Keep entry and navigation owners and cached business pages outside the conditional views.

## Observable acceptance

Verify completed, unchanged, blocked, cancelled, failed and pending navigation; synchronous single dispatch; shared current/path/breadcrumbs; modified links; external history; stale responses; repeated opening; disposal and deactivation cleanup. Confirm that a control-only build excludes component/backend views and optional router integration. Browser checks cover compact header geometry, visible focus, keyboard/touch, modal containment, dismissal, post-exit page focus, long drawer-body scrolling, responsive transitions, RTL, themes and interaction with settings/other overlays. DOM tests establish wiring and lifecycle, not geometry or assistive-technology acceptance.

Related references: [factory](../api/functions/createUiNavigationDrawerControl.md), [control](../api/types/UiNavigationDrawerControl.md), [options](../api/types/UiNavigationDrawerOptions.md), [navigation menus](navigation-menus.md), [drawers](drawers-and-popovers.md), [responsive layouts](responsive-layouts.md).
