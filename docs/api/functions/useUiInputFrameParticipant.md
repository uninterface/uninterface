# useUiInputFrameParticipant

Consumes the current component's admitted participation in setup. Import from `@uninterface/uninterface`. Custom components must also declare their static contract.

```ts
useUiInputFrameParticipant(options?: UiInputFrameParticipantOptions)
  : UiInputFrameParticipation | undefined
```

Outside a frame it returns undefined; a component must support that state or explicitly require a frame. Inside an admitted boundary it supplies computed value/state/name, backend surface intent, guarded updates and owned-popup engagement. Descendants without explicit forwarding throw rather than inheriting a whole-field binding. A separate UiField in outside popup content establishes its own scope.

Options select an editor projection and focus callback; every role may supply live local disabled/readonly getters to tighten restrictions, including those forwarded to children. Only editor roles consume value/update; composition/action/content roles do not acquire a value merely by participating. Register once per logical editor; backend views consume its surface binding rather than registering the same editor twice. Focus callbacks must report false/null when unavailable and preserve selection/native focus semantics.

Updates are ignored when disabled/readonly, deactivated or disposed. They retain the owner's existing update/validation policy, without another field owner. Owned popup engagement releases on deactivation/disposal and ignores late callbacks. Keys/owners cannot change without a keyed remount. Duplicate editor targets throw.

Verify genuine custom value updates, restrictions, field feedback, focus priority, popup engagement/closure, teardown and outside-frame behavior. Backends remain responsible for target attributes, native presentation and focus mechanics.

See [shared input frames](../../guides/input-frames.md) for supported compositions and complete examples.
