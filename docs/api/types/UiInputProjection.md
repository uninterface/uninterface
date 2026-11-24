# UiInputProjection

An immutable named string projection created by createUiInputProjection. Import from `@uninterface/uninterface`.

```ts
interface UiInputProjection {
  readonly key: string
  readonly label: string
}
```

Key identifies a string property of one owning field draft; label may track a supplied reactive source. The factory privately retains the owner/update connection. Do not fabricate this interface or change its identity to retarget a mounted editor. Pass it through UiTextInput.projection or UiInputFrameParticipantOptions.projection. It creates neither a second draft nor independent validation. Core verifies owner/type; backends consume selected editor bindings. Verify unique targets, names, sibling-safe edits and owner reset.

See [shared input frames](../../guides/input-frames.md).
