# UiInputFrameParticipation

Runtime handle returned by useUiInputFrameParticipant. Import from `@uninterface/uninterface`. It is scoped to one admitted component and must not be fabricated or shared as an unrestricted injection context.

```ts
interface UiInputFrameParticipation {
  readonly binding: ComputedRef<UiControlViewBinding>
  readonly descriptionBinding: ComputedRef<UiControlViewBinding>
  readonly readonly: ComputedRef<boolean>
  readonly frame: UiControlFrameBinding
  readonly label: ComputedRef<string>
  readonly value: ComputedRef<string>
  update(value: string): Promise<void>
  setEngaged(value: boolean): void
}
```

The binding contains target identity and semantic availability/invalid/busy state. descriptionBinding retains the owner field ID/feedback independently of target invalid attribution. frame supplies backend surface delegation. label names the target. Only editor roles read value or call update; other roles throw on these operations. Updates use the existing authoritative owner and ignore unavailable, readonly, deactivated/disposed requests. setEngaged retains the owning interaction while an actual popup is engaged; closure/deactivation/disposal releases it.

Forwarding helpers accept this handle only when its declared component permits forwarding. They preserve the owner and tightened restrictions. Core manages admission/coordination; backend/extension views apply real restrictions, names, feedback and focus. Verify no unauthorized inheritance, sibling-safe updates, shared blur timing and popup cleanup.

See [shared input frames](../../guides/input-frames.md).
