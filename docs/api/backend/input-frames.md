# Input frames and cooperation

[Backend reference](README.md) · [API reference](../README.md)

Shared surfaces, participation and control-frame ownership.

### UiInputFrameViewProps

Backend `UiInputFrame.vue` owns the shared native-themed surface, logical leading/default/trailing slots and responsive interior spacing. `binding` identifies the frame, while `descriptionBinding` retains the owning field ID and invalid state for useUiFieldDescription. Never filter field feedback with the part/frame ID. `label` names the group, `readonly` describes edit restrictions, `dirty` permits native presentation and `focusEditor(): Promise<boolean | null>` is a fallback when no registered participant accepts focus. Expose the surface helper's `focus()` for external frame focus requests. Forward standard attributes to the surface. Emit `enter`/`leave` only across the complete DOM/registered-engagement boundary. Render semantic invalid/busy/disabled independently of visual failure policy. Do not use a label element as a multi-input frame or create a competing validation engine.

```ts
export interface UiInputFrameViewProps {
  binding: UiControlViewBinding
  descriptionBinding: UiControlViewBinding
  label: string
  readonly: boolean
  dirty: boolean
  focusEditor(): Promise<boolean | null>
}
```


### Ordinary editor/action cooperation

UiTextInputViewProps accepts optional frame, descriptionBinding, minWidthCharacters and maxWidthCharacters. The last is a positive integer maximum visible character capacity for framed editors, not maxlength. Apply a font-relative cap on the real editor allocation while allowing shrinkage and native input scrolling; changes must preserve editor identity. A parent frame delegates surface paint while binding retains the editor's own ID/attributed invalid state. Resolve feedback from descriptionBinding ?? binding so grouped messages retain their owner identity. Core supplies the accessible target name and selected string, and suppresses individual blur validation. type includes text/password/search; search cannot be multiline or use password reveal. Preserve native search clearing and input hints without duplicate actions. Apply shared-row allocation to the actual outer editor flex item. Native toolkit components may forward arbitrary attributes to the leaf input while accepting root classes separately; verify the rendered selector target instead of assuming an attribute lands on the wrapper. Keep the inner input filling its allocation.

UiButtonViewProps.frame is optional shared-surface intent. Core supplies effective disabled including loading and frame readonly opt-in policy; backends retain native submit/reset and identifiable focus. useUiButtonPresentation supplies a contextual text-action default after explicit/strategy requests. No action role requires stripping its native focus treatment.

UiSuggestionsViewProps.engagement?(boolean) reports actual popup engagement to core. useUiSuggestionsView reports visibility and releases on deactivation/disposal. This does not change query or acceptance ownership.


### UiInputFrameSpacer view

Backend `UiInputFrameSpacer.vue` renders a decorative, non-focusable, accessibility-hidden allocation with no binding, props, slots or events. It receives remaining inline space after editors have grown to their caps, using logical direction. Multiple spacers share remaining space. It must not compete equally for growth before editors reach their limits. Supplied backends use a zero-basis item and automatic logical start margin. No DOM/value content or validation owner is added. Declare `input.frame.sizing.v1` together with support for UiTextInputViewProps.maxWidthCharacters. Verify actual rendered editor roots, suffix proximity, end-action placement, narrow widths and RTL; selector checks alone do not prove geometry.


### useUiInputFrameSurface

Optional DOM helper taking UiInputFrameViewProps and an overloaded enter/leave emitter. Returns `{ focused, attrs, focus }`; apply attrs to the actual surface. It supplies group identity/state and focusin/focusout/click mechanics, checks the active DOM descendant after focusout, guards disposal and routes noninteractive clicks/root focus to registered participants, then focusEditor. It establishes a control-frame provider; do not provide one again in the same frame. Backends still own markup, feedback strategy, native styling and visible focus. Registered participants can retain engagement for owned popups. `focused` and enter/leave reflect DOM focus or participant engagement; `attrs` also exposes private `data-engaged` for backend styling. Form invalid-focus handling recognizes `data-ui-input-frame` on an invalid group or within it and focuses that surface to invoke the preferred part.

The `input.frame.cooperation.v1` capability adds ordinary editor/action integration to the input.frame.v1 surface, with distinct target identity/names, shared focus, availability and feedback; custom editor integration must explicitly fulfill the control-frame participation contract.


### Control-frame ownership

Exported from `@uninterface/uninterface/backend`; see [delegated control frames](../../guides/control-frames.md) for ownership, examples, limitations and observable checks.

```ts
export interface UiControlFrameBinding {
  readonly owner: 'self' | 'parent'
}
export interface UiControlFrameParticipantOptions {
  focus: UiFocusHandle['focus']
  invalid?(): boolean
}
export interface UiControlFrameOptions {
  disabled?(): boolean
  focusEditor?: UiFocusHandle['focus']
}
```

`UiTextInputViewProps.frame` and `UiTemporalEditorViewProps.frame` are optional UiControlFrameBinding values (omission means self). `UiButtonViewProps.frame` is also optional. Keep this presentation projection separate from UiControlViewBinding and producer-owned value bindings. Parent ownership delegates outer surface and whole-control state highlights, never semantic invalid state or editing restrictions.

`provideUiControlFrame(options?: UiControlFrameOptions)` establishes the logical provider and returns `{ focus(): Promise<boolean | null>, engaged: ComputedRef<boolean> }`. Disabled blocks focus. Invalid-attributed active participants are tried first in registration order, followed by other active participants and the optional fallback. It rejects nested providers. The owner supplies its own DOM mechanics, theme, state and restrictions; UiInputFrame views get the provider through useUiInputFrameSurface.

`useUiControlFrameParticipant(options: UiControlFrameParticipantOptions)` returns `{ frame: UiControlFrameBinding, setEngaged(value: boolean): void }`. Call once per editor in setup; without a provider, owner is self. Focus callbacks retain the common true/false/null result contract. `invalid` defaults false and attributes an existing error only. Report owned popup activity with setEngaged; closing releases it. Unmount unregisters; KeepAlive deactivation excludes the participant and clears engagement, reactivation restores its availability for focus. Calls after disposal have no effect. Popup lifecycle/focus return, value projections, field restrictions and validation remain the caller's responsibility. Forward frame to leaf views instead of registering one editor repeatedly.


### Minimum framed editor width

`UiTextInputViewProps.minWidthCharacters` requires `input.frame.min-width.v1`. Apply this minimum in `ch` to the real outer editor allocation, including through transparent context wrappers; do not set native minlength, limit text, or constrain only the leaf input while its wrapper collapses. The minimum participates in intrinsic sizing and flex shrinking and may overflow an insufficient host. Core rejects invalid bounds and minimum greater than maximum. Preserve optional maximum-width/spacer behavior, native editing and reactive identity. Test both width bounds, missing values, narrow hosts and the actual toolkit selector target.


