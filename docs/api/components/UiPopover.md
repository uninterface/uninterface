# UiPopover

Hosts an anchored, arbitrary-content interaction. Import from `@uninterface/uninterface`; requires `popover.v1`. See [drawers and popovers](../../guides/drawers-and-popovers.md).

| Input | Default | Meaning |
| --- | --- | --- |
| `control: UiOverlayControl<T>` | Required | One authoritative run owner, normally created by createUiPopoverControl. |
| `title?: string` | — | Visible title and accessible name; otherwise supply nonempty aria-label. |
| `modal?: boolean` | false | Whether outside interaction is blocked; fixed per mount. Awaiting a result does not itself imply modality. |
| `placement?: UiPopoverPlacement` | bottom | Preferred top/bottom/start/end side. Start/end follow writing direction. |
| `align?: UiPopoverAlign` | start | Preferred start/center/end alignment on that side. |
| `closeOn?: readonly UiOverlayCloseTrigger[]` | escape, outside, trigger | Enabled routes; may also include close-button. Explicit array replaces defaults. |
| `zOrder?: UiZOrder` | — | Core ordering: ordinary host composition plus owned Floating popup, or new Surface for a modal run. |

Required attachment is expressed through the host slot's `{ buttonTrigger, anchor }` bindings. Forward buttonTrigger to one actual button; its event handler starts the business component's run. The trigger is the default anchor. Forward anchor to a different actual element only when placement should follow that element instead. Bindings do not inspect opaque component internals or supply coordinates. Exactly one target per supplied binding is allowed. Programmatic invocation still needs a connected anchor. Anchor removal or hiding under hidden/inert ends the unpresentable run with an error, including cleanup; a close guard cannot preserve an unusable attachment.

Default, header-extra, actions and footer slots receive `{ session }`; actions and footer are mutually exclusive. Supply arbitrary controls/forms as content; ordinary Tab behavior remains. Use UiMenu or choice controls when menu/selection keyboard semantics are required. UiTooltip remains noninteractive.

The backend may flip the preferred side and constrain size/position to the visual viewport. Placement follows scrolling, resizing and moving anchors. Exact offsets, native styling and arrow decoration are implementation-owned. Arrow-capable native backends retain their arrows; the arrow follows resolved placement and viewport adjustment rather than merely the requested side. Consumers do not supply arrow markup or CSS. See the [native arrow principle](../../guides/design-principles.md#native-arrows-on-anchored-surfaces) for composition scope and verification. Parent modal/overlay hosting keeps owned controls within the interaction. Nonmodal outside dismissal preserves focus on an outside destination; explicit closure restores the invoker when focus remained inside. Modal presentation additionally traps focus and locks background scrolling. Body content scrolls independently of header/footer.

There is no v-model open owner. Lifecycle hooks belong inside control.run(), ordinarily encapsulated in a reusable business component exposing a simple async method. Content mounts once per presented run and unmounts before teardown. Caller-owned controls can retain data beyond that lifetime. All enabled dismissal routes use the same beforeClose policy; completion and explicit cancellation remain available independently of closeOn. Teardown/deactivation interrupts the run.

Verify connected/separate anchors, name and ARIA relationships, trigger reactivation without duplicate runs, all outcomes, denied dismissal, stale callbacks, modal versus nonmodal operation, nested child popups/dialogs and focus return. DOM tests cover supporting backends; actual placement, clipping, keyboard navigation and zoom require browser acceptance.
