# UiModalRunOptions

Per-invocation hooks for `UiModalControl<T>.run()`. Import from `@uninterface/uninterface`.

```ts
interface UiModalRunOptions<T> {
  setup?(session: UiModalSession<T>): void | Promise<void>
  opened?(session: UiModalSession<T>): void | Promise<void>
  beforeClose?(request: UiModalCloseRequest<T>, session: UiModalSession<T>): boolean | Promise<boolean>
  teardown?(session: UiModalSession<T>, result: UiModalResult<T>): void | Promise<void>
}
```

Setup prepares the business target before presentation. Opened runs after mounting and modality; it may request focus or start content work. BeforeClose defaults to allowing, may await a child confirmation and must return a boolean. Teardown follows presentation cleanup, including partial setup failure. Its result argument is the outcome before any error thrown by teardown itself.

Hooks must terminate, cooperate with session.signal for asynchronous setup, and avoid awaiting the run's own result/disposal. Capture owned resources in the run closure. Teardown must tolerate incomplete setup. The modal never infers whether a form should reset, load or persist. Core catches hook failures before termination and relays them through the error outcome. Cleanup does not wait for asynchronous opened work, which could itself be awaiting completion. Such work must observe session.signal after awaits; late failures cannot replace a terminal outcome or affect another run. Required prerequisites belong in setup and cleanup in teardown.

Verify hook order, partial setup, teardown errors, cancellation and nested confirmation. See the [guide](../../guides/modals.md).
