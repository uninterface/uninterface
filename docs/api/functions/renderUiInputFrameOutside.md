# renderUiInputFrameOutside

Establishes an explicit outside scope for content owned by a cooperating popup or similar composition. Import from `@uninterface/uninterface`.

```ts
renderUiInputFrameOutside(children: readonly VNode[], participation: UiInputFrameParticipation): VNode
```

Requires an admitted forwarding handle. Returns a renderless boundary that clears automatic field, frame-admission and delegated-surface access for its content. It does not discover/admit these children into the parent frame. Editors there establish their own UiField. An independent frame inside that field owns a separate interaction.

The popup participant retains its own engagement handle and must report opening/closure, dismissal and focus return. Outside content can invoke explicit guarded owner operations supplied by its custom component. Physical teleportation alone does not isolate scope; this helper does. It adds no validation owner or persistence policy.

Verify popup editors update only their independent fields, parent engagement is retained while appropriate, and closing/unmounting releases engagement without stale callbacks. Native popup mechanics and rendering remain backend/extension responsibilities.

See [shared input frames](../../guides/input-frames.md) for supported compositions and complete examples.
