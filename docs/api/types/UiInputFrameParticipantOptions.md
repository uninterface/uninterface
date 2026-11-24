# UiInputFrameParticipantOptions

Setup-time integration callbacks for an admitted component. Import from `@uninterface/uninterface`.

```ts
interface UiInputFrameParticipantOptions {
  projection?: () => UiInputProjection | undefined
  disabled?: () => boolean
  readonly?: () => boolean
  focus?: () => Promise<boolean | null>
}
```

Omitting projection selects the whole string draft for an editor. A structured draft needs a named string projection. Local restrictions can only tighten the inherited frame/field restrictions. The editor focus callback reports actual native success/availability and must not activate actions. Composition/action/content roles do not consume editor values. Target/owner changes require a keyed remount, while labels and restrictions remain reactive. Core coordinates lifetime and guards; the extension/backend provides actual target mechanics. Verify unavailable/hidden targets, live restrictions, projection-owner errors and cleanup.

See [shared input frames](../../guides/input-frames.md).
