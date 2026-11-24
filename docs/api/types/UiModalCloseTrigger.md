# UiModalCloseTrigger

Built-in user dismissal routes accepted by [UiModal](../components/UiModal.md). Import the type from `@uninterface/uninterface`.

```ts
type UiModalCloseTrigger = 'close-button' | 'escape' | 'backdrop'
```

`close-button` displays the backend-native close affordance; `escape` permits Escape dismissal; `backdrop` permits a pointer gesture beginning and ending on the surrounding mask. The modal defaults to the first two. An explicit `closeOn` array replaces that set, including an empty array; order and duplicate entries have no effect.

These routes request cancellation through the session close policy. They do not govern explicit session methods, terminal failure or forced teardown. Their names also identify cancellation reasons. Core checks live configuration; backends own presentation, input handling and child-popup Escape ownership.

Verify default routes, backdrop opt-in, empty-array behavior, pending/denied decisions, configuration updates and cancellation reasons. See the [modal guide](../../guides/modals.md).
