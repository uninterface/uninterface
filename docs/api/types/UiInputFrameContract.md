# UiInputFrameContract

Static component metadata used for discovery. Import from `@uninterface/uninterface` and construct with defineUiInputFrameContract.

```ts
interface UiInputFrameContract {
  readonly protocol: 'uninterface.input-frame'
  readonly version: 1
  readonly role: 'editor' | 'action' | 'content' | 'composition'
  readonly forwards: boolean
}
```

Editors own a focus target and consume a value/projection. Actions retain activation semantics. Content supplies passive presentation. Compositions coordinate internal content without acquiring an editor value. Forwarding is a separate permission, not automatic descendant inheritance. The contract must be fulfilled by the component implementation; metadata cannot certify arbitrary callbacks. Core discovers/version-checks declarations, while extensions/backends implement their native responsibilities. Verify admission errors and explicit forwarding.

See [shared input frames](../../guides/input-frames.md).
