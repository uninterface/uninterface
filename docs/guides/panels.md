# Tabs and collapsibles

UiTabs presents a tab bar; UiTabPanel presents its separately placed content. A shared binding coordinates selection. UiCollapsible reveals optional content beneath a summary. Use destination links for navigation; these tabs do not update URLs or browser history.

## Separately placed tabs and panels

Create a control in the business component which owns this composition. Keep each label in the UiTab default slot and each panel's business content in a UiTabPanel default slot:

```vue
<script setup lang="ts">
import { onScopeDispose } from 'vue'
import { UiTabs, UiTab, UiTabPanel, UiCard, UiBadge, createUiTabsControl } from '@uninterface/uninterface'
const tabs = createUiTabsControl({ selectedKey: 'details' })
onScopeDispose(() => tabs.dispose())
</script>

<template>
  <UiTabs :binding="tabs.bindings.tabs" aria-label="Customer">
    <UiTab value="details">Details</UiTab>
    <UiTab value="issues">Issues <UiBadge>{{ issueCount }}</UiBadge></UiTab>
  </UiTabs>
  <UiCard>
    <UiTabPanel :binding="tabs.bindings.panel('details')"><CustomerDetails /></UiTabPanel>
    <UiTabPanel :binding="tabs.bindings.panel('issues')" lazy><CustomerIssues /></UiTabPanel>
  </UiCard>
</template>
```

The application supplies CustomerDetails, CustomerIssues and issueCount. The tab bar and container can occupy different layout regions. Each panel derives visibility from the same selection owner; no content-switching v-if/v-else or business CSS is needed. A control is a factory-created object, not a component instance. Owner calls such as `tabs.select('issues')` update the bar and panel together. For reveal-before-focus, await nextTick after select, then call the target editor's focus handle. Custom producers can implement UiTabsBinding and UiTabPanelBinding without using this factory; retain the selected key to deny a request.

UiTab default slots contain meaningful text, icons or passive badges, never nested actions or inputs. An explicit aria-label can name an icon-only tab. Slot observations are selected and disabled. Stable nonempty values pair triggers with panels. Keep one panel boundary per declaration, even when lazy; duplicate or missing associations are rejected. Direct UiTab children, fragments and v-for are supported. Opaque components may own the entire composition, but cannot conceal individual declarations inside the bar. Update selection and declarations together when removing the selected tab. Changing a binding requires a keyed remount.

Manual activation separates focus from selection: arrows/Home/End explore labels and Enter/Space activates. Disabled triggers are skipped, while an already selected tab becoming disabled keeps its content. Owner selection may deliberately reveal disabled tabs. Horizontal movement follows rendered LTR/RTL direction. Vertical orientation changes the bar and keys; the business layout independently places it beside content.

## Space and retention

A panel's default height follows its content. For a stable area, the embedding owner supplies a definite allocation and panels use height="full". One ordinary container holds the alternative panels; giving each one an independent UiLayout track would reserve multiple allocations even while their contents are hidden.

```vue
<!-- Inside an existing bounded host; the host decides the available height. -->
<UiLayout height="full" :division="['content', 1]">
  <UiTabs :binding="tabs.bindings.tabs" aria-label="Customer">
    <UiTab value="details">Details</UiTab>
    <UiTab value="issues">Issues</UiTab>
  </UiTabs>
  <div style="height: 100%; min-height: 0">
    <UiTabPanel :binding="tabs.bindings.panel('details')" height="full">
      <UiLayout height="full" scroll="vertical" aria-label="Details"><CustomerDetails /></UiLayout>
    </UiTabPanel>
    <UiTabPanel :binding="tabs.bindings.panel('issues')" height="full" lazy>
      <UiLayout height="full" scroll="vertical" aria-label="Issues"><CustomerIssues /></UiLayout>
    </UiTabPanel>
  </div>
</UiLayout>
```

The ordinary panel container must fill its allocation; an application-owned embedding container may establish this explicitly. This is parent-allocated space, not measurement of the tallest panel. The tab bar does not size or own the content. Frame decoration and content insets remain separate concerns. Use UiLayout scrolling to keep the content aligned with the tab bar; choose UiContent only when a separate inset is intended; see [scrolling content](scrolling-content.md). The demo uses an explicit bounded preview host to make allocation visible.

