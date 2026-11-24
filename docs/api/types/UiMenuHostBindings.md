# UiMenuHostBindings

The integration bindings supplied to UiMenu's `host` slot. Import the type from `@uninterface/uninterface` when typing a reusable host composition; ordinary templates receive it through the slot.

`buttonTrigger` provides `aria-haspopup: 'menu'`, `aria-expanded: boolean`, optional `aria-controls`, and `onClick(event: MouseEvent)`. Apply it with v-bind to UiButton or a native button of type button. It toggles the popup and uses the rendered event currentTarget as its anchor and focus-return destination.

`contextTrigger` provides `role: 'group'`, `tabindex: 0`, a localized/business menu `aria-label`, aria-haspopup and aria-controls for the popup association, `onContextmenu(event: MouseEvent)` and `onKeydown(event: KeyboardEvent)`. Apply it to an appropriate content group. Right-click opens at the pointer; ContextMenu or Shift+F10 opens against that target. Pair it with a visible trigger for discoverability and touch access. Other keyboard events are unaffected. The binding also carries an optional opaque `class` supplied by the backend, reusing [standalone focus presentation](../../guides/focus-presentation.md). No additional presentation binding is needed. Apply the complete binding; do not select, interpret, or copy its class name. Vue merges it with an existing class on the receiving element. The backend styles the bound element’s boundary, without inferring the shape of nested content or styling descendants.

These are event/attribute bindings, not a UiButtonBinding or an entry control. Do not pass buttonTrigger as UiButton's binding prop; use `v-bind="buttonTrigger"`. They contain no geometry knobs, source or selection state. The receiving element must deliver real DOM events with an HTMLElement currentTarget. Bindings belong to one menu view and should not outlive it.

Backend views generate these bindings from the shared open state and their anchor/focus mechanics. Verify that custom hosts open the same menu, ARIA controls identifies the rendered collection, context keyboard requests use their own target, and dismissal restores meaningful focus. Concrete DOM and positioning remain backend-owned.
