# Drawers and popovers

UiDrawer and UiPopover host arbitrary business content through independently implemented backend views. Both support native themes, application locale, logical direction, shared strategies and core-owned stacking. Their primitives do not own forms, navigation or business persistence.

## Choose an interaction or a persistent panel

Use UiDrawer mode="modal" for an edge-attached task with an outcome. Use UiPopover for an anchored interaction; it is nonmodal by default, with optional modal=true. Both use the same run/session engine as UiModal. Awaiting a function does not itself block the surrounding interface.

Use UiDrawer mode="panel" for content that remains part of the workspace when hidden: navigation, filters or a scratchpad. Supply v-model:expanded or a drawer expansion binding. Content is retained while hidden; lazy=true only defers first mount. Hiding does not stop validation/timers or dispose controls. Modal and panel modes overlay the viewport. Use mode="docked" with UiDrawerLayout to reserve main-content space through the same retained expansion owner. See [floating panels](floating-panels.md) for docking, launchers and all-mode resizing; compact rails remain outside this API.

## Encapsulate the business operation

```ts
// Inside CustomerChooser.vue, alongside its declared UiPopover/UiDrawer.
const interaction = createUiPopoverControl<Customer>()
function choose(initial: Customer) {
  return interaction.run({
    setup(session) { /* prepare this run's business data */ },
    opened(session) { /* optionally focus the mounted editor */ },
    beforeClose(request, session) { return true },
    teardown(session, result) { /* release this run's resources */ },
  })
}
defineExpose({ choose })
onBeforeUnmount(() => { void interaction.dispose() })
```

The caller mounts the component and awaits chooser.value.choose(initial). It supplies business data/operations and handles the completed/cancelled/error result; it does not reconstruct hooks, fields or visibility. Setup precedes presentation, accepted closure unmounts run content, teardown completes before result delivery. Run hooks must cooperate with the session abort signal and must not await their own run or disposal. Retain externally owned business controls only for an explicit longer lifetime.

```vue
<UiPopover :control="interaction" title="Choose customer">
  <template #host="{ buttonTrigger }">
    <UiButton v-bind="buttonTrigger" @click="choose(currentCustomer)">Choose</UiButton>
  </template>
  <template #default="{ session }">
    <CustomerChoices @choose="session.complete($event)" />
  </template>
</UiPopover>
```

This excerpt illustrates the component's internal host and content; its caller may also provide a forwarded host slot and handle the returned business result. The host binding registers the actual trigger and supplies accessibility state. It does not start run on the caller's behalf. Repeated activation while presented is consumed and requests trigger cancellation only if enabled. A separate anchor binding can identify another subject while retaining the trigger as focus-return destination.

Default/header-extra/actions/footer slots follow UiModal conventions; actions and footer are alternatives. Use native UiForm ID and UiButton form association for footer submission. Ordinary form validation and save feedback remain in the business composition. A successful save only completes a run when the composition explicitly calls session.complete. Dirty/pending policies belong in beforeClose. The demo's OverlayNoteEditor encapsulates these details, including a nested discard confirmation.

## Header, content and footer

