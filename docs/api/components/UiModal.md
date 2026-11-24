# UiModal

Hosts a named blocking interaction driven by a factory-created [UiModalControl](../types/UiModalControl.md). Import from `@uninterface/uninterface`. See the [modal guide](../../guides/modals.md) for ownership, usage and verification, and [form-integrated modals](../../guides/form-modals.md) for the recommended create/edit composition.

| Prop | Default | Meaning |
|---|---|---|
| `control: UiModalControl<T>` | Required | One authoritative run owner; one attached view at a time |
| `bodyScroll?: 'body' \| 'content'` | `body` | Body scrolls its normal flow, or offers a bounded allocation to content that owns scrolling |
| `title: string` | Required | Visible, nonempty dialog title and accessible name |
| `closeOn?: readonly UiModalCloseTrigger[]` | `['close-button', 'escape']` | Enabled built-in dismissal routes; supplied array replaces the default |

Default, `header-extra`, `actions` and footer slots receive `{ session: UiModalSession<T> }` while the run is presented. `header-extra` content follows and supplements the required title; it does not replace the title or close button; footer hosts business actions outside the body scrollport. Backend title styling and frame insets remain implementation-owned; outer width follows the shared sizing props below. There is no description prop or dedicated description slot. Include body text only when it helps the user make a decision or complete the interaction; a modal does not need introductory explanation. Attributes reach the dialog surface; its required naming and lifecycle handlers cannot be replaced by consumer attributes. Native `method="dialog"` submissions and direct DOM `close()` calls are outside the control contract; use the session methods.

`closeOn` accepts `close-button`, `escape` and `backdrop`; order and duplicates have no effect. Including `close-button` renders the backend-native close affordance. Use `:close-on="[]"` to disable all built-in dismissal routes, or `:close-on="['close-button', 'escape', 'backdrop']"` to enable all three. Explicit session completion/cancellation and terminal cleanup remain available independently. Enabled routes consult `beforeClose`; the close button is temporarily disabled while a decision is pending. Prop changes apply to the current run without remounting its content. See [UiModalCloseTrigger](../types/UiModalCloseTrigger.md).

## Footer authoring

Use `#actions` for an ordered sequence of ordinary button components. The backend owns placement direction, alignment, native spacing and wrapping. There is no action descriptor array, importance inference, sorting or automatic activation. Supply the first action first even when the backend places it at the right in LTR content.

```vue
<UiModal :control="modal" title="Confirm operation">
  <template #actions="{ session }">
    <UiButton @click="session.complete(true)">OK</UiButton>
    <UiButton @click="session.cancel()">Cancel</UiButton>
  </template>
</UiModal>
```

`#footer` is the alternative for a fully authored footer composition. Do not supply both slots; this is rejected. Slot content remains opaque and keyed child identity is preserved. Put independent actions directly in `#actions`; a wrapper is one layout item and controls its own children. Conditional and repeated buttons retain ordinary Vue behavior. An omitted slot releases the footer; an explicitly supplied slot remains a supplied region, even if its child components render nothing.

Actions keep declaration order in the DOM and Tab sequence. A backend placing the first action at inline-end presents `Cancel OK` in LTR and `OK Cancel` in RTL; a backend following inline reading order presents the opposite. This does not change text direction. Wrapping proceeds in that same placement direction on each subsequent line. No toolbar semantics, roving tabindex or implicit default button is added. Layout never submits, cancels or completes a session on its own.

Submit/reset bindings in `#actions` associate explicitly with the body’s UiForm: set UiForm `:id="formId"` and each bound UiButton `:form="formId"`. The binding continues to own type, activity and availability; the footer supplies arrangement only. See the [control binding contract](../../contracts/control-binding.md).

## Lifecycle

The control must be attached before `run()`. Content mounts after setup and unmounts during closure before teardown. Sequential runs mount distinct content instances; externally owned controls retain whatever business policy defines. The declared UiModal remains reusable. Unmount/deactivation interrupts a run rather than leaving hidden modality active. Replacing control during an active run is not a supported transfer mechanism; await closure before replacing the owner.

Core owns lifecycle and capability checks; backends supply native dialog semantics, blocking, focus, theme presentation, bounded body scrolling and owned popup hosting. Requires `modal.v1`.

Verify naming, slot lifetime, close-policy denial, exactly-once cleanup, sequential runs, non-form content, nested confirmation and popup ownership. See the guide for error capture limits and hook cooperation obligations.

## Width

| Prop | Default | Meaning |
| --- | --- | --- |
| `width?: 'auto' \| 'available'` | `auto` | Explicit/shared preference or all available width |
| `preferredWidth?: number \| string` | `32rem` fallback | Outer width preference: positive px number, px/rem/em string, or percentage greater than zero and at most 100% |
| `minWidth?: number \| string` | None | Positive px number or px/rem/em minimum, subject to viewport hard cap |
| `maxWidth?: number \| string` | Available width | Positive px number or px/rem/em maximum |

Percentages refer to viewport width after safe-area insets and backend edge clearance, before author min/max bounds. Reject available plus preferredWidth and minimum greater than maximum. Preferences are clamped; the available viewport always wins over a requested minimum. Props update live without remounting content. Requires modal.width.v1 in addition to modal.v1.

The current auto default is 32rem; automatic nested-content width negotiation is not implemented. See [width determination](../../contracts/modal-sizing.md) for the exact policy and responsive invoice example. Verify rem/percentage/available widths, mixed-unit constraints, narrow viewport and visual viewport updates, and preservation of drafts/focus. DOM wiring does not establish actual browser geometry.

## Stacking

`zOrder?: UiZOrder` describes outward stacking. The outward participant is the visible modal session Surface; each reopening receives a new identity. See [dynamic stacking](../../guides/dynamic-z-order.md) for scope, lifetime, pending refs and observable overlap checks. Core owns order and the backend owns rendering targets. The header and footer paint above directly owned tooltips and below the modal’s interactive popup layer. Tooltips in the header or footer open toward the body. For validation inside a popup above both sections, supporting backends show the message below its field within that popup.

## Content-owned scrolling

`bodyScroll="content"` lets a nested layout or collection own overflow within the modal's available body space. Short content remains naturally sized; long content is constrained by the viewport cap, with the modal header/footer outside that allocation. Put a full-height layout or `UiForm height="full"` at the body root and delegate the scrolling portion explicitly (for example, `UiTable height="full"`). Do not add a second fixed pixel height or assume a content-sized modal body supplies full height by default. Requires `modal.content-scroll.v1`.

The body retains its named keyboard-scrollable overflow fallback when fixed supporting content cannot fit, such as under zoom or a very short viewport. This is not clipping permission. Descendant row scrolling must preserve sticky headers/summaries, reachable local actions, focus and raw drafts. Verify short and long content, narrow/short viewports, direct native Save and keyboard navigation in the actual composition.

When a very short window cannot accommodate usable child scrolling alongside its supporting content, a backend may preserve operability through body scrolling. Consult the backend's modal documentation for this fallback; verify that fields and supporting actions remain reachable rather than assuming all supporting content is pinned at every height.
