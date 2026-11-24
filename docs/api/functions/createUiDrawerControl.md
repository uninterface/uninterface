# createUiDrawerControl

Creates a factory-created `UiOverlayControl<T>` for an awaitable drawer interaction. Import from `@uninterface/uninterface`.

```ts
const control = createUiDrawerControl<Customer>()
const result = await control.run({ setup, opened, beforeClose, teardown })
```

No factory arguments; the generic defaults to void. Attach one corresponding declared view before run. Drawer controls apply to modal mode only; persistent panel drawers use expansion ownership instead. Encapsulate the control and hooks inside a business component, expose its business method with defineExpose, and dispose the control when that owner ends.

The shared lifecycle engine supplies exactly-once settlement after presentation cleanup and teardown, denial of concurrent invocations, stale-session protection and partial-setup cleanup. See [UiOverlayControl](../types/UiOverlayControl.md) and the [guide](../../guides/drawers-and-popovers.md). Verify sequential reuse, missing view, owner disposal, guarded dismissal and cleanup failures. Backend presentation does not replace the control's state.
