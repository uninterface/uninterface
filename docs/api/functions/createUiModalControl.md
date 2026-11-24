# createUiModalControl

Creates a reusable `UiModalControl<T>` with no form or backend instance dependency. Import from `@uninterface/uninterface`.

```ts
const modal = createUiModalControl<Customer>()
const result = await modal.run(options)
```

No arguments. The returned factory-created object owns run state, accepts per-run hooks and exposes asynchronous disposal. Attach it to one declared UiModal before invoking run. It is not a class or global modal service. Missing attachment, concurrent invocation and use after disposal produce error outcomes.

The business owner controls lifetime and must dispose when it ends. Core coordinates guarded transitions and stale callbacks; the attached backend supplies presentation. Verify sequential reuse, rejected concurrency and all result paths. See [UiModalControl](../types/UiModalControl.md) and the [guide](../../guides/modals.md).
