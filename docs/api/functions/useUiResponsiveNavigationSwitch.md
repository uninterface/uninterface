# useUiResponsiveNavigationSwitch

Coordinate navigation that switches between an inline menu and a drawer.
Import from `@uninterface/uninterface` and call during Vue setup. The application
maps its responsive contexts to the requested navigation mode.

| Option | Meaning |
| --- | --- |
| `mode: () => 'inline' \| 'drawer'` | Requested navigation mode. The getter can read `useUiResponsive().context` or an application-owned responsive source. |
| `drawer: () => UiNavigationDrawerControl \| undefined` | The control attached to the drawer. Return `undefined` on pages with no navigation. |
| `focusFallback: () => void` | Synchronously focus a surviving target, such as a brand link, when leaving drawer mode. The caller supplies its accessible name and focusability. |

Render the conditional views from the returned read-only `mode` ref. It holds
the committed presentation and stays at `'drawer'` while the drawer exits.
Bind `inlineMenu` as the template ref of the inline `UiNavMenu`. In the drawer's
`host` slot, bind `drawerTrigger` as the template ref of `UiButton` and forward
`drawerTriggerBindings` alongside the normal `buttonTrigger` bindings on that
button. Keep the same navigation control in both presentations.

This example uses an application profile with `compact`, `medium` and `wide`
contexts. The app must install the shared `workspaceResponsive` profile with
[createUiResponsive](createUiResponsive.md). Medium and wide share one mounted
inline menu, whose presentation props can also depend on the context.

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import {
  UiButton, UiDrawer, UiIcon, UiNavbar, UiNavMenu, useUiResponsive,
  useUiResponsiveNavigationSwitch, type UiNavigationDrawerControl,
} from '@uninterface/uninterface'
import { workspaceResponsive } from './responsive'

const props = defineProps<{ menu: UiNavigationDrawerControl }>()
const brand = useTemplateRef<HTMLAnchorElement>('brand')
const { context } = useUiResponsive(workspaceResponsive)
const { mode, inlineMenu, drawerTrigger, drawerTriggerBindings } =
  useUiResponsiveNavigationSwitch({
    mode: () => context.value === 'compact' ? 'drawer' : 'inline',
    drawer: () => props.menu,
    focusFallback: () => brand.value?.focus(),
  })
</script>

<template>
  <UiNavbar aria-label="Application navigation">
    <template #brand>
      <a ref="brand" href="/">Home</a>
      <UiDrawer v-if="mode === 'drawer'" mode="modal" :control="menu.drawer" aria-label="Pages">
        <template #host="{ buttonTrigger }">
          <UiButton ref="drawerTrigger" v-bind="{ ...buttonTrigger, ...drawerTriggerBindings }"
            variant="icon" @click="menu.open()">
            <template #icon><UiIcon name="menu" /></template>
            Open navigation
          </UiButton>
        </template>
        <UiNavMenu :binding="menu.bindings.navMenu" presentation="vertical-tree" aria-label="Pages" />
      </UiDrawer>
    </template>
    <template v-if="mode === 'inline'" #default>
      <UiNavMenu ref="inlineMenu" :binding="menu.bindings.navMenu" aria-label="Pages" />
    </template>
  </UiNavbar>
</template>
```

## Focus and lifetime

When switching to `'drawer'`, focus in the inline menu or an owned submenu
transfers to the drawer trigger after it mounts. When switching to `'inline'`,
the drawer stays mounted until exit and native return focus finish. If the
switch removes that focus, the composable invokes `focusFallback`. If focus
survives in an editor, Settings or a confirmed navigation destination, it stays
there. Context changes that request the same mode leave the presentation
mounted and skip drawer cleanup and focus recovery by the composable.

A newer request cancels the pending switch and focus handoff. A drawer close
already dispatched may still finish. Vue scope disposal cancels pending view
updates. The caller retains ownership of the drawer and navigation controls,
including disposal and route destination focus through `afterNavigate`.

Verify both mode transitions with focus in the menu, drawer and page, including
an open inline submenu, a reversal during drawer exit, and retained editor
drafts. For profiles with shared modes, verify that same-mode context changes
preserve the mounted view. Use a browser for DOM focus and native modality checks.
