# UiModalControl

Factory-created modal interaction owner returned by `createUiModalControl<T>()`. Import the type from `@uninterface/uninterface`.

- `state.phase`: readonly `idle | setup | opening | open | closing`.
- `state.pendingClose`: readonly pending business close decision.
- `state.session`: readonly current `UiModalSession<T>` or undefined.
- `run(options?: UiModalRunOptions<T>): Promise<UiModalResult<T>>`: start one invocation; concurrent calls return an error outcome without affecting it.
- `dispose(): Promise<void>`: permanently stop new runs, abort pending setup and settle the active run after cleanup. Idempotent.

A completed run permits a fresh subsequent run; its old callbacks cannot affect the new one. Setup/teardown belong to the invocation, not automatically to a form. One view can attach at a time. Hooks must cooperate with cancellation and must not await their own run/disposal. See the [modal guide](../../guides/modals.md) for usage and limits.

Core supplies transition guarantees; backends implement the presentation lifecycle; business code owns hosted resources. Verify read-only observations, all terminal outcomes, teardown ordering, concurrency and disposal races.