Panels and collapsed sections retain mounted content. Lazy defers only first mount; enabling it later never destroys already mounted content. Hidden content is hidden/inert and excluded from layout and keyboard navigation. Hiding does not pause validation, timers or business work. Removing a panel or unmounting its composition destroys its view; external controls retain their independently owned lifetime. Disposing a tabs control disables activation and preserves its last selection; it does not dispose hosted forms. When selection hides focused panel content, focus returns to the selected trigger unless business code has already moved it. When removing an entire composition, the owner chooses the next meaningful focus destination.

## Coordinated collapsibles

For coordinated sections, use one expansion control rather than reconstructing key membership in every component:

```vue
<script setup lang="ts">
import { onScopeDispose } from 'vue'
import { UiCollapsible, createUiExpansionControl } from '@uninterface/uninterface'
const panels = createUiExpansionControl({ mode: 'single' })
onScopeDispose(() => panels.dispose())
</script>

<template>
  <UiCollapsible label="Delivery" :binding="panels.bindings.collapsible('delivery')">
    <DeliveryPreferences />
  </UiCollapsible>
  <UiCollapsible :binding="panels.bindings.collapsible('billing')" lazy>
    <template #summary><span>Billing information</span></template>
    <BillingInformation />
  </UiCollapsible>
</template>
```

Single permits at most one expanded key; multiple permits any number. Either permits all closed. Explicitly choose which keys survive when switching to single mode, for example panels.setMode('single', panels.state.expandedKeys.slice(0, 1)). The demo deliberately keeps the earliest expanded key. Programmatic expansion uses panels.expand('billing'); await nextTick before focusing a field inside. Local disabled blocks user requests, not owner-driven synchronization. Independent instances may keep ordinary boolean v-model. Never supply both v-model and binding.

A summary slot replaces label text and receives expanded/disabled observations. It must include meaningful accessible text and only noninteractive content, such as text, icons and passive badges. The backend owns the actual toggle and expansion indicator. Independent buttons, links or inputs do not belong inside the summary. Collapsibles do not insert document headings; headings for the surrounding task remain ordinary semantic content. A full accordion's heading structure and keyboard coordination are separate from synchronizing expanded keys. Shared bindings do not imply visual grouping, physical adjacency or an accordion registry. Place sections consecutively in a common parent when they form an adjacent sequence, as above. Use UiLayout when they need separate spatial allocations, wrapping or peer spacing. The backend owns the resulting boundary treatment; direct adjacency does not introduce shared keyboard navigation or transfer expansion ownership.

Controls belong to their business owner. Unmounting a view does not erase its key or dispose an external owner. Disposal closes and disables existing bindings; recreate a control for a new lifetime. Retention does not pause validation or background work. If an external update hides focused content, move focus to a meaningful visible destination as part of that operation. Keyboard-triggered collapse keeps focus on its toggle.

Backend-native components supply indicators, active treatments, padding and motion. Adaptations preserve controlled denial and retained children even when a native widget normally unmounts on collapse. The public contract promises state and accessibility behavior, not identical DOM or animation.

Acceptance checks: traverse horizontal and vertical labels, include RTL, skip disabled labels, activate with keyboard, change labels without changing keys, reorder/remove items, type into a panel and switch away/back, collapse/reopen, verify lazy mount count, and reveal hidden validation errors. DOM tests verify roles, callbacks, focus movement and identity. Real-browser checks are needed for hidden focus exclusion, wrapping, visible focus and assistive-technology behavior.

UiCollapsible accepts optional `color` using the shared UiThemeColor vocabulary. It is a presentation request: unsupported backends ignore it. Support and the affected surfaces/states are documented by the selected backend. Omission restores native defaults. Color never replaces meaningful summary text or a status badge, and it does not change expansion or validation. See [UiCollapsible](../api/components/UiCollapsible.md) for capability and theme-validation details.
