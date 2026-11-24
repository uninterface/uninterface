# Delegated control frames

A participating control can delegate its outer frame to a parent. The parent owns the boundary, background, outer padding and whole-control focus, validation-error and availability highlights. The child retains its editing behavior, value and validation ownership, accessible state, and actual disabled/readonly restrictions. A card or modal does not implicitly become a control-frame owner.

This is the low-level backend surface protocol, exported from `@uninterface/uninterface/backend`. Custom public frame children additionally use the explicit admission/value contract documented in [shared input frames](input-frames.md); this helper alone does not authorize crossing a custom-component boundary. Business compositions normally use [UiInputFrame and UiTextInput](input-frames.md); they do not set styling flags or pass frame bindings themselves. All five temporal range adapters use the same participation mechanism internally. Ordinary single-line UiTextInput participates through the core admission contract; structured values require explicit named projections. Unknown component wrappers must declare and forward participation. Other controls require explicit integration before claiming support.

## Ownership

| Concern | Owner |
|---|---|
| Input boundary, background, rounding and outer padding | Parent control frame |
| Whole-control focus, error and availability highlights | Parent control frame |
| Actual editing, disabled and readonly restrictions | Each editing target/action, under its existing control contract |
| Accessible name, invalid state and feedback associations | Each relevant editing target |
| Caret, text selection and active date/time segment | Editor |
| Focus indication identifying an action | Action |
| Validation rules, result and timing | Existing owning control/composition |
| Feedback message placement | Existing field presentation strategy |

A parent owns presentation of its existing state. It does not collect arbitrary child failures into a new validation model. Invalid-part attribution guides focus without creating an error. Suppressing inner error paint must never clear `binding.invalid` or `aria-invalid`. Whole-control highlight delegation preserves local segment selection and action focus: users must still be able to identify their keyboard target.

## Integration

Implement a cooperating editor with `useUiControlFrameParticipant({ focus, invalid })`. It returns `{ frame, setEngaged }`. `frame.owner` is `parent` when an owner exists in the logical Vue ancestry, otherwise `self`. Pass this binding to the backend view that paints the editor. Forward it through private wrappers without registering the same editor again. Do not fabricate `parent` without a real provider.

```ts
const { frame, setEngaged } = useUiControlFrameParticipant({
  focus: () => editor.value?.focus() ?? Promise.resolve(null),
  invalid: () => binding.value.invalid,
})
```

A supported editor view consumes `frame` separately from its value/control binding. Missing `frame` means self-owned presentation. Admitted framed editors supply a parent binding; standalone editors retain self-owned presentation. The adapter removes the inner surface and whole-control highlights in every state, including highlights injected by a native form context. A native borderless variant alone may leave a separate error ring active. Native APIs are preferred; scoped backend CSS can fulfill the remaining integration needs. Private classes and data attributes are implementation details, not business styling requirements.

Call `setEngaged(true)` when an owned popup opens and `setEngaged(false)` when it closes. The owner retains engagement while any registered participant reports it. A teleported popup remains a separate surface with its own keyboard/selection presentation. Opening and dismissal, Escape, focus return, and popup availability remain the editor's responsibility; the helper does not implement them. Report closure when interaction ends, including dismissal after moving away. Native browser pickers without observable lifecycle events do not claim explicit popup tracking.

`provideUiControlFrame({ disabled, focusEditor })` establishes an owner for cooperating descendants. It returns `focus()` and a readonly computed `engaged`. Focus tries active registered participants with invalid attribution first, then registration order, and finally the optional fallback. Participants remove their registration on disposal; deactivation excludes them and releases engagement. Nested control-frame owners are rejected. The provider handles no DOM, styling, availability inheritance, draft updates or validation.

For UiInputFrame views, `useUiInputFrameSurface` already establishes this provider and combines descendant DOM focus with reported popup engagement. Apply its `attrs` to the real surface, use its `focused` for native presentation and expose its `focus` method. Do not install a second provider. Public UiInputFrame uses its enter/leave notifications for the owning scalar or grouped field's validation lifecycle. The same helper is used by backend-internal temporal range frames.

## Acceptance

- Render one outer surface through ordinary, hover, focused, invalid, disabled and readonly states, without incidental geometry changes.
- Keep inner validation semantics and field feedback associations while suppressing independent error highlights. Exercise native form-context error inheritance, not just explicit editor props.
- Move between parts/actions and an owned popup without losing outer engagement. Closing or unmounting the popup participant releases engagement; ordinary departure is still observable.
- Prefer an attributed invalid part on frame focus. Skip unavailable or deactivated participants and remove unmounted registrations.
- Preserve segment selection, action focus, keyboard editing and popup focus return.
- Recheck each backend with its native theme and supported application customization. DOM tests establish ownership/lifecycle; real-browser checks establish paint and geometry.

See the complete [backend API](../api/backend/input-frames.md#control-frame-ownership) for signatures. Browser checks cover native/text endpoints and inherited error wrappers; execution remains part of backend visual acceptance.