UiDrawer and UiPopover integrate the [header/main/footer reference arrangement](../contracts/layout.md#example-modalbodylayout). `ModalBodyLayout` is its conceptual name, not a component to import. Continue supplying the existing frame slots: default for main content, `header-extra` for additions to the frame's title/close region, and either `actions` or `footer`. These slots do not change the frame's naming or lifecycle contract.

The main body scrolls within the frame's bounds; header and footer stay outside that scrollport. `#actions` accepts ordinary buttons whose spacing, alignment and wrapping belong to the backend. Use `#footer` when you need to compose other footer relationships yourself. No footer is required for content-only interactions, and no extra heading or action should be added merely to fill the arrangement.

A native popover may provide only the outer surface. The backend must then supply the missing internal arrangement; consumers should not compensate with CSS or a wrapper around ordinary actions. A backend can compose compatible native region facilities to supply header/body/footer arrangement, including action spacing. The demo uses standard actions for its editor and a custom footer for the scratchpad retention message. Lifecycle/DOM checks do not establish visual layout acceptance.

## Persistent panels

```vue
<UiDrawer mode="panel" v-model:expanded="filtersExpanded" title="Filters" edge="start">
  <template #host="{ buttonTrigger }">
    <UiButton v-bind="buttonTrigger">Filters</UiButton>
  </template>
  <OrderFilters />
</UiDrawer>
```

For coordination, createUiExpansionControl({ mode: 'multiple' }) exposes bindings.drawer('filters'). It can coordinate drawer and collapsible views of the same keys. Never combine a binding and v-model. Disabled gates user requests; owner updates can still collapse/expand. Retaining the current state declines a request. The built-in expansion control has no asynchronous close-guard protocol.

Nonmodal panels preserve ordinary background use and Tab navigation. They take no layout allocation, and hidden content is inert and absent from keyboard navigation. Closing focused content returns to its invoking target where available. Keep triggers mounted/enabled; an external owner removing them must arrange another meaningful destination. KeepAlive deactivation releases physical overlays and listeners; external panel expansion is preserved for reactivation. A modal/popover run instead ends when its view is deactivated.

Overlay drawers attach flush to the viewport and slide in/out from their selected edge. Start/end drawers fill its height; top/bottom drawers fill its width. Safe-area padding protects content inside the surface instead of offsetting the whole drawer. Backends own timing and easing, with reduced-motion support. Exit finishes before a modal result is delivered; a collapsed panel remains mounted and inert while exiting. Rapid panel toggles settle to the latest expansion state.

## Backend integration and limits

The [native arrow principle](design-principles.md#native-arrows-on-anchored-surfaces) also covers native popover compositions inside editors and other controls. The implemented UiPopover support below does not imply that every existing picker or suggestion composition has been brought into line with it.

Backends own markup and surface styling. Native browser dialog/popover primitives provide top-layer hosting; shared helpers coordinate focus, guarded dismissal, portal ownership and positioning without competing lifecycle owners. Where native dragging is supported, the default drawer drag route uses the same modal guard or panel owner and can be excluded through an explicit closeOn list. Pending/denied requests preserve content and modality. All modes support named pointer/keyboard resizing through UiDrawerSizingProps. Snap points and gesture-tuning APIs are not exposed. Arrow artwork, defaults and attachment remain implementation-owned; no public arrow option is required. Arrows follow the resolved side after flipping and the anchor after viewport adjustment, outside the body scrollport. Consult backend documentation for gesture, arrow and theme-configuration support.

Modal surfaces mask/block background interaction and lock ancestor/document scrolling. Nonmodal surfaces do neither. Owned popups portal inside their enclosing interaction. The core allocator remains authoritative; native top-layer reversal is unsupported. Anchored positioning flips/clamps within the visual viewport and follows layout movement. An unavailable anchor terminates the run with error and cleanup. Panel/docked changes preserve mounted content. Crossing modal ownership or changing popover modality requires keyed remounting.

## Observable acceptance

Check both drawer ownership contracts and all three modes, hidden-panel draft identity, lazy mount, disabled versus authoritative owner changes, all run outcomes, refused closure and sequential reuse. Exercise trigger/outside/Escape routing, supported drag dismissal (accepted, denied, pending and disabled), nested select/menu and confirmation interactions, separate anchors and anchor removal. Change language, direction and color mode while content is open. In a real browser verify logical edges, viewport clipping, zoom/software-keyboard behavior, bounded long-content scrolling, focus containment only when modal, background operability and focus restoration.

Shared DOM regressions exercise the real core/backend components across supporting backends. They establish lifecycle and wiring, not physical geometry, browser top-layer behavior or accessibility conformance. Browser scenarios are provided separately; execution evidence is recorded in the workspace implementation ledger.
