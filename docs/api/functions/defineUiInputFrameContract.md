# defineUiInputFrameContract

Declares a component's discoverable participation responsibilities before setup/mount. Import from `@uninterface/uninterface`.

```ts
defineUiInputFrameContract({ role, forwards? }): UiInputFrameContract
```

`role` is editor, action, content or composition. `forwards` defaults false. The returned immutable metadata contains protocol `uninterface.input-frame`, version `1`, role and forwarding permission. Attach it as the Vue component definition's `uiInputFrame` option, using defineOptions in script setup or defineComponent in a render component.

The declaration author commits to implementing the matching runtime contract. It creates no owner, registers no target and forwards nothing by itself. Unknown roles throw. Frame discovery rejects absent/incompatible declarations instead of inspecting component internals or trusting names. Async/built-in wrappers are not implicitly unwrapped.

Core supplies discovery and typed runtime access; extension authors supply actual behavior and compatible native presentation. Verify metadata is visible before setup, unknown components fail at the boundary, and the declared implementation respects restrictions and cleanup.

See [shared input frames](../../guides/input-frames.md) for supported compositions and complete examples.
